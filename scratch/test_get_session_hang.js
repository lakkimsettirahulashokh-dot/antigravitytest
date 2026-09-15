const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.split('=')[0].trim(), l.substring(l.indexOf('=')+1).trim()]));
    const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: signData } = await sb.auth.signInWithPassword({
        email: 'test_1789320265384@example.com',
        password: 'Password@123!'
    });

    const tempProfile = path.join(os.tmpdir(), 'chrome-test-hang-' + Date.now());
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
            console.log(`[CONSOLE] ${args}`);
        } else if (msg.method === 'Runtime.exceptionThrown') {
            console.error(`[EXCEPTION] ${msg.params.exceptionDetails.text}`, msg.params.exceptionDetails.exception?.description || '');
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    // 1. Navigate to 404 or blank on the domain
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/404.html' });
    await new Promise(r => setTimeout(r, 1000));

    // 2. Set token in localStorage
    await send('Runtime.evaluate', {
        expression: `
            localStorage.setItem('sb-kkdqahqcochicfvkfyan-auth-token', ${JSON.stringify(JSON.stringify(signData.session))});
            localStorage.setItem('TechPath_user_session', ${JSON.stringify(JSON.stringify(signData.user))});
        `
    });

    console.log('Now navigating to start-journey.html WITH token already in localStorage...');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/start-journey.html' });

    for (let s = 1; s <= 10; s++) {
        await new Promise(r => setTimeout(r, 1000));
        const status = await send('Runtime.evaluate', {
            expression: `({
                url: window.location.href,
                splashExists: Boolean(document.getElementById('auth-splash-loader')),
                splashVisible: document.getElementById('auth-splash-loader') ? (!document.getElementById('auth-splash-loader').classList.contains('opacity-0') && document.getElementById('auth-splash-loader').style.display !== 'none') : false,
                nameInput: document.getElementById('sj-name')?.value,
                userBadge: document.getElementById('user-email-badge')?.textContent
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
