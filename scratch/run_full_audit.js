const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createClient } = require('@supabase/supabase-js');

async function runAudit() {
    console.log('====================================================');
    console.log('STARTING REAL AUTOMATED CHROME AUDIT FOR TECHPATH');
    console.log('====================================================\n');

    const env = Object.fromEntries(
        fs.readFileSync('.env', 'utf8')
            .split('\n')
            .filter(l => l.includes('=') && !l.startsWith('#'))
            .map(l => [l.split('=')[0].trim(), l.substring(l.indexOf('=') + 1).trim()])
    );

    const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const results = {};

    // 1. Create a headless Chrome instance with remote debugging
    const tempProfile = path.join(os.tmpdir(), 'chrome-audit-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9229',
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
            const res = await fetch('http://127.0.0.1:9229/json/list');
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
        console.error('Failed to connect to Chrome remote debugging port 9229');
        chrome.kill();
        process.exit(1);
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

    // -------------------------------------------------------------
    // TEST 11: Protected dashboard URL while logged out -> login
    // -------------------------------------------------------------
    console.log('\n--- [TEST 11] Protected dashboard URL while logged out ---');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/dashboard.html' });
    await new Promise(r => setTimeout(r, 2000));
    const t11Url = (await send('Runtime.evaluate', { expression: 'window.location.href' })).result.value;
    console.log('Redirected to:', t11Url);
    results['TEST 11: Protected Route Guard'] = t11Url.includes('login.html') ? 'PASS' : 'FAIL';

    // -------------------------------------------------------------
    // TEST 7: Wrong password -> visible error -> no infinite loading
    // -------------------------------------------------------------
    console.log('\n--- [TEST 7] Wrong password error handling ---');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/login.html' });
    await new Promise(r => setTimeout(r, 1000));
    await send('Runtime.evaluate', {
        expression: `
            document.getElementById('auth-identifier').value = 'test_1789320265384@example.com';
            document.getElementById('auth-password').value = 'WrongPassword999!';
            document.getElementById('door-submit-btn').click();
        `
    });
    await new Promise(r => setTimeout(r, 2500));
    const t7State = (await send('Runtime.evaluate', {
        expression: `(() => {
            const btn = document.getElementById('door-submit-btn');
            const toast = document.querySelector('.btech-toast, [id*="toast"]')?.textContent;
            return {
                btnDisabled: btn?.disabled,
                btnText: btn?.querySelector('.doorbtn__label')?.textContent,
                toast: toast
            };
        })()`,
        returnByValue: true
    })).result.value;
    console.log('Wrong password state:', t7State);
    results['TEST 7: Wrong Password Visible Error'] = (!t7State.btnDisabled && (t7State.btnText === 'Sign in' || t7State.toast)) ? 'PASS' : 'FAIL';

    // -------------------------------------------------------------
    // TEST 3: Existing verified user -> real login form submit -> dashboard
    // -------------------------------------------------------------
    console.log('\n--- [TEST 3] Existing verified user real login submit ---');
    await send('Runtime.evaluate', {
        expression: `
            document.getElementById('auth-identifier').value = 'test_1789320265384@example.com';
            document.getElementById('auth-password').value = 'Password@123!';
            document.getElementById('door-submit-btn').click();
        `
    });
    // Wait for login processing and redirect to dashboard
    await new Promise(r => setTimeout(r, 4000));
    const t3State = (await send('Runtime.evaluate', {
        expression: `(() => {
            const loader = document.getElementById('auth-splash-loader');
            const greeting = document.getElementById('dashboard-greeting-text')?.textContent;
            return {
                url: window.location.href,
                hasLoader: Boolean(loader),
                greeting: greeting,
                userCached: Boolean(window.AuthManager?.cachedUser)
            };
        })()`,
        returnByValue: true
    })).result.value;
    console.log('Existing login state:', t3State);
    results['TEST 3: Existing User Login -> Dashboard'] = (t3State.url.includes('dashboard.html') && !t3State.hasLoader && t3State.greeting) ? 'PASS' : 'FAIL';

    // -------------------------------------------------------------
    // TEST 4: Refresh dashboard -> session restored -> dashboard
    // -------------------------------------------------------------
    console.log('\n--- [TEST 4] Refresh dashboard (session restoration) ---');
    await send('Page.reload');
    let t4Passed = false;
    let t4State = null;
    for (let sec = 1; sec <= 6; sec++) {
        await new Promise(r => setTimeout(r, 1000));
        t4State = (await send('Runtime.evaluate', {
            expression: `(() => {
                const loader = document.getElementById('auth-splash-loader');
                const greeting = document.getElementById('dashboard-greeting-text')?.textContent;
                return {
                    sec: ${sec},
                    url: window.location.href,
                    hasLoader: Boolean(loader),
                    greeting: greeting,
                    userCached: Boolean(window.AuthManager?.cachedUser)
                };
            })()`,
            returnByValue: true
        })).result.value;
        if (t4State.url.includes('dashboard.html') && !t4State.hasLoader && t4State.greeting) {
            t4Passed = true;
            break;
        }
    }
    console.log('Refresh state:', t4State);
    results['TEST 4: Dashboard Refresh Restoration'] = t4Passed ? 'PASS' : 'FAIL';

    // -------------------------------------------------------------
    // TEST 5: Logout -> session cleared
    // -------------------------------------------------------------
    console.log('\n--- [TEST 5] Logout -> session cleared ---');
    await send('Runtime.evaluate', {
        expression: `window.AuthManager.logout();`
    });
    await new Promise(r => setTimeout(r, 2000));
    const t5State = (await send('Runtime.evaluate', {
        expression: `(() => {
            return {
                url: window.location.href,
                hasToken: Boolean(localStorage.getItem('sb-kkdqahqcochicfvkfyan-auth-token')),
                hasUser: Boolean(localStorage.getItem('TechPath_user_session'))
            };
        })()`,
        returnByValue: true
    })).result.value;
    console.log('Logout state:', t5State);
    results['TEST 5: Logout & Session Purge'] = (t5State.url.includes('login.html') && !t5State.hasToken && !t5State.hasUser) ? 'PASS' : 'FAIL';

    // -------------------------------------------------------------
    // TEST 6: Login again -> dashboard opens
    // -------------------------------------------------------------
    console.log('\n--- [TEST 6] Login again after logout ---');
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/login.html' });
    await new Promise(r => setTimeout(r, 1500));
    await send('Runtime.evaluate', {
        expression: `
            document.getElementById('auth-identifier').value = 'test_1789320265384@example.com';
            document.getElementById('auth-password').value = 'Password@123!';
            document.getElementById('door-submit-btn').click();
        `
    });
    let t6Passed = false;
    let t6State = null;
    for (let sec = 1; sec <= 6; sec++) {
        await new Promise(r => setTimeout(r, 1000));
        t6State = (await send('Runtime.evaluate', {
            expression: `(() => {
                const loader = document.getElementById('auth-splash-loader');
                const greeting = document.getElementById('dashboard-greeting-text')?.textContent;
                return {
                    sec: ${sec},
                    url: window.location.href,
                    hasLoader: Boolean(loader),
                    greeting: greeting
                };
            })()`,
            returnByValue: true
        })).result.value;
        if (t6State.url.includes('dashboard.html') && !t6State.hasLoader && t6State.greeting) {
            t6Passed = true;
            break;
        }
    }
    console.log('Re-login state:', t6State);
    results['TEST 6: Re-Login After Logout'] = t6Passed ? 'PASS' : 'FAIL';

    // -------------------------------------------------------------
    // TEST 2: User with incomplete onboarding in DB -> redirected to start-journey.html
    // -------------------------------------------------------------
    console.log('\n--- [TEST 2] Incomplete onboarding routing ---');
    // Authenticate node Supabase client and update profile
    const { data: authUserSign } = await sb.auth.signInWithPassword({
        email: 'test_1789320265384@example.com',
        password: 'Password@123!'
    });
    await sb.from('profiles').update({ onboarding_completed: false }).eq('id', authUserSign.user.id);
    
    // Clear in-memory cachedProfile in browser
    await send('Runtime.evaluate', {
        expression: `(() => {
            if (window.AuthManager) {
                window.AuthManager.cachedProfile = null;
            }
            try {
                const s = JSON.parse(localStorage.getItem('TechPath_user_session') || '{}');
                s.onboarding_completed = false;
                localStorage.setItem('TechPath_user_session', JSON.stringify(s));
            } catch(e) {}
        })()`
    });

    // Navigate to dashboard.html with incomplete onboarding
    await send('Page.navigate', { url: 'http://127.0.0.1:8080/dashboard.html' });
    let t2Passed = false;
    let t2Url = '';
    for (let sec = 1; sec <= 6; sec++) {
        await new Promise(r => setTimeout(r, 1000));
        t2Url = (await send('Runtime.evaluate', { expression: 'window.location.href' })).result.value;
        if (t2Url.includes('start-journey.html')) {
            t2Passed = true;
            break;
        }
    }
    console.log('Incomplete onboarding redirected to:', t2Url);
    results['TEST 2: Incomplete Onboarding -> start-journey.html'] = t2Passed ? 'PASS' : 'FAIL';

    // Restore onboarding_completed: true in real Supabase database
    await sb.from('profiles').update({ onboarding_completed: true }).eq('id', authUserSign.user.id);

    // -------------------------------------------------------------
    // TEST 12: Email verification callback simulation
    // -------------------------------------------------------------
    console.log('\n--- [TEST 12] Email verification callback processing ---');
    const { data: freshSign } = await sb.auth.signInWithPassword({
        email: 'test_1789320265384@example.com',
        password: 'Password@123!'
    });
    
    // Navigate to auth-callback.html with hash tokens
    const callbackHash = `#access_token=${freshSign.session.access_token}&refresh_token=${freshSign.session.refresh_token}&token_type=bearer&type=signup`;
    await send('Page.navigate', { url: `http://127.0.0.1:8080/auth-callback.html${callbackHash}` });
    // Wait for callback exchange, onboarding check, and redirection to dashboard.html
    await new Promise(r => setTimeout(r, 4500));

    const t12State = (await send('Runtime.evaluate', {
        expression: `(() => {
            const loader = document.getElementById('auth-splash-loader');
            const greeting = document.getElementById('dashboard-greeting-text')?.textContent;
            return {
                url: window.location.href,
                hasLoader: Boolean(loader),
                greeting: greeting,
                sessionKey: Boolean(localStorage.getItem('sb-kkdqahqcochicfvkfyan-auth-token'))
            };
        })()`,
        returnByValue: true
    })).result.value;
    console.log('Callback destination state:', t12State);
    results['TEST 12: Verification Callback Restoration & Route'] = (t12State.url.includes('dashboard.html') && !t12State.hasLoader && t12State.greeting) ? 'PASS' : 'FAIL';

    // -------------------------------------------------------------
    // TEST 10: Optional dashboard API failure isolation
    // -------------------------------------------------------------
    console.log('\n--- [TEST 10] Optional dashboard API failure isolation ---');
    // Ensure dashboard renders even if study-tracker throws
    const t10State = (await send('Runtime.evaluate', {
        expression: `(() => {
            let threw = false;
            try {
                // simulate broken tracker
                window.StudyTracker = { getCachedToday: () => { throw new Error('Tracker DB offline'); } };
                DashboardPage.renderMetrics();
            } catch(e) {
                threw = true;
            }
            return {
                threw: threw,
                greeting: document.getElementById('dashboard-greeting-text')?.textContent,
                streak: document.getElementById('dash-metric-streak')?.textContent
            };
        })()`,
        returnByValue: true
    })).result.value;
    console.log('Optional widget isolation state:', t10State);
    results['TEST 10: Optional Dashboard Component Isolation'] = (!t10State.threw && t10State.greeting) ? 'PASS' : 'FAIL';

    // Cleanup Chrome
    ws.close();
    chrome.kill();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}

    console.log('\n====================================================');
    console.log('AUTOMATED AUDIT SUMMARY RESULTS:');
    console.log('====================================================');
    for (const [k, v] of Object.entries(results)) {
        console.log(`${k}: ${v}`);
    }
}

runAudit().catch(console.error);
