const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createClient } = require('@supabase/supabase-js');

async function testReload() {
    const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.split('=')[0].trim(), l.substring(l.indexOf('=')+1).trim()]));
    const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: signData } = await sb.auth.signInWithPassword({
        email: 'test_1789320265384@example.com',
        password: 'Password@123!'
    });

    const tempProfile = path.join(os.tmpdir(), 'chrome-rel-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9231',
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
            const res = await fetch('http://127.0.0.1:9231/json/list');
            if (res.ok) {
                const targets = await res.json();
                const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
                if (pageTarget) { wsUrl = pageTarget.webSocketDebuggerUrl; break; }
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
            console.log(`[CONSOLE] ${args}`);
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    await send('Page.navigate', { url: 'http://127.0.0.1:8080/login.html' });
    await new Promise(r => setTimeout(r, 800));
    await send('Runtime.evaluate', {
        expression: `
            localStorage.setItem('sb-kkdqahqcochicfvkfyan-auth-token', ${JSON.stringify(JSON.stringify(signData.session))});
            localStorage.setItem('TechPath_user_session', ${JSON.stringify(JSON.stringify(signData.user))});
        `
    });

    console.log('--- Navigate to dashboard.html ---');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/dashboard.html' });
    await new Promise(r => setTimeout(r, 3500));

    const initial = (await send('Runtime.evaluate', {
        expression: `(() => ({
            loader: Boolean(document.getElementById('auth-splash-loader')),
            greeting: document.getElementById('dashboard-greeting-text')?.textContent
        }))()`,
        returnByValue: true
    })).result.value;
    console.log('Initial dashboard load:', initial);

    console.log('--- Triggering Page.reload ---');
    await send('Page.reload');

    for (let sec = 1; sec <= 6; sec++) {
        await new Promise(r => setTimeout(r, 1000));
        const res = (await send('Runtime.evaluate', {
            expression: `(() => ({
                sec: ${sec},
                loader: Boolean(document.getElementById('auth-splash-loader')),
                greeting: document.getElementById('dashboard-greeting-text')?.textContent,
                cachedUser: Boolean(window.AuthManager?.cachedUser)
            }))()`,
            returnByValue: true
        })).result.value;
        console.log(`Sec ${sec} after reload:`, res);
        if (!res.loader && res.greeting) {
            console.log('RELOAD TEST PASSED at sec', sec);
            break;
        }
    }

    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
}

testReload().catch(console.error);
