const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9232;
const ARTIFACTS_DIR = 'C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\9b69a063-24cd-4e1a-a928-16f7602527b3';

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

async function evalScript(ws, expression) {
    return sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
}

async function captureScreenshot(ws, filename) {
    const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 Screenshot saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function run() {
    const chromeProc = spawn(CHROME_PATH, [
        '--headless=new',
        `--remote-debugging-port=${PORT}`,
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-webgl',
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=1440,900'
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

        const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const ws = new WebSocket(tabInfo.webSocketDebuggerUrl);
        await new Promise(resolve => ws.addEventListener('open', resolve));

        await sendCDP(ws, 'Page.enable');
        await sendCDP(ws, 'Runtime.enable');

        // Set session
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/index.html' });
        await sleep(1000);

        const testUser = {
            id: 'usr_test_alex_rivera',
            email: 'alex.rivera@btechpath.ai',
            name: 'Alex Rivera',
            full_name: 'Alex Rivera',
            branch: 'AIML',
            department_id: 'AIML',
            semester: 6,
            targetCareer: 'Machine Learning Engineer',
            target_role: 'Machine Learning Engineer',
            tier: 'Engineering Scholar',
            role: 'student',
            avatar: null,
            avatar_url: null,
            onboarding_completed: true,
            streak: 4,
            xp: 4120
        };
        await evalScript(ws, `
            localStorage.setItem('btechpath_user_session', '${JSON.stringify(testUser)}');
            localStorage.setItem('btech_user_profile', '${JSON.stringify(testUser)}');
            // Disable initial splash delay for instantaneous capture
            sessionStorage.setItem('app_loading_shown', 'true');
        `);

        // 1. Home Page after splash
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/index.html' });
        await sleep(3500);
        await captureScreenshot(ws, '3d_bg_home_hero_verified.png');

        // 2. Dashboard
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/dashboard.html' });
        await sleep(3500);
        await captureScreenshot(ws, '3d_bg_dashboard_live_verified.png');

        ws.close();
    } finally {
        chromeProc.kill();
    }
}

run();
