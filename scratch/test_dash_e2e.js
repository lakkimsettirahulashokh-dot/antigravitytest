const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createClient } = require('@supabase/supabase-js');

async function testDashboard() {
    const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.split('=')[0].trim(), l.substring(l.indexOf('=')+1).trim()]));
    const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    // Sign in test user to get fresh valid tokens
    const { data: signData, error: signErr } = await sb.auth.signInWithPassword({
        email: 'test_1789320265384@example.com',
        password: 'Password@123!'
    });
    if (signErr) {
        console.error('Sign in failed:', signErr);
        process.exit(1);
    }
    console.log('Got fresh session for:', signData.user.email);

    const tempProfile = path.join(os.tmpdir(), 'chrome-dash-test-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9227',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        'about:blank'
    ]);

    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 400));
        try {
            const res = await fetch('http://127.0.0.1:9227/json/list');
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
        if (msg.method === 'Runtime.consoleAPICalled') {
            const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
            console.log(`[BROWSER CONSOLE] ${args}`);
        }
        if (msg.method === 'Runtime.exceptionThrown') {
            console.error(`[BROWSER UNCAUGHT]`, msg.params.exceptionDetails);
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    // First go to origin to set localStorage
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/login.html' });
    await new Promise(r => setTimeout(r, 1000));

    await send('Runtime.evaluate', {
        expression: `
            localStorage.setItem('sb-kkdqahqcochicfvkfyan-auth-token', ${JSON.stringify(JSON.stringify(signData.session))});
            localStorage.setItem('TechPath_user_session', ${JSON.stringify(JSON.stringify(signData.user))});
        `
    });

    console.log('\n--- Navigating to dashboard.html ---');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/dashboard.html' });
    
    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3500));

    const state = await send('Runtime.evaluate', {
        expression: `(() => {
            const loader = document.getElementById('auth-splash-loader');
            const greeting = document.getElementById('dashboard-greeting-text')?.textContent;
            const currentUrl = window.location.href;
            return {
                url: currentUrl,
                hasLoader: Boolean(loader),
                loaderDisplay: loader ? window.getComputedStyle(loader).display : null,
                loaderOpacity: loader ? window.getComputedStyle(loader).opacity : null,
                loaderClasses: loader ? loader.className : null,
                greeting: greeting,
                isAuthPromisePending: Boolean(AuthManager._requireAuthPromise),
                authPromiseType: typeof AuthManager._requireAuthPromise,
                authPromiseVal: String(AuthManager._requireAuthPromise),
                userCached: Boolean(AuthManager.cachedUser)
            };
        })()`,
        returnByValue: true
    });

    console.log('\n--- DASHBOARD STATE AFTER 3.5s ---');
    console.log(state.result.value);

    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch(e) {}
}

testDashboard().catch(console.error);
