const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
    console.log('=== TESTING REAL BROWSER LOGIN FLOW WITH WAIT ===');
    const tempProfile = path.join(os.tmpdir(), 'chrome-test-repro-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9223',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        'http://127.0.0.1:8080/login.html'
    ]);

    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 400));
        try {
            const res = await fetch('http://127.0.0.1:9223/json/list');
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
        console.error('Failed to get CDP wsUrl');
        chrome.kill();
        return;
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

        if (msg.method === 'Runtime.consoleAPICalled') {
            const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
            console.log(`[BROWSER ${msg.params.type.toUpperCase()}] ${args}`);
        } else if (msg.method === 'Runtime.exceptionThrown') {
            console.error(`[BROWSER ERROR] ${msg.params.exceptionDetails.text} ${msg.params.exceptionDetails.exception?.description || ''}`);
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');

    console.log('Waiting for SupabaseBridge to initialize...');
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const initCheck = await send('Runtime.evaluate', {
            expression: 'Boolean(window.SupabaseBridge && window.SupabaseBridge.isInitialized)'
        });
        if (initCheck.result.value) {
            console.log('SupabaseBridge is initialized!');
            break;
        }
    }

    console.log('Directly executing handleLoginSubmit...');
    const result = await send('Runtime.evaluate', {
        expression: `(async () => {
            return await window.AuthManager.handleLoginSubmit(null, {
                identifier: 'test_1789320265384@example.com',
                password: 'Password@123!'
            });
        })()`,
        awaitPromise: true,
        returnByValue: true
    });
    console.log('handleLoginSubmit returned:', result.result.value);

    for (let s = 1; s <= 10; s++) {
        await new Promise(r => setTimeout(r, 1000));
        const evalRes = await send('Runtime.evaluate', {
            expression: `({
                url: window.location.href,
                splashExists: Boolean(document.getElementById('auth-splash-loader')),
                splashVisible: document.getElementById('auth-splash-loader') ? (!document.getElementById('auth-splash-loader').classList.contains('opacity-0') && document.getElementById('auth-splash-loader').style.display !== 'none') : false,
                splashText: document.getElementById('auth-splash-status')?.textContent || '',
                dashGreeting: document.getElementById('dashboard-greeting-text')?.textContent || null,
                bodyText: document.body.innerText.substring(0, 100)
            })`,
            returnByValue: true
        });
        console.log(`[T+${s}s]`, evalRes.result.value);
    }

    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch(e) {}
}

main().catch(console.error);
