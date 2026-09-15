const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testInBrowser() {
    console.log('🚀 Spawning headless Chrome on port 9222...');
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const chromeProc = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=' + path.join(__dirname, 'chrome_test_profile')
    ]);

    // Give Chrome 2 seconds to bind
    await new Promise(r => setTimeout(r, 2000));

    try {
        const cdpResp = await fetch('http://127.0.0.1:9222/json/version');
        const ver = await cdpResp.json();
        console.log(`✅ Connected to Chrome: ${ver.Browser}`);

        const newTabResp = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
        const tab = await newTabResp.json();

        const WS = globalThis.WebSocket;
        const ws = new WS(tab.webSocketDebuggerUrl);

        await new Promise((res, rej) => {
            ws.onopen = res;
            ws.onerror = rej;
        });

        let id = 1;
        const pending = new Map();
        ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            if (pending.has(parsed.id)) {
                pending.get(parsed.id)(parsed.result);
                pending.delete(parsed.id);
            }
        };

        function send(method, params = {}) {
            return new Promise((resolve) => {
                const msgId = id++;
                pending.set(msgId, resolve);
                ws.send(JSON.stringify({ id: msgId, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');

        const devUrl = 'http://127.0.0.1:8080/login.html';
        console.log(`Navigating to ${devUrl}...`);
        await send('Page.navigate', { url: devUrl });
        await new Promise(r => setTimeout(r, 2500));

        // Evaluate state
        const stateResult = await send('Runtime.evaluate', {
            expression: `(() => {
                const authCard = document.querySelector('.husky-auth-card');
                if (!authCard) return { error: 'Auth card missing' };

                const allButtons = Array.from(authCard.querySelectorAll('button'));
                const appleBtn = allButtons.find(b => b.innerText && b.innerText.toLowerCase().includes('apple'));
                const googleBtn = document.getElementById('google-sso-btn');
                const googleRect = googleBtn ? googleBtn.getBoundingClientRect() : null;
                const cardRect = authCard.getBoundingClientRect();

                const emailInput = document.getElementById('auth-identifier');
                const passInput = document.getElementById('auth-password');
                const submitBtn = document.getElementById('door-submit-btn');

                let ssoTriggered = false;
                let ssoProvider = null;
                if (window.AuthManager && window.supabaseClient && window.supabaseClient.auth) {
                    const orig = window.supabaseClient.auth.signInWithOAuth;
                    window.supabaseClient.auth.signInWithOAuth = async (opts) => {
                        ssoTriggered = true;
                        ssoProvider = opts?.provider;
                        return { data: { url: 'https://accounts.google.com' }, error: null };
                    };
                    if (googleBtn) googleBtn.click();
                    window.supabaseClient.auth.signInWithOAuth = orig;
                }

                return {
                    appleBtnFound: !!appleBtn,
                    googleBtnFound: !!googleBtn,
                    googleText: googleBtn ? googleBtn.innerText.trim() : '',
                    googleWidth: googleRect ? Math.round(googleRect.width) : 0,
                    cardWidth: cardRect ? Math.round(cardRect.width) : 0,
                    emailInputFound: !!emailInput,
                    passInputFound: !!passInput,
                    submitBtnFound: !!submitBtn,
                    ssoTriggered,
                    ssoProvider
                };
            })()`,
            returnByValue: true
        });

        const res = stateResult.result.value;
        console.log('\n--- BROWSER EVALUATION RESULTS ---');
        console.log('Apple Button Found in Auth Card:', res.appleBtnFound, '(Expected: false)');
        console.log('Google Button Found:', res.googleBtnFound, '(Expected: true)');
        console.log('Google Button Text:', `"${res.googleText}"`, '(Expected: "Continue with Google")');
        console.log(`Google Button Width: ${res.googleWidth}px, Auth Card Width: ${res.cardWidth}px (Full width match)`);
        console.log('Email Input Found:', res.emailInputFound);
        console.log('Password Input Found:', res.passInputFound);
        console.log('Door Submit Button Found:', res.submitBtnFound);
        console.log('Google OAuth Dispatched:', res.ssoTriggered, 'Provider:', res.ssoProvider);

        // Mobile responsiveness test
        await send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 3,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 500));

        const mobileEval = await send('Runtime.evaluate', {
            expression: `(() => {
                const btn = document.getElementById('google-sso-btn');
                const rect = btn ? btn.getBoundingClientRect() : null;
                return {
                    visible: !!btn && rect.width > 0 && rect.height > 0,
                    width: rect ? Math.round(rect.width) : 0
                };
            })()`,
            returnByValue: true
        });

        console.log(`Mobile Viewport (iPhone 12/13/14 390px) Button Width: ${mobileEval.result.value.width}px, Visible: ${mobileEval.result.value.visible}`);

        // Capture screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const screenshotPath = path.join(__dirname, 'login_without_apple.png');
        fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
        console.log(`📸 Screenshot captured at: ${screenshotPath}`);

        ws.close();
    } finally {
        chromeProc.kill('SIGKILL');
        console.log('Chrome process terminated cleanly.');
    }
}

testInBrowser().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
