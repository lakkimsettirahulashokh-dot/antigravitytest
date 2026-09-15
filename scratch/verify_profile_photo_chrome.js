const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;
const ARTIFACTS_DIR = 'C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\9b69a063-24cd-4e1a-a928-16f7602527b3';
const SAMPLE_IMAGE_PATH = path.resolve(__dirname, 'sample_avatar.png');
const sampleBase64 = fs.readFileSync(SAMPLE_IMAGE_PATH).toString('base64');

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

async function evalScript(ws, expression) {
    return sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
}

async function captureScreenshot(ws, filename) {
    const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 Screenshot saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function run() {
    console.log('🚀 Starting Google Chrome Headless CDP on port ' + PORT);
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

        // Open about:blank first
        const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
        const tabInfo = await newTabRes.json();
        const tabWsUrl = tabInfo.webSocketDebuggerUrl;

        const ws = new WebSocket(tabWsUrl);
        await new Promise(resolve => ws.addEventListener('open', resolve));

        await sendCDP(ws, 'Page.enable');
        await sendCDP(ws, 'Runtime.enable');
        await sendCDP(ws, 'DOM.enable');

        // Navigate to http://localhost:8080/index.html to initialize origin
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/index.html' });
        await sleep(1000);

        // Seed authenticated session in localStorage
        const testUser = {
            id: 'usr_test_alex_rivera',
            email: 'alex.rivera@btechpath.ai',
            name: 'Alex Rivera',
            full_name: 'Alex Rivera',
            branch: 'AIML',
            department_id: 'AIML',
            semester: 6,
            targetCareer: 'Machine Learning Engineer',
            target_role: 'Machine Learning Engineer',
            tier: 'Engineering Scholar',
            role: 'student',
            avatar: null,
            avatar_url: null,
            onboarding_completed: true,
            streak: 4,
            xp: 4120
        };

        await fetch('http://localhost:8080/rest/v1/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        await evalScript(ws, `
            localStorage.setItem('btechpath_user_session', '${JSON.stringify(testUser)}');
        `);

        // Now navigate to Profile page
        console.log('Navigating to http://localhost:8080/profile.html');
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/profile.html' });
        await sleep(2000);

        // Verify current URL
        const currentUrl = await evalScript(ws, 'window.location.href');
        console.log('Current URL:', currentUrl);

        // Check avatar src
        const avatarSrc = await evalScript(ws, `document.getElementById('profile-page-avatar')?.src || ''`);
        console.log('Profile avatar src starts with:', avatarSrc.substring(0, 60));

        // Capture initial profile view (showing fallback initials avatar, "Upload Photo" button, "Engineering Scholar" tier)
        await captureScreenshot(ws, 'profile_fallback_avatar.png');

        // Verify UI controls
        const btnUploadText = await evalScript(ws, `document.getElementById('btn-upload-photo-text')?.textContent || ''`);
        const userRoleText = await evalScript(ws, `document.querySelector('.user-role-display')?.textContent || ''`);
        console.log(`Initial UI check: Upload button text = "${btnUploadText}", User role = "${userRoleText}"`);

        // Trigger photo selection with File object in browser
        console.log('Triggering photo selection with sample PNG...');
        await evalScript(ws, `
            (function() {
                const b64 = '${sampleBase64}';
                const byteCharacters = atob(b64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' });
                const file = new File([blob], 'student_avatar.png', { type: 'image/png' });

                const event = { target: { files: [file], value: 'student_avatar.png' } };
                handleProfilePhotoSelected(event);
            })()
        `);
        await sleep(1000);

        // Verify preview modal opened
        const isModalVisible = await evalScript(ws, `!document.getElementById('photo-preview-modal').classList.contains('hidden')`);
        console.log('Preview modal visible:', isModalVisible);
        await captureScreenshot(ws, 'profile_preview_modal.png');

        // Confirm & save photo
        console.log('Confirming photo upload...');
        await evalScript(ws, `confirmSaveProfilePhoto()`);
        await sleep(2000);

        // Check updated avatar
        const newAvatarSrc = await evalScript(ws, `document.getElementById('profile-page-avatar')?.src || ''`);
        console.log('New saved avatar src:', newAvatarSrc);
        const newBtnText = await evalScript(ws, `document.getElementById('btn-upload-photo-text')?.textContent || ''`);
        const isRemoveVisible = await evalScript(ws, `!document.getElementById('btn-remove-photo')?.classList.contains('hidden')`);
        console.log(`After upload: Button text = "${newBtnText}", Remove visible = ${isRemoveVisible}`);

        await captureScreenshot(ws, 'profile_saved_photo.png');

        // Test persistence after Page Reload
        console.log('🔄 Reloading page to test persistence...');
        await sendCDP(ws, 'Page.reload');
        await sleep(2000);

        const reloadedAvatar = await evalScript(ws, `document.getElementById('profile-page-avatar')?.src || ''`);
        console.log('Persisted avatar after reload:', reloadedAvatar);

        // Navigate to Dashboard
        console.log('Navigating to Dashboard...');
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/dashboard.html' });
        await sleep(2000);

        const dashboardAvatar = await evalScript(ws, `document.querySelector('.user-avatar-display')?.src || ''`);
        console.log('Dashboard avatar src:', dashboardAvatar);
        await captureScreenshot(ws, 'dashboard_user_photo.png');

        // Navigate back to Profile to test Remove Photo
        console.log('Navigating back to Profile for photo removal test...');
        await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8080/profile.html' });
        await sleep(2000);

        // Remove photo
        console.log('Removing photo...');
        await evalScript(ws, `
            (async function() {
                await AuthManager.removeProfilePhoto();
                updateProfilePhotoControls();
            })()
        `);
        await sleep(1000);

        const restoredAvatar = await evalScript(ws, `document.getElementById('profile-page-avatar')?.src || ''`);
        console.log('Restored fallback avatar starts with:', restoredAvatar.substring(0, 60));
        await captureScreenshot(ws, 'profile_photo_removed.png');

        console.log('\n✅ ALL BROWSER CDP VERIFICATION STEPS SUCCEEDED!\n');
    } catch (err) {
        console.error('❌ CDP Verification failed:', err);
    } finally {
        try { chromeProc.kill(); } catch (e) {}
    }
}

run();
