const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log('=== TEST DIRECT NAVIGATION TO START-JOURNEY.HTML WITH SESSION ===');
    const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.split('=')[0].trim(), l.substring(l.indexOf('=')+1).trim()]));
    const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: signData, error: signErr } = await sb.auth.signInWithPassword({
        email: 'test_1789320265384@example.com',
        password: 'Password@123!'
    });
    if (signErr) {
        console.error('Sign in failed:', signErr);
        return;
    }

    const sessionObj = signData.session;
    const tempProfile = path.join(os.tmpdir(), 'chrome-test-sj-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9225',
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
            const res = await fetch('http://127.0.0.1:9225/json/list');
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
            console.log(`[CONSOLE ${msg.params.type.toUpperCase()}] ${args}`);
        } else if (msg.method === 'Runtime.exceptionThrown') {
            console.error(`[EXCEPTION] ${msg.params.exceptionDetails.text}`, msg.params.exceptionDetails.exception?.description || '');
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');

    // Navigate to origin first so localStorage is scoped correctly
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/login.html' });
    await new Promise(r => setTimeout(r, 1000));

    // Seed session in localStorage
    await send('Runtime.evaluate', {
        expression: `
            localStorage.setItem('sb-kkdqahqcochicfvkfyan-auth-token', ${JSON.stringify(JSON.stringify(sessionObj))});
            localStorage.setItem('TechPath_user_session', ${JSON.stringify(JSON.stringify(signData.user))});
        `
    });

    console.log('Navigating to http://127.0.0.1:8080/start-journey.html...');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/start-journey.html' });

    for (let s = 1; s <= 8; s++) {
        await new Promise(r => setTimeout(r, 1000));
        const status = await send('Runtime.evaluate', {
            expression: `({
                url: window.location.href,
                splashExists: Boolean(document.getElementById('auth-splash-loader')),
                splashVisible: document.getElementById('auth-splash-loader') ? (!document.getElementById('auth-splash-loader').classList.contains('opacity-0') && document.getElementById('auth-splash-loader').style.display !== 'none') : false,
                nameInputValue: document.getElementById('sj-name')?.value,
                emailBadge: document.getElementById('user-email-badge')?.textContent
            })`,
            returnByValue: true
        });
        console.log(`[T+${s}s]`, status.result.value);
    }

    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch(e) {}
}

main().catch(console.error);
