const { spawn } = require('child_process');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9228;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function sendCDP(ws, method, params = {}) {
    return new Promise((res, rej) => {
        const id = Math.floor(Math.random() * 1000000);
        const onMsg = (e) => {
            const d = JSON.parse(e.data);
            if (d.id === id) {
                ws.removeEventListener('message', onMsg);
                res(d.result?.result?.value !== undefined ? d.result.result.value : d.result);
            }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id, method, params }));
    });
}

(async () => {
    const chrome = spawn(CHROME_PATH, ['--headless=new', '--remote-debugging-port=' + PORT, '--disable-gpu', '--no-first-run'], { stdio: 'ignore' });
    await sleep(1500);
    const tabRes = await fetch('http://127.0.0.1:' + PORT + '/json/new?about:blank', { method: 'PUT' });
    const tab = await tabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Runtime.enable');

    await sendCDP(ws, 'Page.addScriptToEvaluateOnNewDocument', {
        source: `
            const testUser = { id: 'test-user-id', email: 'alex.rivera@techpath.ai', name: 'Alex Rivera', role: 'student', branch: 'CSE', tier: 'Engineering Scholar' };
            const testProfile = { id: 'test-user-id', full_name: 'Alex Rivera', branch: 'CSE', semester: 4, is_onboarding_completed: true };
            try {
                localStorage.setItem('TechPath_user_session', JSON.stringify(testUser));
                localStorage.setItem('btechpath_user_session', JSON.stringify(testUser));
                sessionStorage.setItem('btechpath_loaded_session', 'true');
            } catch(e) {}
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
                get() { return this._am; }
            });
        `
    });

    await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/dashboard.html' });
    await sleep(2000);

    const check = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
            const b = document.getElementById("mobile-menu-btn");
            const s = document.getElementById("main-sidebar");
            const o = document.getElementById("mobile-sidebar-overlay");
            const initialOv = document.body.style.overflow;
            const initialSidebarClasses = s ? s.className : null;

            // Click menu button
            if (b) b.click();
            const afterOpenOv = document.body.style.overflow;
            const afterOpenSidebarClasses = s ? s.className : null;

            // Click overlay
            if (o) o.click();
            const afterCloseOv = document.body.style.overflow;
            const afterCloseSidebarClasses = s ? s.className : null;

            return {
                url: window.location.href,
                hasBtn: !!b,
                hasSidebar: !!s,
                hasOverlay: !!o,
                initialOv,
                afterOpenOv,
                afterCloseOv,
                initialSidebarClasses,
                afterOpenSidebarClasses,
                afterCloseSidebarClasses
            };
        })()`,
        returnByValue: true
    });
    console.log('Mobile menu detailed check result:', check);
    ws.close();
    chrome.kill();
})();
