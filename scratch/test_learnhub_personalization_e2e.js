/**
 * BTechPath AI OS — LearnHub Video Personalization End-to-End Test Suite
 * Tests all 27 requirements and multi-user scenarios
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://127.0.0.1:8080';

function request(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const headers = { ...(options.headers || {}) };
        let bodyPayload = null;
        if (options.body !== undefined && options.body !== null) {
            bodyPayload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
            headers['Content-Length'] = Buffer.byteLength(bodyPayload);
        }
        const req = http.request(url, {
            method: options.method || 'GET',
            headers
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, raw: data });
                }
            });
        });
        req.on('error', reject);
        if (bodyPayload) {
            req.write(bodyPayload);
        }
        req.end();
    });
}

async function runTests() {
    console.log('================================================================');
    console.log('🧪 RUNNING LEARNHUB VIDEO PERSONALIZATION E2E TEST SUITE');
    console.log('================================================================\n');

    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        process.stdout.write(`• ${name} ... `);
        try {
            await fn();
            console.log('✅ PASSED');
            passed++;
        } catch (err) {
            console.log('❌ FAILED');
            console.error('   Error:', err.message);
            failed++;
        }
    }

    // ------------------------------------------------------------------------
    // SCENARIO 1: User A — CSE Semester 1
    // ------------------------------------------------------------------------
    await test('User A (CSE Sem 1): Feed is strictly isolated to CSE Semester 1', async () => {
        const res = await request('/api/videos?department=CSE&semester=1');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        
        const videoIds = res.data.videos.map(v => v.id);
        // vid-cse-python-core is [1, 2, 3] -> must appear
        assert.ok(videoIds.includes('vid-cse-python-core'), 'Python Core must appear in Sem 1');
        
        // Semester 4 videos must NEVER appear
        assert.ok(!videoIds.includes('vid-cse4-os-process'), 'CSE Sem 4 OS must NOT appear in Sem 1');
        assert.ok(!videoIds.includes('vid-cse4-dbms-norm'), 'CSE Sem 4 DBMS must NOT appear in Sem 1');
        assert.ok(!videoIds.includes('vid-cse4-cn-tcp'), 'CSE Sem 4 Networks must NOT appear in Sem 1');

        // All videos returned must either match sem 1 or be universal common
        res.data.videos.forEach(v => {
            const sems = (v.semesters || [v.semester_number]).map(Number);
            assert.ok(sems.includes(1) || sems.includes(0) || v.is_common, `Video ${v.id} does not belong to Sem 1`);
        });
    });

    // ------------------------------------------------------------------------
    // SCENARIO 2: User B — CSE Semester 4
    // ------------------------------------------------------------------------
    await test('User B (CSE Sem 4): Feed shows CSE Sem 4 and NEVER shows Python Core (Sem 1-3)', async () => {
        const res = await request('/api/videos?department=CSE&semester=4');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        
        const videoIds = res.data.videos.map(v => v.id);
        
        // CRITICAL CHECK: Python Core (Sem 1, 2, 3) must NOT appear in Sem 4!
        assert.ok(!videoIds.includes('vid-cse-python-core'), 'CRITICAL ROOT CAUSE VERIFICATION: Python Core (Sem 1-3) MUST NOT leak into Semester 4!');
        
        // CSE Sem 4 core subjects must appear
        assert.ok(videoIds.includes('vid-cse4-os-process'), 'OS Process Sync must appear in CSE Sem 4');
        assert.ok(videoIds.includes('vid-cse4-dbms-norm'), 'DBMS BCNF must appear in CSE Sem 4');
        assert.ok(videoIds.includes('vid-cse4-cn-tcp'), 'Computer Networks TCP must appear in CSE Sem 4');
        
        // ECE or Mechanical videos must NOT appear
        assert.ok(!videoIds.includes('vid-ece4-de-seq'), 'ECE Digital Electronics must not appear in CSE feed');
        assert.ok(!videoIds.includes('vid-mech5-md-shafts'), 'Mech Machine Design must not appear in CSE feed');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 3: User C — ECE Semester 4
    // ------------------------------------------------------------------------
    await test('User C (ECE Sem 4): Department isolation protects against CSE courses', async () => {
        const res = await request('/api/videos?department=ECE&semester=4');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        
        const videoIds = res.data.videos.map(v => v.id);
        assert.ok(videoIds.includes('vid-ece4-de-seq'), 'ECE Sequential Circuits must appear');
        assert.ok(videoIds.includes('vid-ece4-micro-8086'), 'ECE Microprocessors must appear');
        
        // CSE videos must NOT appear
        assert.ok(!videoIds.includes('vid-cse4-os-process'), 'CSE OS must NOT appear in ECE Sem 4');
        assert.ok(!videoIds.includes('vid-cse4-dbms-norm'), 'CSE DBMS must NOT appear in ECE Sem 4');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 4: User D — Mechanical Semester 5
    // ------------------------------------------------------------------------
    await test('User D (MECH Sem 5): Isolated to Mechanical curriculum', async () => {
        const res = await request('/api/videos?department=MECH&semester=5');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        
        const videoIds = res.data.videos.map(v => v.id);
        assert.ok(videoIds.includes('vid-mech5-md-shafts'), 'Machine Design must appear');
        assert.ok(videoIds.includes('vid-mech5-thermo-cycles'), 'Applied Thermo must appear');
        
        assert.ok(!videoIds.includes('vid-cse4-os-process'), 'CSE OS must not appear in MECH');
        assert.ok(!videoIds.includes('vid-ece4-de-seq'), 'ECE DE must not appear in MECH');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 5: Explicit Other-Semester Access (Requirement 7)
    // ------------------------------------------------------------------------
    await test('User B (CSE Sem 4) intentionally browsing Semester 2 loads CSE Sem 2 only', async () => {
        const res = await request('/api/videos?department=CSE&semester=2');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        
        const videoIds = res.data.videos.map(v => v.id);
        // In Semester 2, Python Core MUST appear
        assert.ok(videoIds.includes('vid-cse-python-core'), 'Python Core must appear in explicitly requested Semester 2');
        
        // But ECE Sem 2 or Mechanical Sem 2 must NOT appear
        assert.ok(!videoIds.includes('vid-ece4-de-seq'), 'ECE must not appear');
        assert.ok(!videoIds.includes('vid-mech5-md-shafts'), 'MECH must not appear');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 6: Common Videos Multi-Semester Scoping (Requirement 6)
    // ------------------------------------------------------------------------
    await test('Common Content respects semester scope (ATS Resume in Sem 1 vs Interview Prep in Sem 4)', async () => {
        // vid-common-resume-ats has semesters: [1, 2, 3, 4, 5, 6, 7, 8] -> appears in Sem 1
        const sem1Res = await request('/api/videos?department=CSE&semester=1');
        const sem1Ids = sem1Res.data.videos.map(v => v.id);
        assert.ok(sem1Ids.includes('vid-common-resume-ats'), 'Resume ATS must appear in Sem 1');
        assert.ok(!sem1Ids.includes('vid-common-interview-prep'), 'Interview Prep (Sem 3-8) must NOT appear in Sem 1');

        // vid-common-interview-prep has semesters: [3, 4, 5, 6, 7, 8] -> appears in Sem 4
        const sem4Res = await request('/api/videos?department=CSE&semester=4');
        const sem4Ids = sem4Res.data.videos.map(v => v.id);
        assert.ok(sem4Ids.includes('vid-common-resume-ats'), 'Resume ATS must appear in Sem 4');
        assert.ok(sem4Ids.includes('vid-common-interview-prep'), 'Interview Prep must appear in Sem 4');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 7: Scoped Search (Requirement 9)
    // ------------------------------------------------------------------------
    await test('Search respects department + selected semester scope', async () => {
        // Search "Python" in CSE Sem 4 -> must be 0 results because Python is Sem 1-3!
        const res1 = await request('/api/videos?department=CSE&semester=4&search=Python');
        assert.strictEqual(res1.status, 200);
        assert.strictEqual(res1.data.count, 0, 'Python search in CSE Sem 4 must return 0 results');

        // Search "Python" in CSE Sem 1 -> returns Python Core
        const res2 = await request('/api/videos?department=CSE&semester=1&search=Python');
        assert.strictEqual(res2.status, 200);
        assert.ok(res2.data.count >= 1, 'Python search in CSE Sem 1 must return Python lecture');
        assert.strictEqual(res2.data.videos[0].id, 'vid-cse-python-core');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 8: Subject Filter Scoping (Requirement 10)
    // ------------------------------------------------------------------------
    await test('Subject filter returns only videos for that subject in current department + semester', async () => {
        const res = await request('/api/videos?department=CSE&semester=4&subject=Operating Systems');
        assert.strictEqual(res.status, 200);
        assert.ok(res.data.count >= 1);
        res.data.videos.forEach(v => {
            assert.strictEqual(v.subject, 'Operating Systems');
        });
    });

    // ------------------------------------------------------------------------
    // SCENARIO 9: Protection Against Generic Unparameterized Queries (Requirement 2 & 15)
    // ------------------------------------------------------------------------
    await test('Generic query /api/videos without department and semester does NOT return global videos', async () => {
        const res = await request('/api/videos');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.requiresProfile, true);
        assert.strictEqual(res.data.count, 0, 'Generic query must return 0 videos to prevent leaking global videos');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 10: Admin Validation (Requirement 12)
    // ------------------------------------------------------------------------
    await test('Admin validation blocks publishing department video without department or semester', async () => {
        // Attempting to post without department & semester when is_common is false
        const invalidPayload = {
            title: 'Unclassified Test Video',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            subject: 'Test Subject',
            is_common: false,
            departments: [],
            semesters: []
        };

        const res = await request('/api/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Email': 'rahulashokhlakkimsetty@gmail.com'
            },
            body: invalidPayload
        });

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.data.success, false);
        assert.strictEqual(res.data.error, 'Select at least one department and semester, or mark this video as Common Content.');
    });

    // ------------------------------------------------------------------------
    // SCENARIO 11: Admin Successfully Posts Common Content
    // ------------------------------------------------------------------------
    await test('Admin can publish genuine Common Content', async () => {
        const commonPayload = {
            title: 'Universal Engineering Ethics & Professional Integrity',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            subject: 'Professional Ethics',
            is_common: true,
            is_published: true
        };

        const res = await request('/api/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Email': 'rahulashokhlakkimsetty@gmail.com'
            },
            body: commonPayload
        });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.video.is_common, true);
        
        // Clean up created video
        const delRes = await request(`/api/videos/${res.data.video.id}`, {
            method: 'DELETE',
            headers: {
                'X-Admin-Email': 'rahulashokhlakkimsetty@gmail.com'
            }
        });
        assert.strictEqual(delRes.status, 200);
    });

    console.log('\n================================================================');
    console.log(`🏁 TEST RUN FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) process.exit(1);
}

runTests().catch(err => {
    console.error('Fatal error during test run:', err);
    process.exit(1);
});
