const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sendCDP(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 1000000);
        const messageHandler = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === id) {
                ws.removeEventListener('message', messageHandler);
                if (data.error) reject(data.error);
                else {
                    if (data.result && data.result.result && data.result.result.value !== undefined) {
                        resolve(data.result.result.value);
                    } else if (data.result && data.result.result) {
                        resolve(data.result.result);
                    } else {
                        resolve(data.result);
                    }
                }
            }
        };
        ws.addEventListener('message', messageHandler);
        ws.send(JSON.stringify({ id, method, params }));
    });
}

async function run() {
    console.log('📱 Testing Mobile Viewport (390x844 iPhone 13/14 format)...');
    const chromeProc = spawn(CHROME_PATH, [
        '--headless=new',
        `--remote-debugging-port=${PORT}`,
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=390,844'
    ], { stdio: 'ignore' });

    try {
        let wsUrl = null;
        for (let i = 0; i < 20; i++) {
            await sleep(300);
            try {
                const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
                if (res.ok) {
                    const info = await res.json();
                    wsUrl = info.webSocketDebuggerUrl;
                    break;
                }
            } catch (e) {}
        }

        const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:8080/reviews`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const ws = new WebSocket(tabInfo.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
            ws.onopen = resolve;
            ws.onerror = reject;
        });

        await sendCDP(ws, 'Page.enable');
        await sendCDP(ws, 'Runtime.enable');
        await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 3,
            mobile: true
        });

        // Wait for elements
        for (let i = 0; i < 30; i++) {
            await sleep(300);
            const ready = await sendCDP(ws, 'Runtime.evaluate', {
                expression: `document.readyState === 'complete' && !!document.getElementById('form-name')`,
                returnByValue: true
            });
            if (ready === true) break;
        }

        // Open Modal and type
        await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const btn = document.getElementById('btn-open-review-form');
                if (btn) btn.click();
                const name = document.getElementById('form-name');
                if (name) {
                    name.focus();
                    name.value = 'Priya Sharma (Mobile Test)';
                    name.dispatchEvent(new Event('input', { bubbles: true }));
                }
                const review = document.getElementById('form-review-text');
                if (review) {
                    review.focus();
                    review.value = 'Tested on mobile portrait viewport. Background stays solid dark, input is smooth and ivory text is crystal clear!';
                    review.dispatchEvent(new Event('input', { bubbles: true }));
                }
                const star4 = document.querySelector('#star-picker-container button[data-star="4"]');
                if (star4) star4.click();
            })()`
        });
        await sleep(500);

        const screenshotRes = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
        const artifactMobilePath = path.join('C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\9b69a063-24cd-4e1a-a928-16f7602527b3', 'review_modal_mobile_verified.png');
        fs.writeFileSync(artifactMobilePath, Buffer.from(screenshotRes.data, 'base64'));
        console.log('📸 Mobile screenshot saved to:', artifactMobilePath);

    } finally {
        chromeProc.kill();
    }
}

run().catch(e => {
    console.error('Mobile test failed:', e);
    process.exit(1);
});
