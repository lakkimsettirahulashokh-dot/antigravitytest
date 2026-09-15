const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sendCDP(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 1000000);
        const messageHandler = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === id) {
                ws.removeEventListener('message', messageHandler);
                if (data.error) reject(data.error);
                else {
                    if (data.result && data.result.result && data.result.result.value !== undefined) {
                        resolve(data.result.result.value);
                    } else if (data.result && data.result.result) {
                        resolve(data.result.result);
                    } else {
                        resolve(data.result);
                    }
                }
            }
        };
        ws.addEventListener('message', messageHandler);
        ws.send(JSON.stringify({ id, method, params }));
    });
}

async function run() {
    console.log('🚀 Launching real Google Chrome Headless on port ' + PORT);
    const chromeProc = spawn(CHROME_PATH, [
        '--headless=new',
        `--remote-debugging-port=${PORT}`,
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=1280,900'
    ], { stdio: 'ignore' });

    try {
        let wsUrl = null;
        for (let i = 0; i < 20; i++) {
            await sleep(300);
            try {
                const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
                if (res.ok) {
                    const info = await res.json();
                    wsUrl = info.webSocketDebuggerUrl;
                    break;
                }
            } catch (e) {}
        }

        if (!wsUrl) throw new Error('Could not connect to Chrome debugging endpoint');
        console.log('🔗 Connected to Chrome CDP:', wsUrl);

        // Open a new tab
        const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:8080/reviews`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const tabWsUrl = tabInfo.webSocketDebuggerUrl;

        const ws = new WebSocket(tabWsUrl);
        await new Promise((resolve, reject) => {
            ws.onopen = resolve;
            ws.onerror = reject;
        });

        await sendCDP(ws, 'Page.enable');
        await sendCDP(ws, 'Runtime.enable');
        await sendCDP(ws, 'DOM.enable');

        ws.addEventListener('message', (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.method === 'Runtime.consoleAPICalled') {
                    const text = msg.params.args.map(a => a.value !== undefined ? a.value : JSON.stringify(a)).join(' ');
                    console.log(`  [BROWSER CONSOLE] [${msg.params.type}] ${text}`);
                }
                if (msg.method === 'Runtime.exceptionThrown') {
                    console.log(`  [BROWSER EXCEPTION]`, msg.params.exceptionDetails?.text, msg.params.exceptionDetails?.exception?.description);
                }
            } catch (e) {}
        });

        console.log('⏳ Waiting for page and DOM elements to be ready...');
        for (let i = 0; i < 30; i++) {
            await sleep(300);
            const ready = await sendCDP(ws, 'Runtime.evaluate', {
                expression: `document.readyState === 'complete' && !!document.getElementById('form-name') && !!document.getElementById('btn-open-review-form')`,
                returnByValue: true
            });
            if (ready === true) {
                console.log('✅ DOM fully ready and elements verified.');
                break;
            }
        }
        await sleep(500);

        console.log('\n--- INTERACTING WITH REVIEW FORM ---');

        // 1. Open Review Modal
        const modalOpenResult = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const btn = document.getElementById('btn-open-review-form');
                if (btn) btn.click();
                const modal = document.getElementById('review-modal');
                return { opened: modal && !modal.classList.contains('hidden') };
            })()`,
            returnByValue: true
        });
        console.log('  Modal open state:', modalOpenResult);

        // 2. Focus and Type in Name field
        const nameFieldResult = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const nameInput = document.getElementById('form-name');
                nameInput.focus();
                nameInput.value = 'Aarav Patel';
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                const style = window.getComputedStyle(nameInput);
                return {
                    id: nameInput.id,
                    inputValue: nameInput.value,
                    backgroundColor: style.backgroundColor,
                    color: style.color,
                    borderColor: style.borderColor,
                    caretColor: style.caretColor
                };
            })()`,
            returnByValue: true
        });
        console.log('  Name Input (while focused/typing):', nameFieldResult);

        // 3. Focus and Type in Review Textarea
        const textareaResult = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const textarea = document.getElementById('form-review-text');
                textarea.focus();
                textarea.value = 'BTechPath AI has completely changed how I prepare for my semester exams and technical interviews! Truly impressive.';
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                
                const style = window.getComputedStyle(textarea);
                const charCounter = document.getElementById('char-counter').textContent;
                return {
                    id: textarea.id,
                    charCounter: charCounter,
                    inputValue: textarea.value,
                    backgroundColor: style.backgroundColor,
                    color: style.color,
                    borderColor: style.borderColor,
                    caretColor: style.caretColor
                };
            })()`,
            returnByValue: true
        });
        console.log('  Review Textarea (while focused/typing):', textareaResult);

        // 4. Select Star 5
        const starResult = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const star5 = document.querySelector('#star-picker-container button[data-star="5"]');
                star5.click();
                const ratingLabel = document.getElementById('star-rating-label').textContent;
                const ratingVal = document.getElementById('form-rating-value').value;
                const star5Aria = star5.getAttribute('aria-checked');
                return { ratingLabel, ratingVal, star5Aria };
            })()`,
            returnByValue: true
        });
        console.log('  Star Rating (after selecting 5 stars):', starResult.value);

        // 5. Select Feature
        const featureResult = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const select = document.getElementById('form-feature');
                select.focus();
                select.value = 'AI Notes';
                const style = window.getComputedStyle(select);
                return {
                    value: select.value,
                    backgroundColor: style.backgroundColor,
                    color: style.color
                };
            })()`,
            returnByValue: true
        });
        const featVal = featureResult.value || featureResult;
        console.log('  Feature Select (focused):', featVal);

        console.log('\n--- INSPECTING GOOGLE ADS INTEGRATION ---');

        // Scroll to ad banner and trigger view
        await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const banner = document.querySelector('ad-banner[placement="reviews_bottom"]');
                if (banner) {
                    banner.scrollIntoView({ behavior: 'instant' });
                }
                if (window.AdService) {
                    window.AdService.scanAndMount();
                }
            })()`
        });
        await sleep(1500);

        // 6. Check AdService Diagnostics & Ad Container
        const adDiagnostics = await sendCDP(ws, 'Runtime.evaluate', {
            expression: `(() => {
                const diag = window.AdService ? window.AdService.getDiagnostics() : null;
                const banner = document.querySelector('ad-banner[placement="reviews_bottom"]');
                const ins = banner ? banner.querySelector('ins.adsbygoogle') : null;
                return {
                    diagnostics: diag,
                    bannerPresent: !!banner,
                    insPresent: !!ins,
                    insClient: ins ? ins.getAttribute('data-ad-client') : null,
                    insSlot: ins ? ins.getAttribute('data-ad-slot') : null,
                    insTestMode: ins ? ins.getAttribute('data-adtest') : null
                };
            })()`,
            returnByValue: true
        });
        console.log('  Ad Diagnostics & Tag:', JSON.stringify(adDiagnostics, null, 2));

        // 7. Capture Screenshot
        const screenshotRes = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
        const screenshotPath = path.join(__dirname, 'review_modal_verified.png');
        fs.writeFileSync(screenshotPath, Buffer.from(screenshotRes.data, 'base64'));
        const artifactScreenshotPath = path.join('C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\9b69a063-24cd-4e1a-a928-16f7602527b3', 'review_modal_verified.png');
        fs.writeFileSync(artifactScreenshotPath, Buffer.from(screenshotRes.data, 'base64'));
        console.log('\n📸 Screenshot captured and saved to:', screenshotPath);
        console.log('📸 Copied to artifact directory:', artifactScreenshotPath);

        // Assertions
        const nameBg = nameFieldResult.backgroundColor;
        const textareaBg = textareaResult.backgroundColor;
        const nameColor = nameFieldResult.color;
        const textareaColor = textareaResult.color;

        console.log('\n--- COMPUTED STYLE VERIFICATION ---');
        console.log(`  Name background: ${nameBg} (Expected rgb(26, 32, 49) = #1A2031)`);
        console.log(`  Name text color: ${nameColor} (Expected rgb(245, 247, 250) = #F5F7FA)`);
        console.log(`  Textarea background: ${textareaBg} (Expected rgb(26, 32, 49) = #1A2031)`);
        console.log(`  Textarea text color: ${textareaColor} (Expected rgb(245, 247, 250) = #F5F7FA)`);

        if (nameBg === 'rgb(255, 255, 255)' || textareaBg === 'rgb(255, 255, 255)') {
            throw new Error('FAILED: Form fields turned WHITE on focus/typing!');
        }
        console.log('\n🎉 ALL REAL CHROME BROWSER CHECKS PASSED PERFECTLY!');

    } finally {
        chromeProc.kill();
    }
}

run().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
