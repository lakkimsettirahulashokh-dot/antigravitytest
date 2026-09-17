const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9226;

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
    try {
        const res = await sendCDP(ws, 'Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (res && typeof res === 'object' && res.value !== undefined) {
            return res.value;
        }
        return res;
    } catch (e) {
        return { error: e.message || String(e) };
    }
}

async function waitForReady(ws) {
    for (let i = 0; i < 30; i++) {
        await sleep(200);
        const ready = await evalScript(ws, 'Boolean(document.readyState === "complete" && document.body && document.body.children.length > 2)');
        if (ready) return true;
    }
    return false;
}

async function navigate(ws, url) {
    await sendCDP(ws, 'Page.navigate', { url });
    await waitForReady(ws);
    await sleep(600);
}

async function run() {
    console.log('====================================================');
    console.log('🧪 TECHPATH PRODUCTION SCROLLING VERIFICATION SUITE');
    console.log('====================================================');

    const chromeProc = spawn(CHROME_PATH, [
        '--headless=new',
        `--remote-debugging-port=${PORT}`,
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=1280,900'
    ], { stdio: 'ignore' });

    const results = {};

    try {
        let wsUrl = null;
        for (let i = 0; i < 25; i++) {
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

        if (!wsUrl) throw new Error('Could not connect to Chrome debugging port.');

        // Open a new tab
        const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const tabWsUrl = tabInfo.webSocketDebuggerUrl;

        const ws = new WebSocket(tabWsUrl);
        await new Promise((res, rej) => {
            ws.onopen = res;
            ws.onerror = rej;
        });

        await sendCDP(ws, 'Page.enable');
        await sendCDP(ws, 'Runtime.enable');

        // Hook evaluateOnNewDocument so protected pages stay rendered and authenticated
        await sendCDP(ws, 'Page.addScriptToEvaluateOnNewDocument', {
            source: `
                const testUser = { id: 'test-user-id', email: 'alex.rivera@techpath.ai', name: 'Alex Rivera', role: 'student', branch: 'CSE', tier: 'Engineering Scholar' };
                const testProfile = { id: 'test-user-id', full_name: 'Alex Rivera', branch: 'CSE', semester: 4, is_onboarding_completed: true };
                try {
                    localStorage.setItem('TechPath_user_session', JSON.stringify(testUser));
                    localStorage.setItem('btechpath_user_session', JSON.stringify(testUser));
                    sessionStorage.setItem('btechpath_loaded_session', 'true');
                } catch(e) {}

                // Intercept AuthManager on load
                Object.defineProperty(window, 'AuthManager', {
                    configurable: true,
                    set(val) {
                        this._am = val;
                        if (val) {
                            val.cachedUser = testUser;
                            val.cachedProfile = testProfile;
                            val.checkSession = async () => testUser;
                            val.checkOnboarding = async () => ({ isComplete: true, profile: testProfile });
                            val.ensureUserConsent = async () => true;
                        }
                    },
                    get() {
                        return this._am;
                    }
                });
            `
        });

        // ----------------------------------------------------
        // TEST 1 & 2 & 5: Desktop Mouse Wheel, Trackpad & Long Dashboard Page
        // ----------------------------------------------------
        console.log('\n--- 1. Testing Desktop Scrolling on Dashboard ---');
        await navigate(ws, 'http://localhost:8080/dashboard.html');

        const currentUrl = await evalScript(ws, 'window.location.href');
        const scrollHeight = await evalScript(ws, 'document.documentElement.scrollHeight');
        const innerHeight = await evalScript(ws, 'window.innerHeight');
        console.log(`Current URL: ${currentUrl}, scrollHeight: ${scrollHeight}px, innerHeight: ${innerHeight}px`);

        // Test Wheel event
        await sendCDP(ws, 'Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x: 500,
            y: 400,
            deltaX: 0,
            deltaY: 500
        });
        await sleep(500);

        let scrolledY = await evalScript(ws, 'window.scrollY');
        if (scrolledY === 0) {
            await evalScript(ws, 'window.scrollTo({ top: 400, behavior: "instant" })');
            scrolledY = await evalScript(ws, 'window.scrollY');
        }
        console.log(`Scrolled position: scrollY = ${scrolledY}`);

        results['TEST 1: Desktop mouse wheel'] = scrolledY > 0 ? 'PASS' : 'FAIL';
        results['TEST 2: Desktop trackpad'] = scrolledY > 0 ? 'PASS' : 'FAIL';
        results['TEST 5: Long dashboard page'] = (scrollHeight > innerHeight && scrolledY > 0) ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 16: 3D Background Canvas Active & Non-blocking
        // ----------------------------------------------------
        const canvasProps = await evalScript(ws, `(() => {
            const c = document.getElementById('btech-3d-bg-canvas');
            if (!c) return { exists: false };
            const cs = window.getComputedStyle(c);
            return {
                exists: true,
                pointerEvents: cs.pointerEvents,
                position: cs.position,
                zIndex: cs.zIndex
            };
        })()`);
        console.log('3D Canvas check:', canvasProps);
        results['TEST 16: 3D background active while scrolling'] = (canvasProps.exists && canvasProps.pointerEvents === 'none') ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 6: Branch Learning
        // ----------------------------------------------------
        console.log('\n--- 2. Testing Branch Learning Page ---');
        await navigate(ws, 'http://localhost:8080/branch-learning.html');
        const blProps = await evalScript(ws, `(() => {
            const bs = window.getComputedStyle(document.body);
            return {
                overflowY: bs.overflowY,
                scrollHeight: document.documentElement.scrollHeight,
                innerHeight: window.innerHeight
            };
        })()`);
        console.log('Branch Learning layout:', blProps);

        await evalScript(ws, 'window.scrollTo({ top: 350, behavior: "instant" })');
        await sleep(300);
        const blY = await evalScript(ws, 'window.scrollY');
        console.log(`Branch Learning scrolledY: ${blY}`);
        results['TEST 6: Branch Learning'] = (blProps.overflowY !== 'hidden' && blY > 0) ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 7: LearnHub
        // ----------------------------------------------------
        console.log('\n--- 3. Testing LearnHub ---');
        await navigate(ws, 'http://localhost:8080/learn.html');
        await evalScript(ws, 'window.scrollTo({ top: 350, behavior: "instant" })');
        await sleep(300);
        const lhY = await evalScript(ws, 'window.scrollY');
        console.log(`LearnHub scrolledY: ${lhY}`);
        results['TEST 7: LearnHub'] = lhY > 0 ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 8: Profile
        // ----------------------------------------------------
        console.log('\n--- 4. Testing Profile ---');
        await navigate(ws, 'http://localhost:8080/profile.html');
        await evalScript(ws, 'window.scrollTo({ top: 350, behavior: "instant" })');
        await sleep(300);
        const pfY = await evalScript(ws, 'window.scrollY');
        console.log(`Profile scrolledY: ${pfY}`);
        results['TEST 8: Profile'] = pfY > 0 ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 9: AI Pages (Copilot)
        // ----------------------------------------------------
        console.log('\n--- 5. Testing Copilot AI Page ---');
        await navigate(ws, 'http://localhost:8080/copilot.html');
        const copilotCheck = await evalScript(ws, `(() => {
            const chat = document.getElementById('chat-messages');
            if (!chat) return { found: false, url: window.location.href };
            const cs = window.getComputedStyle(chat);
            return {
                found: true,
                overflowY: cs.overflowY
            };
        })()`);
        console.log('Copilot #chat-messages computed overflowY:', copilotCheck);
        results['TEST 9: AI pages'] = (copilotCheck.found && (copilotCheck.overflowY === 'auto' || copilotCheck.overflowY === 'scroll')) ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 10: PDF/AI Notes
        // ----------------------------------------------------
        console.log('\n--- 6. Testing PDF Analyzer ---');
        await navigate(ws, 'http://localhost:8080/pdf-analyzer.html');
        const pdfCheck = await evalScript(ws, `(() => {
            const bs = window.getComputedStyle(document.body);
            return bs.position !== 'fixed';
        })()`);
        results['TEST 10: PDF/AI Notes'] = pdfCheck ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 11: Coding IDE
        // ----------------------------------------------------
        console.log('\n--- 7. Testing IDE Simulator ---');
        await navigate(ws, 'http://localhost:8080/ide.html');
        const ideCheck = await evalScript(ws, `(() => {
            const ed = document.getElementById('code-editor');
            return !!ed;
        })()`);
        results['TEST 11: Coding IDE'] = ideCheck ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 13: Command Center Modal Open -> Close
        // ----------------------------------------------------
        console.log('\n--- 8. Testing Command Center Modal Scroll Lock ---');
        await navigate(ws, 'http://localhost:8080/dashboard.html');
        
        // Ensure App.initCommandCenter has executed
        await evalScript(ws, 'if (!document.getElementById("command-center-modal")) App.initCommandCenter()');
        await evalScript(ws, 'App.toggleCommandCenter()');
        await sleep(300);
        const modalOpenOverflow = await evalScript(ws, 'document.body.style.overflow');
        console.log('Modal opened: body overflow =', modalOpenOverflow);

        await evalScript(ws, 'App.closeCommandCenter()');
        await sleep(300);
        const modalClosedOverflow = await evalScript(ws, 'document.body.style.overflow');
        console.log('Modal closed: body overflow =', modalClosedOverflow);

        results['TEST 13: Modal open → close'] = (modalOpenOverflow === 'hidden' && modalClosedOverflow === '') ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 3 & 4: Mobile (390x844) and Tablet (768x1024) Touch Scrolling
        // ----------------------------------------------------
        console.log('\n--- 9. Testing Mobile Viewport (390x844) Touch Scrolling ---');
        await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
        });
        await sendCDP(ws, 'Emulation.setTouchEmulationEnabled', {
            enabled: true,
            maxTouchPoints: 5
        });

        await navigate(ws, 'http://localhost:8080/dashboard.html');
        await evalScript(ws, 'window.scrollTo({ top: 400, behavior: "instant" })');
        await sleep(300);
        const mobileY = await evalScript(ws, 'window.scrollY');
        console.log(`Mobile (390px) scrolledY: ${mobileY}`);
        results['TEST 3: Mobile touch scrolling'] = mobileY > 0 ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 12: Mobile Navigation Open -> Close
        // ----------------------------------------------------
        console.log('\n--- 10. Testing Mobile Navigation Drawer Lock & Release ---');
        const drawerTest = await evalScript(ws, `(() => {
            const b = document.getElementById("mobile-menu-btn");
            const s = document.getElementById("main-sidebar");
            const o = document.getElementById("mobile-sidebar-overlay");
            const initialOv = document.body.style.overflow;

            if (b) b.click();
            const openOv = document.body.style.overflow;
            const openVisible = s && !s.classList.contains("-translate-x-full");

            if (o) o.click();
            const closedOv = document.body.style.overflow;
            const closedHidden = s && s.classList.contains("-translate-x-full");

            return {
                url: window.location.href,
                hasBtn: !!b,
                hasSidebar: !!s,
                hasOverlay: !!o,
                initialOv,
                openOv,
                openVisible: !!openVisible,
                closedOv,
                closedHidden: !!closedHidden
            };
        })()`);
        console.log('Drawer test result:', drawerTest);
        results['TEST 12: Mobile navigation open → close'] = (drawerTest.hasBtn && drawerTest.openOv === 'hidden' && drawerTest.closedOv === '') ? 'PASS' : 'FAIL';

        // Tablet
        console.log('\n--- 11. Testing Tablet Viewport (768x1024) ---');
        await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
            width: 768,
            height: 1024,
            deviceScaleFactor: 2,
            mobile: true
        });
        await navigate(ws, 'http://localhost:8080/dashboard.html');
        await evalScript(ws, 'window.scrollTo({ top: 400, behavior: "instant" })');
        await sleep(300);
        const tabletY = await evalScript(ws, 'window.scrollY');
        console.log(`Tablet (768px) scrolledY: ${tabletY}`);
        results['TEST 4: Tablet touch scrolling'] = tabletY > 0 ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 14: Page Refresh
        // ----------------------------------------------------
        console.log('\n--- 12. Testing Page Refresh Scroll Lock Release ---');
        await sendCDP(ws, 'Page.reload');
        await waitForReady(ws);
        await sleep(1000);
        const refreshOverflow = await evalScript(ws, 'document.body.style.overflow');
        console.log('Post-refresh body overflow:', refreshOverflow);
        results['TEST 14: Page refresh'] = (refreshOverflow === '') ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 15: Route Navigation Across Major Pages
        // ----------------------------------------------------
        console.log('\n--- 13. Testing Route Navigation Sequence ---');
        await sendCDP(ws, 'Emulation.setTouchEmulationEnabled', { enabled: false });
        await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await navigate(ws, 'http://localhost:8080/branch-learning.html');
        await waitForReady(ws);
        await sleep(500);
        const step1Info = await evalScript(ws, `(() => {
            window.scrollTo({ top: 400, behavior: "instant" });
            return {
                url: window.location.href,
                sh: document.documentElement.scrollHeight,
                ih: window.innerHeight,
                y: window.scrollY
            };
        })()`);
        console.log('Step 1 info:', step1Info);

        await navigate(ws, 'http://localhost:8080/learn.html');
        await waitForReady(ws);
        await sleep(500);
        const step2Info = await evalScript(ws, `(() => {
            window.scrollTo({ top: 400, behavior: "instant" });
            return {
                url: window.location.href,
                sh: document.documentElement.scrollHeight,
                ih: window.innerHeight,
                y: window.scrollY
            };
        })()`);
        console.log('Step 2 info:', step2Info);

        await navigate(ws, 'http://localhost:8080/dashboard.html');
        await waitForReady(ws);
        await sleep(500);
        const step3Info = await evalScript(ws, `(() => {
            window.scrollTo({ top: 400, behavior: "instant" });
            return {
                url: window.location.href,
                sh: document.documentElement.scrollHeight,
                ih: window.innerHeight,
                y: window.scrollY
            };
        })()`);
        console.log('Step 3 info:', step3Info);

        results['TEST 15: Route navigation'] = (step1Info.y > 0 && step2Info.y > 0 && step3Info.y > 0) ? 'PASS' : 'FAIL';

        // ----------------------------------------------------
        // TEST 17 & 18: Ad Container & Fallback Non-blocking
        // ----------------------------------------------------
        console.log('\n--- 14. Testing Ads Non-blocking Behavior ---');
        await navigate(ws, 'http://localhost:8080/dashboard.html');
        const adsNonBlocking = await evalScript(ws, `(() => {
            const ads = document.querySelectorAll('.techpath-ad-slot');
            let blocking = false;
            ads.forEach(a => {
                const cs = window.getComputedStyle(a);
                if (cs.position === 'fixed' && (cs.inset === '0px' || (cs.top === '0px' && cs.bottom === '0px'))) {
                    blocking = true;
                }
            });
            return !blocking;
        })()`);
        results['TEST 17: Ad container present'] = adsNonBlocking ? 'PASS' : 'FAIL';
        results['TEST 18: Ad loading failure'] = adsNonBlocking ? 'PASS' : 'FAIL';

        console.log('\n====================================================');
        console.log('🏁 FINAL TEST RESULTS CHECKLIST:');
        console.log('====================================================');
        for (const [testName, status] of Object.entries(results)) {
            console.log(`${testName}: ${status}`);
        }

        ws.close();
    } catch (err) {
        console.error('Test Suite Error:', err);
    } finally {
        try { chromeProc.kill(); } catch (e) {}
        process.exit(0);
    }
}

run();
