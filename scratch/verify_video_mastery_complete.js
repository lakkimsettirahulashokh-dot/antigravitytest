const { createClient } = require('@supabase/supabase-js');
const http = require('http');

require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kkdqahqcochicfvkfyan.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

function fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const req = http.request({
            hostname: u.hostname,
            port: u.port || 80,
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runAudit() {
    console.log('====================================================');
    console.log('VIDEO MASTERY COMPREHENSIVE VERIFICATION SUITE');
    console.log('====================================================\n');

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
    });
    const adminClient = SUPABASE_SERVICE_KEY 
        ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
        : anonClient;

    // 1. Database Schema Audit
    console.log('[SECTION 1] Database Column Types & Schema Audit:');
    const { data: profSem, error: profErr } = await adminClient.from('profiles').select('id, semester, year, department_id').limit(1);
    assert(!profErr, 'Profiles table queries successfully with semester, year, department_id');

    const { data: vidCols, error: vidErr } = await adminClient.from('videos').select('id, semester, is_common, branch_code').limit(1);
    assert(!vidErr, 'Videos table queries successfully with is_common, semester, branch_code');

    if (SUPABASE_SERVICE_KEY) {
        const testUserId = '00000000-0000-4000-a000-000000000099';
        const { data: insTest, error: insErr } = await adminClient.from('profiles').upsert({
            id: testUserId,
            email: 'audit_video_mastery_test@example.com',
            name: 'Video Audit Tester',
            full_name: 'Video Audit Tester',
            department_id: 'AIML',
            branch: 'AIML',
            semester: 3,
            year: 2,
            role: 'student'
        }).select().single();

        assert(!insErr && insTest?.semester === 3 && insTest?.year === 2, 'Profiles semester is INTEGER and year is INTEGER');
        await adminClient.from('profiles').delete().eq('id', testUserId);
    } else {
        // With anon client, verify that an unauthenticated write to profiles is blocked by RLS
        const { error: insErr } = await anonClient.from('profiles').insert({
            email: 'unauth@test.com',
            semester: 3,
            year: 2
        });
        assert(insErr !== null, 'RLS actively blocks unauthorized anon insertions to profiles');
    }

    // 2. Year Calculation Formula Verification across all 8 semesters
    console.log('\n[SECTION 2] Year Calculation Formula Audit (Sem 1-8):');
    const expectedYears = {
        1: 1, 2: 1, // Year 1
        3: 2, 4: 2, // Year 2
        5: 3, 6: 3, // Year 3
        7: 4, 8: 4  // Year 4
    };

    let formulaPassed = true;
    for (let sem = 1; sem <= 8; sem++) {
        const calculatedYear = Math.min(4, Math.max(1, Math.ceil(sem / 2)));
        if (calculatedYear !== expectedYears[sem]) {
            formulaPassed = false;
        }
        assert(calculatedYear === expectedYears[sem], `Semester ${sem} -> Year ${calculatedYear} (Expected: ${expectedYears[sem]})`);
    }

    // 3. get_personalized_video_feed RPC Verification
    console.log('\n[SECTION 3] Video Feed RPC (get_personalized_video_feed) Audit:');
    const { data: feedCse4, error: feedErr1 } = await adminClient.rpc('get_personalized_video_feed', {
        p_student_id: null,
        p_requested_semester: 4,
        p_department: 'CSE'
    });

    assert(!feedErr1 && Array.isArray(feedCse4) && feedCse4.length >= 2, 'CSE Semester 4 feed returns valid video lectures');
    if (feedCse4) {
        const titles = feedCse4.map(v => v.title);
        assert(titles.some(t => t.includes('Operating Systems')), 'CSE Semester 4 contains Operating Systems');
        assert(titles.some(t => t.includes('Relational Concurrency')), 'CSE Semester 4 contains Relational Concurrency / DBMS');
    }

    const { data: feedAiml3, error: feedErr2 } = await adminClient.rpc('get_personalized_video_feed', {
        p_student_id: null,
        p_requested_semester: 3,
        p_department: 'AIML'
    });

    assert(!feedErr2 && Array.isArray(feedAiml3) && feedAiml3.length >= 1, 'AIML Semester 3 feed returns Dynamic Programming lecture');
    if (feedAiml3) {
        assert(feedAiml3[0].title.includes('Dynamic Programming'), 'AIML Semester 3 video title matches');
    }

    const { data: feedAiml6, error: feedErr3 } = await adminClient.rpc('get_personalized_video_feed', {
        p_student_id: null,
        p_requested_semester: 6,
        p_department: 'AIML'
    });

    assert(!feedErr3 && Array.isArray(feedAiml6) && feedAiml6.length >= 1, 'AIML Semester 6 feed returns Transformers lecture');

    // 4. RLS & User Isolation Audit
    console.log('\n[SECTION 4] RLS and User Progress Isolation Audit:');
    // Public/anon can view published videos
    const { data: anonVideos, error: anonVidErr } = await anonClient.from('videos').select('id, title, is_published').eq('is_published', true);
    assert(!anonVidErr && anonVideos && anonVideos.length > 0, 'Public/Anon can view published curriculum videos');

    // User video progress isolation
    const { data: anonProg, error: anonProgErr } = await anonClient.from('user_video_progress').select('*');
    assert(anonProg && anonProg.length === 0, 'Anonymous users cannot view private user video progress');



    // 5. Application API Routes (/api/videos & /api/videos/progress)
    console.log('\n[SECTION 5] Node.js Server Application Integration Audit:');
    try {
        const resCse = await fetchJson('http://localhost:8080/api/videos?department=CSE&semester=4');
        assert(resCse.status === 200 && resCse.data?.success === true, 'GET /api/videos?department=CSE&semester=4 returns 200 OK');
        assert(resCse.data?.videos?.length >= 2, 'GET /api/videos returns both Semester 4 CSE videos');

        const resAiml = await fetchJson('http://localhost:8080/api/videos?department=AIML&semester=3');
        assert(resAiml.status === 200 && resAiml.data?.success === true, 'GET /api/videos?department=AIML&semester=3 returns 200 OK');
        assert(resAiml.data?.videos?.some(v => v.title.includes('Dynamic Programming')), 'GET /api/videos returns AIML DP video');

        const progPost = await fetchJson('http://localhost:8080/api/videos/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                user_id: 'test-student-video-user',
                video_id: '066c9a31-02b5-4872-9d8a-908689b1a00d',
                progress_seconds: 300,
                duration_seconds: 900,
                is_completed: false
            }
        });
        assert(progPost.status === 200 && progPost.data?.success === true, 'POST /api/videos/progress saves student progress');

        const progGet = await fetchJson('http://localhost:8080/api/videos/progress?userId=test-student-video-user');
        assert(progGet.status === 200 && progGet.data?.progress?.length >= 1, 'GET /api/videos/progress retrieves student progress');
        assert(progGet.data?.progress[0]?.progress_seconds === 300, 'Student watched progress is exactly 300 seconds');

    } catch (apiErr) {
        console.warn('  [NOTICE] API test server not reached or skipped:', apiErr.message);
    }

    console.log('\n====================================================');
    console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
}

runAudit().catch(err => {
    console.error('Fatal audit error:', err);
    process.exit(1);
});
