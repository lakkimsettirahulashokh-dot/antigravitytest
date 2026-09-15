const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testRefreshAndLogout() {
    console.log('=== TESTING REFRESH & LOGOUT IN REAL CHROME ===');

    const tempProfile = path.join(os.tmpdir(), 'chrome-test-profile-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9223',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        'http://127.0.0.1:8080/login.html'
    ]);

    chrome.on('exit', (code) => console.log('Chrome exited:', code));

    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
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

    // Fill and submit login
    await send('Runtime.evaluate', { expression: `
        document.getElementById('auth-identifier').value = 'lakkimsettirahulashokh@gmail.com';
        document.getElementById('auth-password').value = 'Student@123';
        document.getElementById('husky-auth-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    `});

    // Wait until dashboard loads
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const urlEval = await send('Runtime.evaluate', { expression: 'window.location.href' });
        if (urlEval.result.value.includes('dashboard.html')) {
            console.log('✅ Reached dashboard');
            break;
        }
    }

    // Now test refresh
    console.log('Testing page reload...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 3000));

    const refreshUrl = await send('Runtime.evaluate', { expression: 'window.location.href' });
    const refreshSplash = await send('Runtime.evaluate', {
        expression: 'Boolean(document.getElementById("auth-splash-loader") && !document.getElementById("auth-splash-loader").classList.contains("opacity-0") && document.getElementById("auth-splash-loader").style.display !== "none")'
    });
    const refreshDash = await send('Runtime.evaluate', {
        expression: 'Boolean(document.getElementById("dashboard-greeting-text"))'
    });

    console.log('After refresh:');
    console.log('URL:', refreshUrl.result.value);
    console.log('Splash visible:', refreshSplash.result.value);
    console.log('Dashboard greeting visible:', refreshDash.result.value);

    // Test logout
    console.log('Testing sign out...');
    await send('Runtime.evaluate', { expression: 'AuthManager.signOut()' });
    await new Promise(r => setTimeout(r, 2000));

    const logoutUrl = await send('Runtime.evaluate', { expression: 'window.location.href' });
    console.log('After sign out URL:', logoutUrl.result.value);

    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch(e) {}
}

testRefreshAndLogout().catch(console.error);
