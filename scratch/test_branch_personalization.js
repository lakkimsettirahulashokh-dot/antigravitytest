const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runBranchPersonalizationTestMatrix() {
    console.log('================================================================');
    console.log('🧪 TECHPATH — VERIFYING BRANCH LEARNING PERSONALIZATION (9 TESTS)');
    console.log('================================================================\n');

    const testEmail = `student_branch_${Date.now()}@techpath.ai`;
    const testPassword = 'SecurePassword123!';

    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const testProfileDir = path.join(__dirname, 'chrome_test_profile_' + Date.now());
    const chromeProc = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=' + testProfileDir
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const results = {};
    function record(name, pass, details = '') {
        results[name] = pass;
        if (pass) {
            console.log(`✅ PASS: ${name}`);
        } else {
            console.error(`❌ FAIL: ${name} — ${details}`);
        }
    }

    try {
        const newTabResp = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
        const tab = await newTabResp.json();
        const ws = new globalThis.WebSocket(tab.webSocketDebuggerUrl);

        await new Promise((res, rej) => {
            ws.onopen = res;
            ws.onerror = rej;
        });

        let id = 1;
        const pending = new Map();
        const consoleErrors = [];

        ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            if (parsed.method === 'Runtime.consoleAPICalled' && parsed.params?.type === 'error') {
                const text = parsed.params.args?.map(a => a.value || a.description).join(' ');
                consoleErrors.push(text);
            }
            if (parsed.id && pending.has(parsed.id)) {
                if (parsed.error) {
                    console.error('CDP Error:', parsed.error);
                }
                pending.get(parsed.id)(parsed.result || parsed);
                pending.delete(parsed.id);
            }
        };

        function send(method, params = {}) {
            return new Promise((resolve) => {
                const msgId = id++;
                pending.set(msgId, (result) => {
                    if (result?.exceptionDetails) {
                        console.error('CDP Exception in', method, result.exceptionDetails);
                    }
                    resolve(result);
                });
                ws.send(JSON.stringify({ id: msgId, method, params }));
            });
        }

        const getVal = (res) => {
            if (!res) return {};
            if (res.result?.value !== undefined) return res.result.value;
            if (res.result?.result?.value !== undefined) return res.result.result.value;
            if (res.value !== undefined) return res.value;
            return res;
        };

        await send('Page.enable');
        await send('Runtime.enable');

        // -------------------------------------------------------------
        // Step 0: Setup Real Authenticated User Session in Supabase
        // -------------------------------------------------------------
        console.log(`--- CREATING AUTHENTICATED SUPABASE SESSION: ${testEmail} ---`);
        await send('Page.navigate', { url: 'http://127.0.0.1:8080/branch-learning.html' });
        await new Promise(r => setTimeout(r, 2000));

        const authInitEval = await send('Runtime.evaluate', {
            expression: `(async () => {
                if (window.SupabaseBridge) {
                    try { await window.SupabaseBridge.init(); } catch (e) {}
                }
                const client = window.SupabaseBridge?.client || window.supabaseClient;
                if (!client) return { error: 'Supabase client missing' };

                let user = null;
                let session = null;

                // 1. Try signUp first
                const { data: signUpData, error: signUpErr } = await client.auth.signUp({
                    email: '${testEmail}',
                    password: '${testPassword}'
                });

                if (signUpData?.user) {
                    user = signUpData.user;
                    session = signUpData.session;
                }

                // If no session, try signInWithPassword
                if (!session) {
                    const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
                        email: '${testEmail}',
                        password: '${testPassword}'
                    });
                    if (signInData?.user) {
                        user = signInData.user;
                        session = signInData.session;
                    }
                }

                if (!user) {
                    return { error: signUpErr?.message || 'Could not authenticate' };
                }

                // 2. Initialize profile with ECE
                const { data: profileData, error: profileErr } = await client
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email,
                        name: 'Alex Rivera',
                        full_name: 'Alex Rivera',
                        branch: 'ECE',
                        department_id: 'ECE',
                        semester: 2,
                        year: 1,
                        target_role: 'VLSI Engineer',
                        onboarding_completed: true,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                // 3. Sync AuthManager and BranchLearning
                if (window.AuthManager) {
                    await window.AuthManager.checkSession();
                    await window.AuthManager.syncUserProfile(user);
                }
                if (window.BranchLearning) {
                    await window.BranchLearning.init();
                }

                return {
                    userId: user.id,
                    email: user.email,
                    branch: profileData?.branch || 'ECE',
                    sessionExists: !!session
                };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('Session Initialization in Browser:', getVal(authInitEval));

        // -------------------------------------------------------------
        // TEST 1: ECE -> Branch Learning -> ECE content only
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 1: ECE Verification ---');
        await new Promise(r => setTimeout(r, 1000));

        const test1Eval = await send('Runtime.evaluate', {
            expression: `(() => {
                const heroTitle = document.getElementById('hero-title')?.innerText || '';
                const navTitle = document.getElementById('nav-branch-title')?.innerText || '';
                const modulesHtml = document.getElementById('modules-container')?.innerHTML || '';
                const isECE = heroTitle.toLowerCase().includes('semiconductor') || heroTitle.toLowerCase().includes('chips') || heroTitle.toLowerCase().includes('vlsi');
                const hasAuto = modulesHtml.toLowerCase().includes('combustion') || modulesHtml.toLowerCase().includes('powertrain');
                return { heroTitle, navTitle, isECE, hasAuto };
            })()`,
            returnByValue: true
        });
        const t1 = getVal(test1Eval);
        record('TEST 1: ECE content only displayed when branch is ECE', t1.isECE && !t1.hasAuto, `heroTitle="${t1.heroTitle}" hasAuto=${t1.hasAuto}`);

        // -------------------------------------------------------------
        // TEST 2: ECE -> Profile -> Automobile Engineering -> Save -> Branch Learning
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 2: Profile Update to Automobile Engineering ---');
        await send('Page.navigate', { url: 'http://127.0.0.1:8080/profile.html' });
        await new Promise(r => setTimeout(r, 2000));

        const profileSaveEval = await send('Runtime.evaluate', {
            expression: `(async () => {
                const branchSelect = document.getElementById('profile-input-branch');
                if (branchSelect) {
                    branchSelect.value = 'AUTO';
                    branchSelect.dispatchEvent(new Event('change'));
                }
                // Execute saveProfile via AuthManager.updateProfile
                if (window.AuthManager) {
                    const res = await window.AuthManager.updateProfile({
                        name: 'Alex Rivera',
                        full_name: 'Alex Rivera',
                        branch: 'AUTO',
                        department_id: 'AUTO',
                        department: 'AUTO',
                        semester: 2,
                        year: 1,
                        targetRole: 'EV Powertrain Engineer'
                    });
                    return { success: res?.success, branch: res?.profile?.branch, dept: res?.profile?.department_id };
                }
                return { success: false, error: 'AuthManager missing' };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });
        console.log('Profile save result in Supabase/AuthManager:', getVal(profileSaveEval));

        // Immediately navigate to branch-learning.html
        await send('Page.navigate', { url: 'http://127.0.0.1:8080/branch-learning.html' });
        await new Promise(r => setTimeout(r, 2500));

        const test2Eval = await send('Runtime.evaluate', {
            expression: `(() => {
                const heroTitle = document.getElementById('hero-title')?.innerText || '';
                const navTitle = document.getElementById('nav-branch-title')?.innerText || '';
                const modulesHtml = document.getElementById('modules-container')?.innerHTML || '';
                const isAuto = heroTitle.toLowerCase().includes('engine') || heroTitle.toLowerCase().includes('powertrain') || heroTitle.toLowerCase().includes('automobile');
                const hasStaleECE = modulesHtml.toLowerCase().includes('silicon physics') || modulesHtml.toLowerCase().includes('cmos inverter');
                return { heroTitle, navTitle, isAuto, hasStaleECE };
            })()`,
            returnByValue: true
        });
        const t2 = getVal(test2Eval);
        record('TEST 2: Automobile Engineering content only after profile save', t2.isAuto && !t2.hasStaleECE, `heroTitle="${t2.heroTitle}" hasStaleECE=${t2.hasStaleECE}`);

        // -------------------------------------------------------------
        // TEST 3: Automobile Engineering -> Refresh Page -> Remains Automobile
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 3: Refresh Persistence ---');
        await send('Page.reload');
        await new Promise(r => setTimeout(r, 2500));

        const test3Eval = await send('Runtime.evaluate', {
            expression: `(() => {
                const heroTitle = document.getElementById('hero-title')?.innerText || '';
                const isAuto = heroTitle.toLowerCase().includes('engine') || heroTitle.toLowerCase().includes('powertrain');
                return { heroTitle, isAuto };
            })()`,
            returnByValue: true
        });
        const t3 = getVal(test3Eval);
        record('TEST 3: Automobile Engineering persists across browser reload', t3.isAuto, `heroTitle="${t3.heroTitle}"`);

        // -------------------------------------------------------------
        // TEST 4: Automobile Engineering -> Session Re-init -> Remains Automobile
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 4: Session Restoration Across Re-authentication ---');
        const test4Eval = await send('Runtime.evaluate', {
            expression: `(async () => {
                // Invalidate cached profile in memory and re-query from Supabase session
                AuthManager.cachedProfile = null;
                await AuthManager.init();
                const restoredUser = AuthManager.getUser();
                await BranchLearning.init();
                const heroTitle = document.getElementById('hero-title')?.innerText || '';
                return {
                    restoredBranch: restoredUser?.branch || restoredUser?.department_id,
                    heroTitle,
                    isAuto: heroTitle.toLowerCase().includes('engine') || heroTitle.toLowerCase().includes('powertrain')
                };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });
        const t4 = getVal(test4Eval);
        record('TEST 4: Automobile Engineering restored correctly after session init', t4.isAuto, `restoredBranch=${t4.restoredBranch}`);

        // -------------------------------------------------------------
        // TEST 5: Automobile -> Change to Mechanical Engineering (MECH) -> Save -> Mechanical content
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 5: Switch to Mechanical Engineering ---');
        await send('Runtime.evaluate', {
            expression: `(async () => {
                await AuthManager.updateProfile({
                    name: 'Alex Rivera',
                    full_name: 'Alex Rivera',
                    branch: 'MECH',
                    department_id: 'MECH',
                    department: 'MECH',
                    semester: 3
                });
            })()`,
            awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 1000));

        const test5Eval = await send('Runtime.evaluate', {
            expression: `(() => {
                const heroTitle = document.getElementById('hero-title')?.innerText || '';
                const modulesHtml = document.getElementById('modules-container')?.innerHTML || '';
                const isMech = heroTitle.toLowerCase().includes('mechanical') || heroTitle.toLowerCase().includes('thermodynamics');
                const hasStaleAuto = modulesHtml.toLowerCase().includes('fuel delivery telemetry') || modulesHtml.toLowerCase().includes('electric powertrain transition');
                return { heroTitle, isMech, hasStaleAuto };
            })()`,
            returnByValue: true
        });
        const t5 = getVal(test5Eval);
        record('TEST 5: Mechanical Engineering content dynamically replaces Automobile', t5.isMech && !t5.hasStaleAuto, `heroTitle="${t5.heroTitle}"`);

        // -------------------------------------------------------------
        // TEST 6: Mechanical Engineering -> Change to CSE -> Save -> CSE content
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 6: Switch to Computer Science (CSE) ---');
        await send('Runtime.evaluate', {
            expression: `(async () => {
                await AuthManager.updateProfile({
                    name: 'Alex Rivera',
                    full_name: 'Alex Rivera',
                    branch: 'CSE',
                    department_id: 'CSE',
                    department: 'CSE',
                    semester: 4
                });
            })()`,
            awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 1000));

        const test6Eval = await send('Runtime.evaluate', {
            expression: `(() => {
                const heroTitle = document.getElementById('hero-title')?.innerText || '';
                const modulesHtml = document.getElementById('modules-container')?.innerHTML || '';
                const isCSE = heroTitle.toLowerCase().includes('software') || heroTitle.toLowerCase().includes('computer systems');
                const hasStaleMech = modulesHtml.toLowerCase().includes('rankine') || modulesHtml.toLowerCase().includes('solidworks');
                return { heroTitle, isCSE, hasStaleMech };
            })()`,
            returnByValue: true
        });
        const t6 = getVal(test6Eval);
        record('TEST 6: CSE content dynamically replaces Mechanical', t6.isCSE && !t6.hasStaleMech, `heroTitle="${t6.heroTitle}"`);

        // -------------------------------------------------------------
        // TEST 7: Cross-Page Navigation (Dashboard, LearnHub, Skills, Projects, Internships)
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 7: Cross-Page Consistency ---');
        // Set user to Automobile Engineering
        await send('Runtime.evaluate', {
            expression: `(async () => {
                await AuthManager.updateProfile({
                    name: 'Alex Rivera',
                    full_name: 'Alex Rivera',
                    branch: 'AUTO',
                    department_id: 'AUTO',
                    department: 'AUTO',
                    semester: 2
                });
            })()`,
            awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 500));

        // Check Dashboard banner
        await send('Page.navigate', { url: 'http://127.0.0.1:8080/dashboard.html' });
        await new Promise(r => setTimeout(r, 2000));
        const dashEval = await send('Runtime.evaluate', {
            expression: `(() => {
                const title = document.getElementById('dash-ai-rec-title')?.innerText || '';
                const badge = document.getElementById('dashboard-user-badge')?.innerText || '';
                return { title, badge, isAuto: title.toLowerCase().includes('powertrain') || title.toLowerCase().includes('engine') };
            })()`,
            returnByValue: true
        });

        // Check Internships banner
        await send('Page.navigate', { url: 'http://127.0.0.1:8080/internships.html' });
        let internBanner = '';
        let isInternAuto = false;
        for (let attempt = 0; attempt < 15; attempt++) {
            await new Promise(r => setTimeout(r, 300));
            const internEval = await send('Runtime.evaluate', {
                expression: `(() => {
                    const banner = document.getElementById('active-branch-name')?.innerText || '';
                    return { banner, isAuto: banner.toLowerCase().includes('auto') };
                })()`,
                returnByValue: true
            });
            const res = getVal(internEval);
            internBanner = res.banner || '';
            isInternAuto = res.isAuto || false;
            if (isInternAuto) break;
        }

        const dRes = getVal(dashEval);
        record('TEST 7: Cross-Page branch consistency (Dashboard & Internships)', dRes.isAuto && isInternAuto, `dashTitle="${dRes.title}" internBanner="${internBanner}"`);

        // -------------------------------------------------------------
        // TEST 8: Race Condition / Slow Network Protection
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 8: Race Condition Protection ---');
        await send('Page.navigate', { url: 'http://127.0.0.1:8080/branch-learning.html' });
        await new Promise(r => setTimeout(r, 2000));

        const raceEval = await send('Runtime.evaluate', {
            expression: `(async () => {
                // Rapidly request ECE, then immediately AUTO
                BranchLearning.currentBranch = 'ECE';
                const p1 = BranchLearning.loadSpecialization();
                BranchLearning.currentBranch = 'AUTO';
                const p2 = BranchLearning.loadSpecialization();
                await Promise.all([p1, p2]);
                const heroTitle = document.getElementById('hero-title')?.innerText || '';
                return {
                    heroTitle,
                    isLatestAuto: heroTitle.toLowerCase().includes('engine') || heroTitle.toLowerCase().includes('powertrain')
                };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });
        const rRes = getVal(raceEval);
        record('TEST 8: Stale rapid requests never overwrite latest selection', rRes.isLatestAuto, `heroTitle="${rRes.heroTitle}"`);

        // -------------------------------------------------------------
        // TEST 9: No Branch Selected -> Clean Empty State (No Fake ECE)
        // -------------------------------------------------------------
        console.log('\n--- RUNNING TEST 9: No Branch Selected State ---');
        const test9Eval = await send('Runtime.evaluate', {
            expression: `(async () => {
                BranchLearning.currentBranch = '';
                await BranchLearning.loadSpecialization();
                const containerHtml = document.getElementById('modules-container')?.innerHTML || '';
                const hasSelectMsg = containerHtml.includes('Select your branch in Profile');
                const hasFakeECE = containerHtml.toLowerCase().includes('vlsi') || containerHtml.toLowerCase().includes('silicon');
                return { hasSelectMsg, hasFakeECE };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });
        const t9 = getVal(test9Eval);
        record('TEST 9: No branch selected displays clean selection state without ECE fallback', t9.hasSelectMsg && !t9.hasFakeECE, `hasSelectMsg=${t9.hasSelectMsg} hasFakeECE=${t9.hasFakeECE}`);

        // Capture screenshot of Automobile Engineering Branch Learning
        await send('Runtime.evaluate', {
            expression: `(async () => {
                BranchLearning.currentBranch = 'AUTO';
                await BranchLearning.loadSpecialization();
            })()`,
            awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 1000));
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(__dirname, 'branch_learning_auto.png'), Buffer.from(screenshot.data, 'base64'));
        console.log(`📸 Screenshot captured at: ${path.join(__dirname, 'branch_learning_auto.png')}`);

        ws.close();
    } finally {
        chromeProc.kill('SIGKILL');
    }

    console.log('\n================================================================');
    let allPassed = true;
    for (const [name, pass] of Object.entries(results)) {
        if (!pass) allPassed = false;
    }
    if (allPassed) {
        console.log('🎉 100% COMPLETE: All 9 Tests in Test Matrix Passed in Real Browser!');
    } else {
        console.error('💥 Some tests in the test matrix failed!');
    }
    console.log('================================================================');
    process.exit(allPassed ? 0 : 1);
}

runBranchPersonalizationTestMatrix().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
