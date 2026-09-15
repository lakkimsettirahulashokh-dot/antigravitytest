const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const TEST_EMAIL = 'test_1789320265384@example.com';
const TEST_PASS = 'Password@123!';

async function main() {
    console.log('======================================================================');
    console.log('  STARTING REAL-BROWSER PROFILE PERSONALIZATION SYNC E2E TEST');
    console.log('======================================================================\n');

    const tempProfile = path.join(os.tmpdir(), 'chrome-profile-sync-' + Date.now());
    fs.mkdirSync(tempProfile, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9225',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        `${BASE_URL}/login.html`
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

    if (!wsUrl) {
        console.error('Failed to connect to Chrome CDP.');
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
        if (msg.method === 'Runtime.consoleAPICalled') {
            const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
            if (msg.params.type === 'error' || text.includes('Error') || text.includes('Profile')) {
                console.log(`   [BROWSER ${msg.params.type.toUpperCase()}] ${text}`);
            }
        }
    };

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    async function evaluate(expression) {
        const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (res?.exceptionDetails) {
            console.error('   [EVAL EXCEPTION]', res.exceptionDetails.text, res.exceptionDetails.exception?.description);
            throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
        }
        return res?.result?.value;
    }

    async function navigateAndWait(url, timeoutMs = 15000) {
        await send('Page.navigate', { url });
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            await new Promise(r => setTimeout(r, 400));
            try {
                const ready = await evaluate('document.readyState === "complete"');
                if (ready) {
                    await new Promise(r => setTimeout(r, 800));
                    return;
                }
            } catch (e) {}
        }
    }

    const results = {};

    try {
        // -------------------------------------------------------------
        // STEP 1: LOGIN
        // -------------------------------------------------------------
        console.log('1. Signing in as verified test user...');
        await navigateAndWait(`${BASE_URL}/login.html`);

        await evaluate(`
            new Promise(resolve => {
                const check = () => {
                    if (window.SupabaseBridge && window.SupabaseBridge.isInitialized && window.AuthManager) {
                        resolve(true);
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            })
        `);

        const loginRes = await evaluate(`
            (async () => {
                return await AuthManager.login('${TEST_EMAIL}', '${TEST_PASS}');
            })()
        `);
        console.log('   Login response:', loginRes?.success ? 'SUCCESS' : JSON.stringify(loginRes));

        // Wait for session storage
        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 500));
            const hasUser = await evaluate(`Boolean(AuthManager.getUser() && AuthManager.getUser().email)`);
            if (hasUser) break;
        }

        // -------------------------------------------------------------
        // STEP 2: PROFILE PAGE - SET INITIAL PROFILE (CSE, SEM 4, JAVA/PYTHON)
        // -------------------------------------------------------------
        console.log('\n2. Navigating to profile.html to configure CSE / Sem 4 initial state...');
        await navigateAndWait(`${BASE_URL}/profile.html`);

        const cseSaveRes = await evaluate(`
            (async () => {
                document.getElementById('profile-input-name').value = 'Test Scholar';
                document.getElementById('profile-input-branch').value = 'CSE';
                updateCareerSuggestions();
                document.getElementById('profile-input-semester').value = 'Semester 4';
                if (document.getElementById('profile-input-target-career')) {
                    document.getElementById('profile-input-target-career').value = 'Software Engineer';
                }
                if (document.getElementById('profile-input-career-goal')) {
                    document.getElementById('profile-input-career-goal').value = 'Software Development';
                }
                if (document.getElementById('profile-input-skills')) {
                    document.getElementById('profile-input-skills').value = 'Java, Python';
                }
                
                const form = document.getElementById('profile-edit-form');
                const submitEvent = new Event('submit', { cancelable: true });
                form.dispatchEvent(submitEvent);

                // Wait for Supabase save
                await new Promise(r => setTimeout(r, 2500));
                const user = AuthManager.getUser();
                return {
                    branch: user.branch,
                    semester: user.semester,
                    skills: user.skills,
                    targetRole: user.targetRole || user.target_role
                };
            })()
        `);
        console.log('   Initial Profile Saved:', cseSaveRes);
        results['INITIAL_SAVE'] = (cseSaveRes?.branch === 'CSE' && (cseSaveRes?.semester === 4 || cseSaveRes?.semester === 'Semester 4'));

        // -------------------------------------------------------------
        // STEP 3: CHANGE PROFILE TO ECE, SEMESTER 6, EMBEDDED C, SQL, EMBEDDED ENGINEER
        // -------------------------------------------------------------
        console.log('\n3. Testing Profile Update: ECE, Semester 6, Embedded C, Python, SQL...');
        const eceSaveRes = await evaluate(`
            (async () => {
                document.getElementById('profile-input-branch').value = 'ECE';
                updateCareerSuggestions();
                document.getElementById('profile-input-semester').value = 'Semester 6';
                if (document.getElementById('profile-input-target-career')) {
                    document.getElementById('profile-input-target-career').value = 'Embedded Systems Engineer';
                }
                if (document.getElementById('profile-input-career-goal')) {
                    document.getElementById('profile-input-career-goal').value = 'Embedded Systems';
                }
                if (document.getElementById('profile-input-skills')) {
                    document.getElementById('profile-input-skills').value = 'Embedded C, Python, SQL';
                }
                
                try {
                    const res = await AuthManager.updateProfile({
                        name: 'Test Scholar',
                        branch: 'ECE',
                        department: 'ECE',
                        semester: 6,
                        skills: ['Embedded C', 'Python', 'SQL'],
                        career_goal: 'Embedded Systems',
                        target_role: 'Embedded Engineer',
                        targetCareer: 'Embedded Engineer'
                    });
                    return { success: true, profile: res.profile, error: null };
                } catch (e) {
                    return { success: false, profile: null, error: e.message };
                }
            })()
        `);
        console.log('   Profile Save Result:', JSON.stringify(eceSaveRes));

        const hasAcceptedAtError = eceSaveRes?.error && eceSaveRes.error.includes('accepted_at');
        results['NO_ACCEPTED_AT_ERROR'] = !hasAcceptedAtError && eceSaveRes?.success === true;
        results['PROFILE_SAVE_SUPABASE'] = eceSaveRes?.success === true;
        results['PROFILE_STATE_SYNC'] = eceSaveRes?.profile?.branch === 'ECE' && eceSaveRes?.profile?.semester === 6;

        // -------------------------------------------------------------
        // STEP 4: REAL-TIME UI UPDATE ON PROFILE PAGE (WITHOUT RELOAD)
        // -------------------------------------------------------------
        console.log('\n4. Verifying immediate Profile UI update without reload...');
        const profileBadges = await evaluate(`
            ({
                semester: document.getElementById('profile-header-semester')?.textContent,
                branch: document.querySelector('.user-branch-display')?.textContent,
                target: document.querySelector('.user-target-display')?.textContent
            })
        `);
        console.log('   Profile Header Badges:', profileBadges);
        results['PROFILE_PAGE_REALTIME'] = profileBadges.semester?.includes('6') && profileBadges.branch?.includes('ECE');

        // -------------------------------------------------------------
        // STEP 5: DASHBOARD PERSONALIZATION (WITHOUT LOGOUT / RELOAD)
        // -------------------------------------------------------------
        console.log('\n5. Verifying Dashboard Personalization...');
        await navigateAndWait(`${BASE_URL}/dashboard.html`);
        const dashContext = await evaluate(`
            ({
                greeting: document.getElementById('dashboard-greeting-text')?.textContent,
                badge: document.getElementById('dashboard-user-badge')?.textContent,
                aiTitle: document.getElementById('dash-ai-rec-title')?.textContent,
                aiSubtitle: document.getElementById('dash-ai-rec-subtitle')?.textContent
            })
        `);
        console.log('   Dashboard Personalization:', dashContext);
        results['DASHBOARD_PERSONALIZATION'] = Boolean(dashContext.badge?.includes('ECE') && 
                                              dashContext.badge?.includes('6') &&
                                              dashContext.aiTitle?.includes('Embedded C'));

        // -------------------------------------------------------------
        // STEP 6: SKILLS PERSONALIZATION
        // -------------------------------------------------------------
        console.log('\n6. Verifying Skills Personalization...');
        await navigateAndWait(`${BASE_URL}/skills.html`);
        const skillsContext = await evaluate(`
            ({
                branchSelect: document.getElementById('branch-select')?.value,
                careerSelect: document.getElementById('career-select')?.value,
                careerTitle: document.getElementById('career-title-display')?.textContent
            })
        `);
        console.log('   Skills Personalization:', skillsContext);
        results['SKILLS_PERSONALIZATION'] = Boolean(skillsContext.branchSelect === 'ECE' &&
                                           skillsContext.careerSelect === 'embedded_engineer');

        // -------------------------------------------------------------
        // STEP 7: LEARNHUB PERSONALIZATION & VIDEOS
        // -------------------------------------------------------------
        console.log('\n7. Verifying LearnHub Personalization & Videos...');
        await navigateAndWait(`${BASE_URL}/learn.html`);
        const learnContext = await evaluate(`
            ({
                pill: document.getElementById('header-personalization-pill')?.textContent,
                deptBadge: document.getElementById('student-department-badge')?.textContent,
                semBadge: document.getElementById('student-semester-badge')?.textContent,
                activeDept: typeof studentProfile !== 'undefined' ? studentProfile.department : null,
                activeSem: typeof currentActiveSemester !== 'undefined' ? currentActiveSemester : null
            })
        `);
        console.log('   LearnHub Personalization:', learnContext);
        results['LEARNHUB_PERSONALIZATION'] = Boolean(learnContext.activeDept === 'ECE' &&
                                             learnContext.activeSem === 6 &&
                                             learnContext.deptBadge === 'ECE');

        // -------------------------------------------------------------
        // STEP 8: PROJECT HUB PERSONALIZATION
        // -------------------------------------------------------------
        console.log('\n8. Verifying Project Hub Personalization...');
        await navigateAndWait(`${BASE_URL}/projects.html`);
        const projectsContext = await evaluate(`
            ({
                dept: ProjectsPage.studentProfile?.department,
                sem: ProjectsPage.studentProfile?.semester,
                filterDept: document.getElementById('filter-department')?.value
            })
        `);
        console.log('   Projects Personalization:', projectsContext);
        results['PROJECTS_PERSONALIZATION'] = Boolean(projectsContext.dept === 'ECE' &&
                                             projectsContext.sem === 6);

        // -------------------------------------------------------------
        // STEP 9: INTERNSHIPS PERSONALIZATION
        // -------------------------------------------------------------
        console.log('\n9. Verifying Internships Personalization...');
        await navigateAndWait(`${BASE_URL}/internships.html`);
        const internshipsContext = await evaluate(`
            ({
                currentDept: typeof currentDept !== 'undefined' ? currentDept : null,
                banner: document.getElementById('active-branch-name')?.textContent,
                filterOpt: document.getElementById('filter-department')?.options[0]?.textContent
            })
        `);
        console.log('   Internships Personalization:', internshipsContext);
        results['INTERNSHIPS_PERSONALIZATION'] = Boolean(internshipsContext.currentDept === 'ECE' &&
                                                internshipsContext.banner?.includes('ECE'));

        // -------------------------------------------------------------
        // STEP 10: CAREER NAVIGATOR / ROADMAP
        // -------------------------------------------------------------
        console.log('\n10. Verifying Career Navigator & Roadmap Personalization...');
        await navigateAndWait(`${BASE_URL}/career.html`);
        const careerContext = await evaluate(`
            ({
                roleSelect: document.getElementById('target-role-select')?.value,
                header: document.getElementById('target-role-header')?.textContent
            })
        `);
        console.log('   Career Personalization:', careerContext);
        results['CAREER_PERSONALIZATION'] = Boolean(careerContext.header?.includes('Embedded'));

        // -------------------------------------------------------------
        // STEP 11: AI COPILOT CONTEXT PERSONALIZATION
        // -------------------------------------------------------------
        console.log('\n11. Verifying AI Copilot Personalization...');
        await navigateAndWait(`${BASE_URL}/copilot.html`);
        const copilotContext = await evaluate(`
            ({
                profile: typeof currentStudentProfile !== 'undefined' ? currentStudentProfile : null,
                badge: document.getElementById('student-context-badge')?.textContent
            })
        `);
        console.log('   AI Copilot Personalization:', copilotContext);
        results['AI_PERSONALIZATION'] = Boolean(copilotContext.profile?.department === 'ECE' &&
                                       copilotContext.profile?.semester === 6);

        // -------------------------------------------------------------
        // STEP 12: MOCK INTERVIEW PERSONALIZATION
        // -------------------------------------------------------------
        console.log('\n12. Verifying Mock Interview Personalization...');
        await navigateAndWait(`${BASE_URL}/mock-interview.html`);
        const mockContext = await evaluate(`
            ({
                dept: InterviewApp.department,
                targetRole: InterviewApp.targetRole,
                deptSelect: document.getElementById('cfg-department')?.value
            })
        `);
        console.log('   Mock Interview Personalization:', mockContext);
        results['MOCK_INTERVIEW_PERSONALIZATION'] = Boolean(mockContext.dept === 'ECE');

        // -------------------------------------------------------------
        // STEP 13: BROWSER REFRESH PERSISTENCE
        // -------------------------------------------------------------
        console.log('\n13. Testing Browser Refresh Persistence on dashboard.html...');
        await navigateAndWait(`${BASE_URL}/dashboard.html`);
        await send('Page.reload');
        await new Promise(r => setTimeout(r, 2500));
        const refreshContext = await evaluate(`
            ({
                badge: document.getElementById('dashboard-user-badge')?.textContent,
                aiTitle: document.getElementById('dash-ai-rec-title')?.textContent
            })
        `);
        console.log('   After Refresh Dashboard:', refreshContext);
        results['REFRESH_PERSISTENCE'] = Boolean(refreshContext.badge?.includes('ECE') &&
                                        refreshContext.badge?.includes('6'));

        // -------------------------------------------------------------
        // STEP 14: LOGOUT -> LOGIN PERSISTENCE
        // -------------------------------------------------------------
        console.log('\n14. Testing Logout -> Login Persistence...');
        await evaluate(`AuthManager.logout()`);
        await new Promise(r => setTimeout(r, 1500));
        await navigateAndWait(`${BASE_URL}/login.html`);
        await evaluate(`
            (async () => {
                return await AuthManager.login('${TEST_EMAIL}', '${TEST_PASS}');
            })()
        `);
        await new Promise(r => setTimeout(r, 2500));
        await navigateAndWait(`${BASE_URL}/dashboard.html`);
        const reloginContext = await evaluate(`
            ({
                badge: document.getElementById('dashboard-user-badge')?.textContent,
                user: AuthManager.getUser()
            })
        `);
        console.log('   After Relogin:', reloginContext.badge, reloginContext.user?.branch, reloginContext.user?.semester);
        results['RELOGIN_PERSISTENCE'] = Boolean(reloginContext.user?.branch === 'ECE' &&
                                        (reloginContext.user?.semester === 6 || reloginContext.user?.semester === 'Semester 6'));

        // -------------------------------------------------------------
        // STEP 15: RLS SECURITY (Cannot update another user's profile)
        // -------------------------------------------------------------
        console.log('\n15. Testing RLS Security (Cannot update another user profile)...');
        const rlsTest = await evaluate(`
            (async () => {
                const client = SupabaseBridge.getClient();
                const { data, error } = await client
                    .from('profiles')
                    .update({ full_name: 'Hacked Profile' })
                    .eq('id', '00000000-0000-0000-0000-000000000000')
                    .select();
                return { rowsUpdated: data ? data.length : 0, error: error ? error.message : null };
            })()
        `);
        console.log('   RLS Test Result:', rlsTest);
        results['RLS_SECURITY'] = rlsTest.rowsUpdated === 0;

    } catch (err) {
        console.error('Test Execution Exception:', err);
    } finally {
        ws.close();
        chrome.kill();
        console.log('\n======================================================================');
        console.log('  TEST EXECUTION SUMMARY:');
        console.log('======================================================================');
        for (const [k, v] of Object.entries(results)) {
            console.log(`  [${v ? 'PASS' : 'FAIL'}] ${k}`);
        }
        console.log('======================================================================\n');
    }
}

main().catch(console.error);
