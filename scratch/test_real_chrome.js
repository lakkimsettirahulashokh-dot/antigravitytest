const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testInRealChrome() {
    console.log('=== LAUNCHING REAL CHROME TO TEST LOGIN -> DASHBOARD ===');

    const tempProfile = path.join(os.tmpdir(), 'chrome-test-profile-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        '--disable-features=Translate',
        'http://127.0.0.1:8080/login.html'
    ]);

    let exited = false;
    chrome.on('exit', (code) => {
        exited = true;
        console.log('Chrome process exited with code:', code);
    });

    // Wait for CDP endpoint
    console.log('Waiting for Chrome DevTools endpoint...');
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        try {
            const res = await fetch('http://127.0.0.1:9222/json/list');
            if (res.ok) {
                const targets = await res.json();
                const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
                if (pageTarget) {
                    wsUrl = pageTarget.webSocketDebuggerUrl;
                    break;
                }
            }
        } catch (e) {}
    }

    if (!wsUrl) {
        console.error('Could not connect to Chrome CDP endpoint!');
        chrome.kill();
        return;
    }

    console.log('Connected to Chrome CDP:', wsUrl);
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const pending = new Map();

    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const msgId = id++;
            pending.set(msgId, { resolve, reject });
            ws.send(JSON.stringify({ id: msgId, method, params }));
        });
    }

    const consoleLogs = [];
    const errors = [];

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
            const p = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) p.reject(msg.error);
            else p.resolve(msg.result);
        }

        if (msg.method === 'Runtime.consoleAPICalled') {
            const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
            const logLine = `[BROWSER CONSOLE ${msg.params.type.toUpperCase()}] ${args}`;
            consoleLogs.push(logLine);
            console.log(logLine);
        } else if (msg.method === 'Runtime.exceptionThrown') {
            const ex = msg.params.exceptionDetails;
            const errLine = `[BROWSER EXCEPTION] ${ex.text} ${ex.exception?.description || ''}`;
            errors.push(errLine);
            console.error(errLine);
        } else if (msg.method === 'Network.requestWillBeSent') {
            if (msg.params.request.url.includes('auth') || msg.params.request.url.includes('profiles')) {
                console.log(`[NETWORK REQ] ${msg.params.request.method} ${msg.params.request.url}`);
            }
        } else if (msg.method === 'Network.responseReceived') {
            if (msg.params.response.url.includes('auth') || msg.params.response.url.includes('profiles')) {
                console.log(`[NETWORK RES] ${msg.params.response.status} ${msg.params.response.url}`);
            }
        }
    };

    await new Promise(r => ws.onopen = r);
    console.log('WebSocket connected. Initializing CDP domains...');

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');

    console.log('Waiting for login page to load...');
    await new Promise(r => setTimeout(r, 2000));

    console.log('Filling in login form in real Chrome...');
    const fillScript = `
        (() => {
            const idInput = document.getElementById('auth-identifier');
            const passInput = document.getElementById('auth-password');
            if (idInput && passInput) {
                idInput.value = 'lakkimsettirahulashokh@gmail.com';
                passInput.value = 'Student@123';
                idInput.dispatchEvent(new Event('input', { bubbles: true }));
                passInput.dispatchEvent(new Event('input', { bubbles: true }));
                return { filled: true };
            }
            return { filled: false };
        })()
    `;
    const fillRes = await send('Runtime.evaluate', { expression: fillScript, returnByValue: true });
    console.log('Form fill result:', fillRes.result.value);

    console.log('Submitting login form in real Chrome...');
    const submitScript = `
        (() => {
            const form = document.getElementById('husky-auth-form');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                return { submitted: true };
            }
            return { submitted: false };
        })()
    `;
    const submitRes = await send('Runtime.evaluate', { expression: submitScript, returnByValue: true });
    console.log('Submit result:', submitRes.result.value);

    // Monitor for 8 seconds
    console.log('\n--- MONITORING NEXT 8 SECONDS OF BROWSER ACTIVITY ---');
    for (let sec = 1; sec <= 8; sec++) {
        await new Promise(r => setTimeout(r, 1000));
        const urlEval = await send('Runtime.evaluate', { expression: 'window.location.href' });
        const currentUrl = urlEval.result.value;
        const splashEval = await send('Runtime.evaluate', { 
            expression: 'Boolean(document.getElementById("auth-splash-loader") && !document.getElementById("auth-splash-loader").classList.contains("opacity-0") && document.getElementById("auth-splash-loader").style.display !== "none")' 
        });
        const isSplashVisible = splashEval.result.value;
        const dashEval = await send('Runtime.evaluate', {
            expression: 'Boolean(document.getElementById("dashboard-greeting-text"))'
        });
        const isDashGreetingVisible = dashEval.result.value;

        console.log(`[T+${sec}s] URL: ${currentUrl} | Splash Visible: ${isSplashVisible} | Dashboard Greeting: ${isDashGreetingVisible}`);
        
        if (currentUrl.includes('dashboard.html') && !isSplashVisible && isDashGreetingVisible) {
            console.log('🎉 SUCCESS! DASHBOARD IS VISIBLE AND SPLASH IS GONE!');
            break;
        }
    }

    console.log('\nFinal URL & DOM check...');
    const finalUrlEval = await send('Runtime.evaluate', { expression: 'window.location.href' });
    const finalUrl = finalUrlEval.result.value;
    const finalDomEval = await send('Runtime.evaluate', { 
        expression: '({ title: document.title, greeting: document.getElementById("dashboard-greeting-text")?.textContent, splash: Boolean(document.getElementById("auth-splash-loader")) })',
        returnByValue: true 
    });
    console.log('Final URL:', finalUrl);
    console.log('Final DOM Details:', finalDomEval.result.value);

    // Clean up
    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch(e) {}
}

testInRealChrome().catch(console.error);
