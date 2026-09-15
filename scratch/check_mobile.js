const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function checkMobile() {
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const chromeProc = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=' + path.join(__dirname, 'chrome_test_profile_mobile')
    ]);

    await new Promise(r => setTimeout(r, 2000));

    try {
        const newTabResp = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
        const tab = await newTabResp.json();
        const ws = new globalThis.WebSocket(tab.webSocketDebuggerUrl);

        await new Promise((res, rej) => {
            ws.onopen = res;
            ws.onerror = rej;
        });

        let id = 1;
        const pending = new Map();
        ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            if (pending.has(parsed.id)) {
                pending.get(parsed.id)(parsed.result);
                pending.delete(parsed.id);
            }
        };

        function send(method, params = {}) {
            return new Promise((resolve) => {
                const msgId = id++;
                pending.set(msgId, resolve);
                ws.send(JSON.stringify({ id: msgId, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');
        // Set mobile viewport BEFORE navigating
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 1,
            mobile: true
        });

        await send('Page.navigate', { url: 'http://127.0.0.1:8080/login.html' });
        await new Promise(r => setTimeout(r, 2000));

        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const btn = document.getElementById('google-sso-btn');
                const rect = btn ? btn.getBoundingClientRect() : null;
                const card = document.querySelector('.husky-auth-card');
                const cardRect = card ? card.getBoundingClientRect() : null;
                return {
                    hasBtn: !!btn,
                    rect: rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null,
                    cardWidth: cardRect ? cardRect.width : 0
                };
            })()`,
            returnByValue: true
        });

        console.log('Mobile Check Result:', JSON.stringify(res.result.value, null, 2));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(__dirname, 'login_mobile.png'), Buffer.from(screenshot.data, 'base64'));
        console.log('Mobile screenshot saved.');

        ws.close();
    } finally {
        chromeProc.kill('SIGKILL');
    }
}

checkMobile();
