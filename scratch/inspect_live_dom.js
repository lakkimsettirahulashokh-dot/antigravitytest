const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debuggingPort = 9228;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

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

        const newTabRes = await fetch(`http://127.0.0.1:${debuggingPort}/json/new?about:blank`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const ws = new WebSocket(tabInfo.webSocketDebuggerUrl);
        await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

        const networkLogs = [];
        const consoleLogs = [];

        ws.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.method === 'Network.responseReceived') {
                networkLogs.push({
                    url: data.params.response.url,
                    status: data.params.response.status,
                    mimeType: data.params.response.mimeType
                });
            } else if (data.method === 'Runtime.consoleAPICalled') {
                consoleLogs.push({
                    type: data.params.type,
                    args: data.params.args.map(a => a.value || a.description).join(' ')
                });
            }
        });

        await sendCDP(ws, 'Network.enable');
        await sendCDP(ws, 'Runtime.enable');
        await sendCDP(ws, 'Page.enable');

        await sendCDP(ws, 'Page.navigate', { url: 'https://tech-path-six.vercel.app/' });
        await sleep(5000);

        const evalRes = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const logo = document.querySelector('header a img');
                const canvas = document.querySelector('#btech-3d-bg-canvas');
                const heroCanvas = document.querySelector('#hero-3d-canvas') || document.querySelector('canvas');
                const materialSymbols = document.fonts.check('24px "Material Symbols Outlined"');
                const geistFont = document.fonts.check('16px "Geist"');
                
                return JSON.stringify({
                    logo: logo ? {
                        src: logo.src,
                        currentSrc: logo.currentSrc,
                        naturalWidth: logo.naturalWidth,
                        naturalHeight: logo.naturalHeight,
                        offsetParent: !!logo.offsetParent,
                        computedDisplay: window.getComputedStyle(logo).display,
                        bounds: logo.getBoundingClientRect()
                    } : null,
                    canvas: canvas ? {
                        id: canvas.id,
                        width: canvas.width,
                        height: canvas.height,
                        computedDisplay: window.getComputedStyle(canvas).display,
                        bounds: canvas.getBoundingClientRect()
                    } : null,
                    allCanvases: Array.from(document.querySelectorAll('canvas')).map(c => ({
                        id: c.id,
                        className: c.className,
                        width: c.width,
                        height: c.height,
                        bounds: c.getBoundingClientRect()
                    })),
                    fonts: {
                        materialSymbols,
                        geistFont,
                        totalLoadedFonts: document.fonts.size
                    },
                    threeGlobal: typeof window.THREE !== 'undefined',
                    scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
                });
            })()`,
            returnByValue: true
        });

        console.log('\n--- LIVE DOM INSPECTION ---');
        console.log(evalRes.result.value);

        console.log('\n--- NETWORK RESPONSES ---');
        console.log(`Total responses: ${networkLogs.length}`);
        networkLogs.forEach(r => {
            if (r.status >= 400 || r.url.includes('font') || r.url.includes('logo') || r.url.includes('3d') || r.url.includes('.js') || r.url.includes('.css')) {
                console.log(`[${r.status}] [${r.mimeType}] ${r.url}`);
            }
        });

        console.log('\n--- CONSOLE LOGS ---');
        consoleLogs.forEach(c => console.log(`[CONSOLE ${c.type}] ${c.args}`));

        ws.close();
        chromeProcess.kill();
    } catch (err) {
        console.error('Error:', err);
        chromeProcess.kill();
    }
}

run();
