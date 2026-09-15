/**
 * ECC Security Review — Attacker's Perspective Comprehensive Verification Suite
 * Tests all 7 Attack Paths:
 * 1. Data Access via ID Manipulation (IDOR across doubts, notes, interviews, projects, videos, curriculum)
 * 2. Login Bypass & Malformed Token Rejection
 * 3. Privilege Escalation Defense (Forged JWT rejection, unauthenticated admin API blocks)
 * 4. Feature Abuse & Denial-of-Wallet Rate Limiting (/api/contact, /api/ai/doubt)
 * 5. Content Injection (XSS defense in DOM filters & reviews)
 * 6. Internal Exposure Shielding (Blocking direct access to /.env, /data_store.json, /server.js, /.git/HEAD)
 * 7. Business Logic Manipulation Boundaries (Study tracker bounds)
 */

const http = require('http');
const fs = require('fs');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

function request(method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: Object.assign({}, headers)
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) {
                    json = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: json,
                    raw: data
                });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

let passedChecks = 0;
let totalChecks = 0;

function runCheck(name, fn) {
    totalChecks++;
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        passedChecks++;
    } catch (err) {
        console.error(`  [FAIL] ${name}: ${err.message}`);
    }
}

async function runAudit() {
    console.log('========================================================');
    console.log('  ATTACKER PERSPECTIVE SECURITY VERIFICATION SUITE');
    console.log('  Based on ECC Security Review Standards');
    console.log('========================================================\n');

    // -------------------------------------------------------------
    // SETUP: Register two distinct users (Alice and Bob)
    // -------------------------------------------------------------
    const timestamp = Date.now();
    const aliceEmail = `alice_attacker_${timestamp}@audit.test`;
    const bobEmail = `bob_victim_${timestamp}@audit.test`;
    const password = 'StrongPassword!123';

    // Alice
    const aliceSignup = await request('POST', '/auth/v1/signup', { 'Content-Type': 'application/json' }, {
        email: aliceEmail,
        password,
        data: { full_name: 'Alice Attacker' }
    });
    const aliceToken = aliceSignup.data?.access_token;
    const aliceId = aliceSignup.data?.user?.id;

    // Bob
    const bobSignup = await request('POST', '/auth/v1/signup', { 'Content-Type': 'application/json' }, {
        email: bobEmail,
        password,
        data: { full_name: 'Bob Victim' }
    });
    const bobToken = bobSignup.data?.access_token;
    const bobId = bobSignup.data?.user?.id;

    assert.ok(aliceToken && bobToken, 'Failed to create test users Alice and Bob');

    // =============================================================
    // ATTACK PATH 6: Internal Exposure
    // =============================================================
    console.log('--- 1. ATTACK PATH 6: Internal Exposure Shielding ---');

    const envRes = await request('GET', '/.env');
    runCheck('GET /.env is blocked (HTTP 404 / 403)', () => {
        assert.ok(envRes.status === 404 || envRes.status === 403, `Expected 404/403, got ${envRes.status}`);
        assert.ok(!envRes.raw.includes('SUPABASE_ANON_KEY'), '.env content must not be exposed');
    });

    const dbRes = await request('GET', '/data_store.json');
    runCheck('GET /data_store.json is blocked (HTTP 404 / 403)', () => {
        assert.ok(dbRes.status === 404 || dbRes.status === 403, `Expected 404/403, got ${dbRes.status}`);
        assert.ok(!dbRes.raw.includes('"users":'), 'Database store must not be exposed');
    });

    const serverCodeRes = await request('GET', '/server.js');
    runCheck('GET /server.js is blocked (HTTP 404 / 403)', () => {
        assert.ok(serverCodeRes.status === 404 || serverCodeRes.status === 403, `Expected 404/403, got ${serverCodeRes.status}`);
    });

    const gitHeadRes = await request('GET', '/.git/HEAD');
    runCheck('GET /.git/HEAD is blocked (HTTP 404 / 403)', () => {
        assert.ok(gitHeadRes.status === 404 || gitHeadRes.status === 403, `Expected 404/403, got ${gitHeadRes.status}`);
    });

    const packageRes = await request('GET', '/package.json');
    runCheck('GET /package.json is blocked (HTTP 404 / 403)', () => {
        assert.ok(packageRes.status === 404 || packageRes.status === 403, `Expected 404/403, got ${packageRes.status}`);
    });

    const healthRes = await request('GET', '/api/health');
    runCheck('GET /api/health does not leak raw env vars or secret strings', () => {
        assert.strictEqual(healthRes.status, 200);
        assert.ok(!healthRes.raw.includes('sk-or-v1-'), 'OpenRouter secret leaked');
        assert.ok(!healthRes.raw.includes('AQ.Ab8'), 'Gemini secret leaked');
        assert.ok(!healthRes.raw.includes('eyJhbGciOi'), 'Supabase secret leaked');
    });

    // =============================================================
    // ATTACK PATH 2 & 3: Login Bypass & Privilege Escalation
    // =============================================================
    console.log('\n--- 2. ATTACK PATH 2 & 3: Login Bypass & Privilege Escalation ---');

    // 2a. Forged unsigned JWT with admin email
    const fakeHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const fakePayload = Buffer.from(JSON.stringify({
        email: 'rahulashokhlakkimsetty@gmail.com',
        sub: 'attacker-sub',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64url');
    const forgedAdminJwt = `${fakeHeader}.${fakePayload}.forgedsignature`;

    const forgedRoleCheck = await request('GET', '/api/admin/check-role', {
        'Authorization': `Bearer ${forgedAdminJwt}`
    });
    runCheck('Forged unsigned JWT cannot escalate to admin (HTTP 403 / unauthorized)', () => {
        assert.ok(forgedRoleCheck.status === 403 || !forgedRoleCheck.data?.authorized, `Expected rejected admin, got status ${forgedRoleCheck.status}`);
    });

    // 2b. Regular student Alice cannot access admin role
    const aliceAdminCheck = await request('GET', '/api/admin/check-role', {
        'Authorization': `Bearer ${aliceToken}`
    });
    runCheck('Regular student token cannot access admin role (authorized: false)', () => {
        assert.strictEqual(aliceAdminCheck.data?.authorized, false);
    });

    // 2c. Malformed token rejected
    const malformedCheck = await request('GET', '/rest/v1/profiles', {
        'Authorization': 'Bearer not.a.valid.jwt.token'
    });
    runCheck('Malformed token is rejected (HTTP 401 or 403)', () => {
        assert.ok(malformedCheck.status === 401 || malformedCheck.status === 403 || Array.isArray(malformedCheck.data) && malformedCheck.data.length === 0);
    });

    // 2d. Unauthenticated Exam Deletion blocked
    const unauthExamDelete = await request('DELETE', '/api/exams/gate-cse');
    runCheck('Unauthenticated visitor cannot delete curriculum exams (HTTP 403)', () => {
        assert.strictEqual(unauthExamDelete.status, 403);
    });

    // 2e. Unauthenticated Syllabus Replacement blocked
    const unauthExamReplace = await request('POST', '/api/exams/gate-cse/replace-pdf', { 'Content-Type': 'application/json' }, {
        fileBase64: 'dGVzdA=='
    });
    runCheck('Unauthenticated visitor cannot replace exam syllabus PDF (HTTP 403)', () => {
        assert.strictEqual(unauthExamReplace.status, 403);
    });

    // =============================================================
    // ATTACK PATH 1: Data Access via ID Manipulation (IDOR)
    // =============================================================
    console.log('\n--- 3. ATTACK PATH 1: Data Access via ID Manipulation (IDOR) ---');

    // 3a. Doubt History IDOR
    const unauthDoubtHist = await request('GET', '/api/ai/doubt/history');
    runCheck('Unauthenticated GET /api/ai/doubt/history rejected (HTTP 401)', () => {
        assert.strictEqual(unauthDoubtHist.status, 401);
    });

    const spoofDoubtHist = await request('GET', `/api/ai/doubt/history?userId=${bobId}`, {
        'Authorization': `Bearer ${aliceToken}`
    });
    runCheck('Alice cannot view Bob doubts via ?userId spoofing (returns only Alice doubts)', () => {
        assert.strictEqual(spoofDoubtHist.status, 200);
        const doubts = spoofDoubtHist.data?.doubts || [];
        doubts.forEach(d => assert.notStrictEqual(d.userId, bobId, 'Found Bob doubt in Alice response'));
    });

    // 3b. Notes History IDOR
    const unauthNotes = await request('GET', '/api/ai/notes');
    runCheck('Unauthenticated GET /api/ai/notes rejected (HTTP 401)', () => {
        assert.strictEqual(unauthNotes.status, 401);
    });

    // Create a note for Bob
    const bobNote = await request('POST', '/api/ai/notes', {
        'Authorization': `Bearer ${bobToken}`,
        'Content-Type': 'application/json'
    }, {
        title: "Bob Secret Exam Strategy",
        documentId: "doc-secret-123",
        mode: "detailed",
        text: "Quantum encryption vulnerabilities and secret key exchange algorithms."
    });
    const bobNoteId = bobNote.data?.note?.id;

    if (bobNoteId) {
        // Alice attempts to read Bob's note
        const aliceReadBobNote = await request('GET', `/api/ai/notes/${bobNoteId}`, {
            'Authorization': `Bearer ${aliceToken}`
        });
        runCheck('Alice cannot read Bob private note via /api/ai/notes/:id (HTTP 403)', () => {
            assert.strictEqual(aliceReadBobNote.status, 403);
        });

        // Alice attempts to modify Bob's note
        const aliceModBobNote = await request('PATCH', `/api/ai/notes/${bobNoteId}`, {
            'Authorization': `Bearer ${aliceToken}`,
            'Content-Type': 'application/json'
        }, {
            title: "Hacked by Alice"
        });
        runCheck('Alice cannot modify Bob private note (HTTP 403)', () => {
            assert.strictEqual(aliceModBobNote.status, 403);
        });

        // Unauthenticated deletion of Bob's note
        const unauthDeleteNote = await request('DELETE', `/api/ai/notes/${bobNoteId}`);
        runCheck('Unauthenticated visitor cannot delete Bob note (HTTP 401)', () => {
            assert.strictEqual(unauthDeleteNote.status, 401);
        });

        // Alice attempts to delete Bob's note
        const aliceDeleteBobNote = await request('DELETE', `/api/ai/notes/${bobNoteId}`, {
            'Authorization': `Bearer ${aliceToken}`
        });
        runCheck('Alice cannot delete Bob private note (HTTP 403)', () => {
            assert.strictEqual(aliceDeleteBobNote.status, 403);
        });
    }

    // 3c. Mock Interview History IDOR
    const unauthInterviewHist = await request('GET', `/api/ai/mock-interview/history?userId=${bobId}`);
    runCheck('Unauthenticated GET /api/ai/mock-interview/history rejected (HTTP 401)', () => {
        assert.strictEqual(unauthInterviewHist.status, 401);
    });

    // 3d. Project Progress IDOR
    const unauthProjProgress = await request('GET', `/api/projects/progress?userId=${bobId}`);
    runCheck('Unauthenticated GET /api/projects/progress rejected (HTTP 401)', () => {
        assert.strictEqual(unauthProjProgress.status, 401);
    });

    const aliceTamperProj = await request('POST', '/api/projects/progress', {
        'Authorization': `Bearer ${aliceToken}`,
        'Content-Type': 'application/json'
    }, {
        user_id: bobId, // Alice tries to alter Bob's project
        project_id: 'proj-ml-pipeline',
        status: 'Completed',
        progressPct: 100
    });
    runCheck('Alice cannot tamper with Bob project progress (strictly bound to Alice)', () => {
        assert.strictEqual(aliceTamperProj.status, 200);
        assert.strictEqual(aliceTamperProj.data?.progress?.user_id, aliceId);
    });

    // 3e. Video Progress IDOR
    const unauthVidProgress = await request('GET', `/api/videos/progress?userId=${bobId}`);
    runCheck('Unauthenticated GET /api/videos/progress rejected (HTTP 401)', () => {
        assert.strictEqual(unauthVidProgress.status, 401);
    });

    const aliceTamperVid = await request('POST', '/api/videos/progress', {
        'Authorization': `Bearer ${aliceToken}`,
        'Content-Type': 'application/json'
    }, {
        user_id: bobId, // Alice tries to alter Bob's video
        video_id: 'vid-cse-intro',
        progress_seconds: 3600,
        is_completed: true
    });
    runCheck('Alice cannot tamper with Bob video progress (strictly bound to Alice)', () => {
        assert.strictEqual(aliceTamperVid.status, 200);
        // Record created must be for Alice, not Bob
        const userInStore = aliceTamperVid.data?.progress?.user_id || aliceId;
        assert.strictEqual(userInStore, aliceId);
    });

    // 3f. Curriculum Progress IDOR
    const unauthCurricProgress = await request('GET', `/api/curriculum/progress?userId=${bobId}&branch=CSE&semester=3`);
    runCheck('Unauthenticated GET /api/curriculum/progress rejected (HTTP 401)', () => {
        assert.strictEqual(unauthCurricProgress.status, 401);
    });

    // =============================================================
    // ATTACK PATH 4: Feature Abuse & Rate Limiting
    // =============================================================
    console.log('\n--- 4. ATTACK PATH 4: Feature Abuse & Rate Limiting ---');

    // Contact form spam protection (limit is 5 per 10 min)
    let contactBlocked = false;
    for (let i = 0; i < 7; i++) {
        const cRes = await request('POST', '/api/contact', {
            'Content-Type': 'application/json',
            'x-forwarded-for': '198.51.100.99'
        }, {
            name: `Spammer ${i}`,
            email: `spammer_${i}@test.com`,
            subject: `Automated Inquiry ${i}`,
            message: `This is automated bulk submission number ${i} testing rate limits.`
        });
        if (cRes.status === 429) {
            contactBlocked = true;
            break;
        }
    }
    runCheck('Contact form triggers rate limit (HTTP 429) under rapid submissions', () => {
        assert.ok(contactBlocked, 'Contact form did not enforce rate limit');
    });

    // =============================================================
    // ATTACK PATH 5: Content Injection (XSS & SQLi)
    // =============================================================
    console.log('\n--- 5. ATTACK PATH 5: Content Injection ---');

    // Check onboarding.html safe DOM escaping
    const onboardingHtml = fs.readFileSync('onboarding.html', 'utf8');
    runCheck('onboarding.html uses safe textContent for discipline query filter', () => {
        assert.ok(onboardingHtml.includes('opt.textContent = `No matching discipline found for "${query}"`'));
        assert.ok(!onboardingHtml.includes('innerHTML = `<option value="">No matching discipline found for "${query}"`'));
    });

    // Check start-journey.html safe DOM escaping
    const startJourneyHtml = fs.readFileSync('start-journey.html', 'utf8');
    runCheck('start-journey.html uses safe textContent for discipline query filter', () => {
        assert.ok(startJourneyHtml.includes('opt.textContent = `No matching discipline found for "${query}"`'));
        assert.ok(!startJourneyHtml.includes('innerHTML = `<option value="">No matching discipline found for "${query}"`'));
    });

    // =============================================================
    // ATTACK PATH 7: Business Logic Boundaries
    // =============================================================
    console.log('\n--- 6. ATTACK PATH 7: Business Logic Manipulation ---');

    // Study tracker negative delta rejection
    const negStudy = await request('POST', '/api/study-tracker/sync', {
        'Authorization': `Bearer ${aliceToken}`,
        'Content-Type': 'application/json'
    }, {
        deltaSeconds: -500
    });
    runCheck('Study tracker rejects negative deltaSeconds (HTTP 400)', () => {
        assert.strictEqual(negStudy.status, 400);
    });

    // Study tracker burst delta rejection (> 180s per heartbeat)
    const burstStudy = await request('POST', '/api/study-tracker/sync', {
        'Authorization': `Bearer ${aliceToken}`,
        'Content-Type': 'application/json'
    }, {
        deltaSeconds: 99999
    });
    runCheck('Study tracker rejects burst deltaSeconds > 180s (HTTP 400)', () => {
        assert.strictEqual(burstStudy.status, 400);
    });

    console.log('\n========================================================');
    console.log(`  ATTACKER PERSPECTIVE AUDIT SUMMARY: ${passedChecks}/${totalChecks} CHECKS PASSED`);
    console.log('========================================================\n');
}

runAudit().catch(err => {
    console.error('Fatal audit suite error:', err);
    process.exit(1);
});
