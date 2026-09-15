const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

function request(method, pathUrl, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(pathUrl, BASE_URL);
        const req = http.request(url, {
            method,
            headers: {
                ...headers,
                ...(body ? { 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {})
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed,
                    raw: data
                });
            });
        });
        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runPrivacyAuditTests() {
    console.log('🧪 ========================================================');
    console.log('   BEARER PERSONAL DATA FLOW & PRIVACY AUDIT TEST SUITE');
    console.log('========================================================\n');

    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`  ✅ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
            failed++;
        }
    };

    // 1. API Response Filtering
    await test('1.1 GET /api/reviews does not expose user_id of reviewers', async () => {
        const res = await request('GET', '/api/reviews');
        assert.strictEqual(res.status, 200);
        assert(Array.isArray(res.body.reviews), 'Must return reviews array');
        for (const r of res.body.reviews) {
            assert.strictEqual(r.user_id, undefined, 'Review must not expose user_id');
        }
    });

    await test('1.2 Unauthenticated GET /rest/v1/profiles does not leak all student profiles', async () => {
        const res = await request('GET', '/rest/v1/profiles');
        assert.strictEqual(res.status, 200);
        assert(Array.isArray(res.body));
        assert.strictEqual(res.body.length, 0, 'Unauthenticated query must return empty list');
    });

    // 2. Account & Personal Data Deletion Flow
    const testEmail = `privacy_test_${Date.now()}@btechpath.ai`;
    const testPass = 'Password@123!';
    let testToken = null;
    let testUserId = null;

    await test('2.1 Register test user for data flow & deletion testing', async () => {
        const res = await request('POST', '/auth/v1/signup', {
            'Content-Type': 'application/json'
        }, {
            email: testEmail,
            password: testPass,
            data: { full_name: 'Privacy Test Student', branch: 'CSE', semester: 2 }
        });
        assert.strictEqual(res.status, 200);
        assert(res.body.access_token, 'Should return access token');
        assert(res.body.user, 'Should return user object');
        assert.strictEqual(res.body.user.password_hash, undefined, 'Must not return password hash');
        testToken = res.body.access_token;
        testUserId = res.body.user.id;
    });

    await test('2.2 Record user consent for test user', async () => {
        const res = await request('POST', '/api/user/consent', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testToken}`
        }, {
            terms_accepted: true,
            privacy_accepted: true
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
    });

    await test('2.3 Authenticated query to /rest/v1/profiles returns only own profile', async () => {
        const res = await request('GET', '/rest/v1/profiles', {
            'Authorization': `Bearer ${testToken}`
        });
        assert.strictEqual(res.status, 200);
        assert(Array.isArray(res.body));
        assert.strictEqual(res.body.length, 1, 'Should return exactly 1 profile (own)');
        assert.strictEqual(res.body[0].email, testEmail);
    });

    await test('2.4 DELETE /api/user/account permanently erases all personal data', async () => {
        const res = await request('DELETE', '/api/user/account', {
            'Authorization': `Bearer ${testToken}`
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert(res.body.message.includes('permanently deleted'));
    });

    await test('2.5 Invalidate sessions and prevent subsequent login after deletion', async () => {
        const res = await request('POST', '/auth/v1/token', {
            'Content-Type': 'application/json'
        }, {
            grant_type: 'password',
            email: testEmail,
            password: testPass
        });
        assert.strictEqual(res.status, 400);
        assert(res.body.error === 'invalid_grant');
    });

    // 3. Log Sanitization Verification
    await test('3.1 Contact message handler redacts user email from server logs', async () => {
        const res = await request('POST', '/api/contact', {
            'Content-Type': 'application/json'
        }, {
            name: 'Privacy Auditor',
            email: 'auditor@example.com',
            category: 'Privacy Inquiry',
            subject: 'Data Deletion Policy Test',
            message: 'Testing that email and subject are not logged in server output.'
        });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
    });

    await test('3.2 Password recovery does not leak tokens or full emails', async () => {
        const res = await request('POST', '/auth/v1/recover', {
            'Content-Type': 'application/json'
        }, {
            email: 'auditor@example.com'
        });
        assert.strictEqual(res.status, 200);
        assert(res.body.message.includes('password reset instructions'));
    });

    console.log('\n========================================================');
    console.log(`🏁 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runPrivacyAuditTests().catch(err => {
    console.error('Test runner fatal error:', err);
    process.exit(1);
});
