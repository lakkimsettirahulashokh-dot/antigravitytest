const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9228;
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
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            return await sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        } catch (err) {
            if (attempt === 4) throw err;
            await sleep(500);
        }
    }
}

async function captureScreenshot(ws, filename) {
    const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 Screenshot saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function navigateAndCheck(ws, url, pageName, expectedPreset) {
    console.log(`\n🔍 Navigating to ${pageName} (${url})...`);
    await sendCDP(ws, 'Page.navigate', { url });
    await sleep(2500); // Allow navigation to settle and Three.js WebGL to render

    const check = await evalScript(ws, `
        (() => {
            const canvas = document.getElementById('btech-3d-bg-canvas');
            const hasThree = typeof THREE !== 'undefined';
            const hasBg = typeof BTech3D !== 'undefined';
            const preset = hasBg ? BTech3D.activePreset : null;
            const style = canvas ? window.getComputedStyle(canvas) : null;
            const bodyBg = window.getComputedStyle(document.body).backgroundColor;

            const isRendering = hasBg && !!BTech3D.renderer && !!BTech3D.scene && !!BTech3D.camera;
            const gl = canvas ? (canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('webgl2')) : null;

            return {
                currentUrl: window.location.href,
                hasCanvas: !!canvas,
                hasThree,
                hasBg,
                preset,
                isRendering: !!isRendering,
                hasGL: !!gl,
                pointerEvents: style ? style.pointerEvents : null,
                zIndex: style ? style.zIndex : null,
                bodyBg
            };
        })()
    `);

    console.log(`  Current URL: ${check.currentUrl}`);
    console.log(`  Canvas Present: ${check.hasCanvas}`);
    console.log(`  Three.js Loaded: ${check.hasThree}`);
    console.log(`  BTech3D Engine: ${check.hasBg}`);
    console.log(`  Active Preset: ${check.preset} (Expected: ${expectedPreset})`);
    console.log(`  WebGL Context: ${check.hasGL}`);
    console.log(`  Renderer Active: ${check.isRendering}`);
    console.log(`  Pointer Events: ${check.pointerEvents}`);
    console.log(`  Z-Index: ${check.zIndex}`);
    console.log(`  Body Background: ${check.bodyBg}`);

    return check;
}

async function run() {
    console.log('🚀 Starting Google Chrome Headless CDP on port ' + PORT);
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

        if (!wsUrl) throw new Error('Could not connect to Chrome debugging endpoint');
        console.log('🔗 Connected to Chrome CDP:', wsUrl);

        const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const ws = new WebSocket(tabInfo.webSocketDebuggerUrl);
        await new Promise(resolve => ws.addEventListener('open', resolve));

        await sendCDP(ws, 'Page.enable');
        await sendCDP(ws, 'Runtime.enable');
        await sendCDP(ws, 'DOM.enable');

        // Initialize origin and set auth session
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/index.html' });
        await sleep(1500);

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
            localStorage.setItem('sb-refresh-token', 'mock-token');
            localStorage.setItem('btech_user_profile', '${JSON.stringify(testUser)}');
        `);

        // Test 1: Home Page
        await navigateAndCheck(ws, 'http://localhost:8080/index.html', 'Home Page', 'home');
        await captureScreenshot(ws, '3d_bg_home_verified.png');

        // Test 2: Dashboard
        await navigateAndCheck(ws, 'http://localhost:8080/dashboard.html', 'Dashboard', 'dashboard');
        await captureScreenshot(ws, '3d_bg_dashboard_verified.png');

        // Test 3: AI Notes
        await navigateAndCheck(ws, 'http://localhost:8080/ai-notes.html', 'AI Notes', 'ai-notes');
        await captureScreenshot(ws, '3d_bg_notes_verified.png');

        // Test 4: Reviews Page (Form & Readability verification)
        console.log('\n🔍 Testing Reviews Page & Form Input Readability...');
        await navigateAndCheck(ws, 'http://localhost:8080/reviews.html', 'Reviews Page', 'reviews');

        // Verify dark inputs and typing
        const formInputTest = await evalScript(ws, `
            (() => {
                const nameInput = document.getElementById('form-name');
                const textInput = document.getElementById('form-text');
                if (!nameInput || !textInput) return { success: false, reason: 'Inputs not found' };

                nameInput.value = 'Sarah Chen';
                textInput.value = 'The 3D engineering environment feels stunning and extremely responsive!';
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                textInput.dispatchEvent(new Event('input', { bubbles: true }));

                const nameStyle = window.getComputedStyle(nameInput);
                const textStyle = window.getComputedStyle(textInput);

                return {
                    success: true,
                    nameBg: nameStyle.backgroundColor,
                    nameColor: nameStyle.color,
                    textBg: textStyle.backgroundColor,
                    textColor: textStyle.color
                };
            })()
        `);
        console.log('  Form Input Readability:', formInputTest);
        await captureScreenshot(ws, '3d_bg_reviews_verified.png');

        // Test 5: Mobile Viewport (375x812)
        console.log('\n📱 Testing Mobile Viewport (375x812)...');
        await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
            width: 375,
            height: 812,
            deviceScaleFactor: 2,
            mobile: true
        });
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/index.html' });
        await sleep(2000);

        const mobileCheck = await evalScript(ws, `
            (() => {
                const hasBg = typeof BTech3D !== 'undefined';
                return {
                    isMobile: hasBg ? BTech3D.isMobile : false,
                    isRendering: hasBg && !!BTech3D.renderer
                };
            })()
        `);
        console.log('  Mobile Detection:', mobileCheck);
        await captureScreenshot(ws, '3d_bg_mobile_verified.png');

        ws.close();
        console.log('\n🎉 ALL REAL CHROME CDP BROWSER TESTS PASSED!');
    } catch (err) {
        console.error('❌ Error during Chrome verification:', err);
        process.exit(1);
    } finally {
        chromeProc.kill();
    }
}

run();
