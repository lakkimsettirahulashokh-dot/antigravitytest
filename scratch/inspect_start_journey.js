const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
    console.log('=== INSPECTING START-JOURNEY.HTML IN REAL CHROME ===');
    const tempProfile = path.join(os.tmpdir(), 'chrome-inspect-sj-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9224',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        'http://127.0.0.1:8080/start-journey.html'
    ]);

    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 400));
        try {
            const res = await fetch('http://127.0.0.1:9224/json/list');
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

    if (!wsUrl) {
        console.error('Failed to get CDP wsUrl');
        chrome.kill();
        return;
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

    console.log('Setting localStorage session for test user in Chrome...');
    // We get a real session from Supabase
    const { createClient } = require('@supabase/supabase-js');
    const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.split('=')[0].trim(), l.substring(l.indexOf('=')+1).trim()]));
    const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: signData } = await sb.auth.signInWithPassword({
        email: 'test_1789320265384@example.com',
        password: 'Password@123!'
    });

    const sessionObj = signData.session;
    const setStorageScript = `
        localStorage.setItem('sb-kkdqahqcochicfvkfyan-auth-token', ${JSON.stringify(JSON.stringify(sessionObj))});
        localStorage.setItem('TechPath_user_session', ${JSON.stringify(JSON.stringify(signData.user))});
        window.location.reload();
    `;
    await send('Runtime.evaluate', { expression: setStorageScript });

    console.log('Reloaded with session. Monitoring start-journey.html for 8 seconds...');
    for (let s = 1; s <= 8; s++) {
        await new Promise(r => setTimeout(r, 1000));
        const status = await send('Runtime.evaluate', {
            expression: `({
                url: window.location.href,
                splashExists: Boolean(document.getElementById('auth-splash-loader')),
                splashVisible: document.getElementById('auth-splash-loader') ? (!document.getElementById('auth-splash-loader').classList.contains('opacity-0') && document.getElementById('auth-splash-loader').style.display !== 'none') : false,
                splashClasses: document.getElementById('auth-splash-loader')?.className,
                splashOpacity: document.getElementById('auth-splash-loader')?.style.opacity,
                splashDisplay: document.getElementById('auth-splash-loader')?.style.display,
                authManagerStatus: window.AuthManager ? 'loaded' : 'missing',
                user: window.AuthManager ? window.AuthManager.getUser()?.email : null
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
