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

    const tempProfile = path.join(os.tmpdir(), 'chrome-test-debug-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9226',
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
            const res = await fetch('http://127.0.0.1:9226/json/list');
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
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    await send('Page.navigate', { url: 'http://127.0.0.1:8080/login.html' });
    await new Promise(r => setTimeout(r, 1000));

    await send('Runtime.evaluate', {
        expression: `
            localStorage.setItem('sb-kkdqahqcochicfvkfyan-auth-token', ${JSON.stringify(JSON.stringify(signData.session))});
            localStorage.setItem('TechPath_user_session', ${JSON.stringify(JSON.stringify(signData.user))});
        `
    });

    await send('Page.navigate', { url: 'http://127.0.0.1:8080/start-journey.html' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('\n--- EVALUATING AUTH STATES ON START-JOURNEY.HTML ---');
    const step1 = await send('Runtime.evaluate', {
        expression: `(async () => {
            console.log('1. Testing SupabaseBridge.init()...');
            const client = await SupabaseBridge.init();
            console.log('1. SupabaseBridge client active:', Boolean(client));

            console.log('2. Testing AuthManager.checkSession()...');
            const user = await AuthManager.checkSession();
            console.log('2. checkSession result:', user ? user.email : null);

            console.log('3. Testing AuthManager.ensureUserConsent()...');
            const consent = await AuthManager.ensureUserConsent(user);
            console.log('3. ensureUserConsent result:', consent);

            console.log('4. Testing AuthManager.checkOnboarding()...');
            const onboarding = await AuthManager.checkOnboarding(user);
            console.log('4. checkOnboarding result:', onboarding);

            console.log('5. Testing AuthManager.syncUserProfile()...');
            const profile = await AuthManager.syncUserProfile(user);
            console.log('5. syncUserProfile result:', profile?.name);

            console.log('6. Checking AuthManager._requireAuthPromise...');
            console.log('6. _requireAuthPromise is:', AuthManager._requireAuthPromise);

            return {
                hasUser: Boolean(user),
                consent: consent,
                onboarding: onboarding?.isComplete,
                profileName: profile?.name
            };
        })()`,
        awaitPromise: true,
        returnByValue: true
    });

    console.log('Step Evaluation Output:', step1.result.value);

    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch(e) {}
}

main().catch(console.error);
