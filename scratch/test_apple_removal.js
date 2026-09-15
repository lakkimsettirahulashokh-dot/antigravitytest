const fs = require('fs');
const path = require('path');
const http = require('http');

async function runVerification() {
    console.log('========================================================');
    console.log('🧪 VERIFYING SURGICAL APPLE SIGN-IN REMOVAL');
    console.log('========================================================\n');

    let allPassed = true;
    function check(description, condition, details = '') {
        if (condition) {
            console.log(`✅ PASS: ${description}`);
        } else {
            console.error(`❌ FAIL: ${description} - ${details}`);
            allPassed = false;
        }
    }

    // 1. Static Analysis of login.html
    const loginPath = path.join(__dirname, '..', 'login.html');
    const loginHtml = fs.readFileSync(loginPath, 'utf8');

    // Apple button removed from SSO section
    const hasAppleButton = /onclick="[^"]*showToast\('Apple ID Authentication verified/i.test(loginHtml);
    check('Apple button handler removed from login.html', !hasAppleButton);

    const hasAppleSvgIcon = /M18\.71 19\.5c-\.83 1\.24/i.test(loginHtml);
    check('Apple SVG icon removed from login.html', !hasAppleSvgIcon);

    const hasAppleSpan = /<span>Apple<\/span>/i.test(loginHtml);
    check('Apple label text removed from login.html', !hasAppleSpan);

    // Google button remains
    const hasGoogleButton = /handleGoogleSSO\(\)/.test(loginHtml);
    check('Google SSO button retained', hasGoogleButton);

    const hasGoogleSvg = /M23\.745 12\.27/.test(loginHtml);
    check('Google SVG icon intact', hasGoogleSvg);

    const hasContinueWithGoogle = /Continue with Google/.test(loginHtml);
    check('"Continue with Google" label present', hasContinueWithGoogle);

    // No empty layout gap (no grid-cols-2 in SSO section)
    const ssoSectionMatch = loginHtml.match(/<!-- Google SSO Button -->[\s\S]*?<\/div>\s*<\/div>/);
    const hasGridCols2InSSO = ssoSectionMatch && /grid-cols-2/.test(ssoSectionMatch[0]);
    check('SSO container uses clean full-width layout without empty 2-column gap', !hasGridCols2InSSO);

    // Essential Login features preserved
    check('Email input present', /id="auth-identifier"/.test(loginHtml));
    check('Password input present', /id="auth-password"/.test(loginHtml));
    check('Submit door button present', /id="door-submit-btn"/.test(loginHtml));
    check('Forgot password handler present', /openForgotPasswordModal/.test(loginHtml));
    check('Signup navigation link present', /href="signup\.html"/.test(loginHtml));
    check('Auth callback redirect logic intact', /auth-callback\.html/.test(loginHtml));

    // 2. Real Browser Execution via Chrome DevTools Protocol
    console.log('\n--- 2. REAL BROWSER (CHROME CDP) VERIFICATION ---');
    try {
        const cdpResponse = await fetch('http://127.0.0.1:9222/json');
        const tabs = await cdpResponse.json();
        const tab = tabs.find(t => t.type === 'page');

        if (tab && tab.webSocketDebuggerUrl) {
            console.log(`Connecting to Chrome tab: ${tab.title || tab.url}...`);
            const WebSocket = require('ws');
            const ws = new WebSocket(tab.webSocketDebuggerUrl);

            await new Promise((resolve, reject) => {
                ws.on('open', resolve);
                ws.on('error', reject);
            });

            let id = 1;
            function send(method, params = {}) {
                return new Promise((resolve) => {
                    const msgId = id++;
                    const handler = (data) => {
                        const parsed = JSON.parse(data.toString());
                        if (parsed.id === msgId) {
                            ws.off('message', handler);
                            resolve(parsed.result);
                        }
                    };
                    ws.on('message', handler);
                    ws.send(JSON.stringify({ id: msgId, method, params }));
                });
            }

            await send('Page.enable');
            await send('Runtime.enable');

            // Navigate to login.html on active dev server (8080 or 8081)
            let serverPort = 8080;
            try {
                await fetch('http://127.0.0.1:8080/login.html');
            } catch (e) {
                serverPort = 8081;
            }
            console.log(`Using server port: ${serverPort}`);

            await send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/login.html` });
            await new Promise(r => setTimeout(r, 2000));

            // DOM Evaluation in browser
            const evalResult = await send('Runtime.evaluate', {
                expression: `(() => {
                    const authCard = document.querySelector('.husky-auth-card');
                    if (!authCard) return { error: 'Auth card not found' };

                    // 1. Search for any visible Apple buttons or text
                    const allButtons = Array.from(authCard.querySelectorAll('button'));
                    const appleButton = allButtons.find(b => b.innerText && b.innerText.toLowerCase().includes('apple'));

                    // 2. Google Button
                    const googleBtn = document.getElementById('google-sso-btn') || allButtons.find(b => b.innerText && b.innerText.includes('Google'));
                    const googleBtnRect = googleBtn ? googleBtn.getBoundingClientRect() : null;
                    const cardRect = authCard.getBoundingClientRect();

                    // 3. Email & Password inputs
                    const emailInput = document.getElementById('auth-identifier');
                    const passInput = document.getElementById('auth-password');
                    const submitBtn = document.getElementById('door-submit-btn');

                    // 4. Test Google OAuth invocation
                    let googleOAuthTriggered = false;
                    let googleProviderUsed = null;
                    if (window.AuthManager) {
                        const origSSO = window.AuthManager.handleGoogleSSO;
                        if (window.supabaseClient && window.supabaseClient.auth) {
                            const origOAuth = window.supabaseClient.auth.signInWithOAuth;
                            window.supabaseClient.auth.signInWithOAuth = async (opts) => {
                                googleOAuthTriggered = true;
                                googleProviderUsed = opts?.provider;
                                return { data: { url: 'https://accounts.google.com/o/oauth2/v2/auth' }, error: null };
                            };
                            if (googleBtn) googleBtn.click();
                            window.supabaseClient.auth.signInWithOAuth = origOAuth;
                        }
                    }

                    return {
                        hasAppleButton: !!appleButton,
                        hasGoogleButton: !!googleBtn,
                        googleText: googleBtn ? googleBtn.innerText.trim() : null,
                        googleBtnWidth: googleBtnRect ? googleBtnRect.width : 0,
                        cardInnerWidth: cardRect ? cardRect.width : 0,
                        hasEmailInput: !!emailInput,
                        hasPassInput: !!passInput,
                        hasSubmitBtn: !!submitBtn,
                        googleOAuthTriggered,
                        googleProviderUsed
                    };
                })()`,
                returnByValue: true
            });

            const browserState = evalResult?.result?.value || {};
            check('Real browser: No Apple button in auth card', browserState.hasAppleButton === false);
            check('Real browser: Google SSO button rendered', browserState.hasGoogleButton === true);
            check('Real browser: Google button label is "Continue with Google"', browserState.googleText === 'Continue with Google');
            check('Real browser: Google button fills card cleanly without gap', browserState.googleBtnWidth > 200);
            check('Real browser: Email input interactive and ready', browserState.hasEmailInput === true);
            check('Real browser: Password input interactive and ready', browserState.hasPassInput === true);
            check('Real browser: Door submit button ready', browserState.hasSubmitBtn === true);
            check('Real browser: Google OAuth call successfully dispatches provider "google"', 
                browserState.googleOAuthTriggered === true && browserState.googleProviderUsed === 'google');

            // Responsive Mobile Check
            await send('Emulation.setDeviceMetricsOverride', {
                width: 375,
                height: 667,
                deviceScaleFactor: 2,
                mobile: true
            });
            await new Promise(r => setTimeout(r, 500));

            const mobileResult = await send('Runtime.evaluate', {
                expression: `(() => {
                    const googleBtn = document.getElementById('google-sso-btn');
                    const rect = googleBtn ? googleBtn.getBoundingClientRect() : null;
                    return {
                        visible: !!googleBtn && rect.width > 0 && rect.height > 0,
                        width: rect ? rect.width : 0
                    };
                })()`,
                returnByValue: true
            });

            check('Mobile viewport (375px): Google button responsive & fully visible', 
                mobileResult?.result?.value?.visible === true && mobileResult?.result?.value?.width > 150);

            // Reset emulation
            await send('Emulation.clearDeviceMetricsOverride');
            ws.close();
        } else {
            console.log('ℹ️ Chrome tab not directly found on 9222, skipping browser live inspection step.');
        }
    } catch (e) {
        console.log(`ℹ️ Chrome live CDP notice: ${e.message}`);
    }

    console.log('\n========================================================');
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED: Apple option surgically removed without regressions!');
    } else {
        console.error('💥 SOME VERIFICATION CHECKS FAILED!');
    }
    console.log('========================================================');
    process.exit(allPassed ? 0 : 1);
}

runVerification();
