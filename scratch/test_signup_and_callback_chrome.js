const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testSignupAndCallbackInChrome() {
    console.log('=== TESTING SIGNUP & CALLBACK PAGES IN REAL CHROME ===');

    const tempProfile = path.join(os.tmpdir(), 'chrome-test-profile-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9224',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        'http://127.0.0.1:8080/signup.html'
    ]);

    chrome.on('exit', (code) => console.log('Chrome exited:', code));

    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        try {
            const res = await fetch('http://127.0.0.1:9224/json/list');
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

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
            const p = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) p.reject(msg.error);
            else p.resolve(msg.result);
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    await new Promise(r => setTimeout(r, 1500));

    // Test 1: Load signup page and fill with existing email to verify duplicate detection
    console.log('Filling in signup form with existing account...');
    await send('Runtime.evaluate', { expression: `
        document.getElementById('signup-name').value = 'Ashokh L';
        document.getElementById('auth-identifier').value = 'lakkimsettirahulashokh@gmail.com';
        document.getElementById('auth-password').value = 'Student@123';
        document.getElementById('signup-confirm').value = 'Student@123';
        document.getElementById('terms-consent-checkbox').checked = true;
        document.getElementById('husky-auth-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    `});

    await new Promise(r => setTimeout(r, 3000));

    // Check toast / redirection
    const urlEval = await send('Runtime.evaluate', { expression: 'window.location.href' });
    console.log('URL after existing user signup attempt:', urlEval.result.value);

    // Test 2: Load auth-callback.html and verify UI
    console.log('Navigating to auth-callback.html...');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/auth-callback.html' });
    await new Promise(r => setTimeout(r, 2000));

    const callbackDom = await send('Runtime.evaluate', {
        expression: '({ title: document.title, errorTitle: document.getElementById("error-title")?.textContent, errorVisible: !document.getElementById("callback-error")?.classList.contains("hidden") })',
        returnByValue: true
    });
    console.log('Callback page without params state:', callbackDom.result.value);

    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch(e) {}
}

testSignupAndCallbackInChrome().catch(console.error);
