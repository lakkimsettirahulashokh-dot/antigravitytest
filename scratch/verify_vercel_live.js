const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debuggingPort = 9227;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sendCDP(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 1000000);
        const handler = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === id) {
                ws.removeEventListener('message', handler);
                if (data.error) reject(data.error);
                else resolve(data.result);
            }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
    });
}

async function run() {
    console.log('[Test] Spawning Chrome on port', debuggingPort);
    const chromeProcess = spawn(chromePath, [
        `--remote-debugging-port=${debuggingPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=1440,900',
        'about:blank'
    ]);

    try {
        let wsUrl = null;
        for (let i = 0; i < 20; i++) {
            await sleep(300);
            try {
                const res = await fetch(`http://127.0.0.1:${debuggingPort}/json/version`);
                if (res.ok) {
                    const info = await res.json();
                    wsUrl = info.webSocketDebuggerUrl;
                    break;
                }
            } catch (e) {}
        }

        if (!wsUrl) throw new Error('Could not connect to Chrome debugging port.');

        const newTabRes = await fetch(`http://127.0.0.1:${debuggingPort}/json/new?about:blank`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const tabWsUrl = tabInfo.webSocketDebuggerUrl;

        const ws = new WebSocket(tabWsUrl);
        await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

        const networkRequests = [];
        const consoleMessages = [];

        ws.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.method === 'Network.responseReceived') {
                const resp = data.params.response;
                networkRequests.push({
                    url: resp.url,
                    status: resp.status,
                    mimeType: resp.mimeType
                });
            } else if (data.method === 'Network.loadingFailed') {
                networkRequests.push({
                    requestId: data.params.requestId,
                    errorText: data.params.errorText,
                    type: data.params.type,
                    failed: true
                });
            } else if (data.method === 'Log.entryAdded') {
                consoleMessages.push(data.params.entry);
            } else if (data.method === 'Runtime.consoleAPICalled') {
                consoleMessages.push({
                    type: data.params.type,
                    text: data.params.args.map(a => a.value || a.description).join(' ')
                });
            }
        });

        await sendCDP(ws, 'Network.enable');
        await sendCDP(ws, 'Log.enable');
        await sendCDP(ws, 'Runtime.enable');
        await sendCDP(ws, 'Page.enable');

        console.log('[Test] Navigating to https://tech-path-six.vercel.app/ ...');
        await sendCDP(ws, 'Page.navigate', { url: 'https://tech-path-six.vercel.app/' });

        await sleep(6000);

        // Evaluate styles, DOM, and 3D Canvas
        const evalRes = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                const bodyFont = window.getComputedStyle(document.body).fontFamily;
                const canvas = document.querySelector('#btech-3d-bg-canvas') || document.querySelector('canvas');
                const logo = document.querySelector('img[src*="logo"], img[alt*="TechPath"]');
                const cards = document.querySelectorAll('.glass-card, .card, [class*="glass"]');
                const computedH1 = document.querySelector('h1') ? window.getComputedStyle(document.querySelector('h1')).color : null;
                
                return {
                    title: document.title,
                    bodyBg,
                    bodyFont,
                    computedH1Color: computedH1,
                    canvasPresent: !!canvas,
                    canvasWidth: canvas ? canvas.width : 0,
                    canvasHeight: canvas ? canvas.height : 0,
                    canvasStyleDisplay: canvas ? window.getComputedStyle(canvas).display : null,
                    logoPresent: !!logo,
                    logoSrc: logo ? logo.src : null,
                    logoNaturalWidth: logo ? logo.naturalWidth : 0,
                    cardsCount: cards.length,
                    stylesheetsCount: document.styleSheets.length,
                    stylesheets: Array.from(document.styleSheets).map(s => {
                        try { return { href: s.href, rulesCount: s.cssRules ? s.cssRules.length : 0 }; } catch(e) { return { href: s.href, error: e.message }; }
                    })
                };
            })()`,
            returnByValue: true
        });

        console.log('\n--- EVALUATION RESULTS ---');
        console.log(JSON.stringify(evalRes.result ? evalRes.result.value : evalRes, null, 2));

        // Take screenshot
        const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
        const screenshotPath = path.join(__dirname, 'vercel_preview_live.png');
        fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
        console.log('\n[Test] Screenshot saved to', screenshotPath);

        console.log('\n--- NETWORK REQUESTS SUMMARY ---');
        const failedRequests = networkRequests.filter(r => r.failed || r.status >= 400);
        console.log(`Total responses received: ${networkRequests.length}`);
        console.log(`Failed / 4xx / 5xx requests: ${failedRequests.length}`);
        if (failedRequests.length > 0) {
            console.log('Failed Requests:', JSON.stringify(failedRequests, null, 2));
        } else {
            console.log('✅ ALL responses returned HTTP 200/Success!');
        }

        console.log('\n--- CONSOLE ERRORS ---');
        const errors = consoleMessages.filter(m => m.level === 'error' || m.type === 'error');
        console.log(`Errors count: ${errors.length}`);
        errors.forEach(e => console.log('  [CONSOLE ERROR]', e));

        ws.close();
        chromeProcess.kill();
    } catch (err) {
        console.error('Error during test:', err);
        chromeProcess.kill();
    }
}

run();
