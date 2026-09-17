// verify_real_supabase_backend.js
// Verification suite for Supabase real backend integration & security hardening

const http = require('http');

const BASE_URL = 'http://127.0.0.1:8080';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const reqHeaders = { ...headers };
        let payload = null;

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            payload = typeof body === 'string' ? body : JSON.stringify(body);
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(payload);
        }

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: reqHeaders
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed, raw: data });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('========================================================');
    console.log('🧪 Starting TechPath Real Supabase Backend Test Matrix');
    console.log('========================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ [PASS] ${message}`);
            passed++;
        } else {
            console.error(`  ❌ [FAIL] ${message}`);
            failed++;
        }
    }

    try {
        // Test 1: Config API (/api/config)
        console.log('[1/9] Verifying Public Config Endpoint (/api/config)...');
        const configRes = await makeRequest('/api/config');
        assert(configRes.statusCode === 200, 'Endpoint returns HTTP 200 OK');
        assert(configRes.body.supabaseUrl === 'https://kkdqahqcochicfvkfyan.supabase.co', 'Points to real Supabase project URL');
        assert(configRes.body.supportEmail === 'lakkimsettirahulashokh@gmail.com', 'Returns exact canonical support email (lakkimsettirahulashokh@gmail.com)');
        assert(!configRes.raw.includes('service_role') && !configRes.raw.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Never leaks service-role key or private secrets');
        assert(typeof configRes.body.supabaseAnonKey === 'string' && configRes.body.supabaseAnonKey.startsWith('eyJ'), 'Delivers safe public Supabase Anon JWT');

        // Test 2: Health API (/api/health)
        console.log('\n[2/9] Verifying Server Health (/api/health)...');
        const healthRes = await makeRequest('/api/health');
        assert(healthRes.statusCode === 200, 'Health endpoint returns HTTP 200 OK');
        assert(healthRes.body.platform === 'TechPath', 'Platform is branded strictly as TechPath');
        assert(healthRes.body.integrations?.supabase === true, 'Supabase integration is reported online');

        // Test 3: Admin Role Guard (/api/admin/check-role)
        console.log('\n[3/9] Verifying Strict Admin Role Guard (/api/admin/check-role)...');
        const roleAnon = await makeRequest('/api/admin/check-role');
        assert(roleAnon.statusCode === 403, 'Unauthenticated request denied with 403 Forbidden');
        assert(roleAnon.body.authorized === false && roleAnon.body.role === 'student', 'Anon caller assigned student role with authorized: false');

        // Test 4: Video Database Query (/api/videos)
        console.log('\n[4/9] Verifying Live Video Curriculum Database (/api/videos)...');
        const videosRes = await makeRequest('/api/videos?branch=ECE&semester=1');
        assert(videosRes.statusCode === 200, 'Videos endpoint returns HTTP 200 OK');
        assert(Array.isArray(videosRes.body.videos) && videosRes.body.videos.length > 0, `Returned ${videosRes.body.videos?.length} curriculum videos`);
        assert(Array.isArray(videosRes.body.subjects) && videosRes.body.subjects.length > 0, `Returned ${videosRes.body.subjects?.length} engineering subjects`);

        // Test 5: Reviews Endpoint (/api/reviews)
        console.log('\n[5/9] Verifying Reviews Database (/api/reviews)...');
        const reviewsRes = await makeRequest('/api/reviews');
        assert(reviewsRes.statusCode === 200, 'Reviews endpoint returns HTTP 200 OK');
        assert(Array.isArray(reviewsRes.body.reviews), `Found ${reviewsRes.body.reviews?.length} approved reviews`);

        // Test 6: Contact Message Submission (/api/contact)
        console.log('\n[6/9] Verifying Contact Message Flow (/api/contact)...');
        const contactPayload = {
            name: 'Verification Bot',
            email: 'student@example.edu',
            subject: 'Platform Verification Test',
            department: 'CSE',
            message: 'Testing Supabase public.contact_messages integration.'
        };
        const contactRes = await makeRequest('/api/contact', 'POST', contactPayload);
        assert(contactRes.statusCode === 200 || contactRes.statusCode === 201, `Contact message submission returned HTTP ${contactRes.statusCode}`);
        assert(contactRes.body.success === true, 'Contact submission acknowledged successfully');

        // Test 7: Mock Interview Adaptive Dispatcher (/api/ai/mock-interview/start)
        console.log('\n[7/9] Verifying Mock Interview Engine (/api/ai/mock-interview/start)...');
        const mockStartRes = await makeRequest('/api/ai/mock-interview/start', 'POST', {
            targetRole: 'Full Stack Engineer',
            department: 'CSE',
            difficulty: 'Intermediate',
            questionCount: 3,
            resume: {
                allSkillsList: ['Node.js', 'PostgreSQL', 'React', 'Docker'],
                projects: [{ name: 'Distributed Log Engine', techStack: ['Node.js', 'PostgreSQL'] }]
            }
        });
        assert(mockStartRes.statusCode === 200, 'Interview start returned HTTP 200 OK');
        const q = mockStartRes.body.currentQuestion?.question || mockStartRes.body.questionData?.question;
        assert(mockStartRes.body.success === true && Boolean(q), `Generated adaptive question: "${q?.slice(0, 60)}..."`);

        // Test 8: Mock Interview History Endpoint (/api/ai/mock-interview/history)
        console.log('\n[8/9] Verifying Mock Interview History (/api/ai/mock-interview/history)...');
        const mockHistRes = await makeRequest('/api/ai/mock-interview/history');
        assert(mockHistRes.statusCode === 200, 'Interview history returned HTTP 200 OK');
        assert(Array.isArray(mockHistRes.body.interviews), 'Returned interviews array from Supabase public.mock_interviews');

        // Test 9: AI Notes Synthesis (/api/ai/notes)
        console.log('\n[9/9] Verifying AI Notes Generator without Raft Invariants (/api/ai/notes)...');
        const notesRes = await makeRequest('/api/ai/notes', 'POST', {
            fileName: 'Signals_and_Systems_Fourier_Series.pdf',
            extractedText: 'Fourier Series decomposes any periodic function into a sum of oscillating sine and cosine functions. It is fundamental in Signals and Systems, communications, filtering, and frequency response analysis in electrical and electronics engineering.',
            mode: 'exam'
        });
        assert(notesRes.statusCode === 200, 'Notes generation returned HTTP 200 OK');
        assert(notesRes.body.success === true && notesRes.body.notes, 'Generated dynamic notes structure');
        assert(!JSON.stringify(notesRes.body.notes || {}).includes('Distributed Consensus Invariants (Raft)'), 'Neutralized legacy Raft consensus hardcoded text');

    } catch (err) {
        console.error('Fatal test error:', err);
        failed++;
    }

    console.log('\n========================================================');
    console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
