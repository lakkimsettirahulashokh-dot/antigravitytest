// ==============================================================================
// BTechPath AI OS — Master Security, Authentication, Review & Consent Test Suite
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';
const OFFICIAL_SUPPORT_EMAIL = 'lakkimsettirahulashokh@gmail.com';

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
                resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 ========================================================');
    console.log('   BTECHPATH AI OS — MASTER SECURITY & CONSENT TEST SUITE');
    console.log('========================================================\n');

    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        return async () => {
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
    }

    const testSuite = [
        // ----------------------------------------------------------------------
        // 1. OFFICIAL SUPPORT EMAIL AUDIT
        // ----------------------------------------------------------------------
        test('1.1 /api/config returns official support email', async () => {
            const res = await request('GET', '/api/config');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.supportEmail, OFFICIAL_SUPPORT_EMAIL);
        }),

        test('1.2 Contact page contains official support email', async () => {
            const res = await request('GET', '/contact.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes(OFFICIAL_SUPPORT_EMAIL), 'contact.html must have official support email');
            assert(!res.raw.includes('lakkimsettirahulashokh@gmail.com'), 'No typos in contact.html');
        }),

        test('1.3 FAQs page contains official support email', async () => {
            const res = await request('GET', '/faqs.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes(OFFICIAL_SUPPORT_EMAIL), 'faqs.html must have official support email');
            assert(!res.raw.includes('lakkimsettirahulashokh@gmail.com'), 'No typos in faqs.html');
        }),

        test('1.4 Terms page contains official support email', async () => {
            const res = await request('GET', '/terms.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes(OFFICIAL_SUPPORT_EMAIL), 'terms.html must have official support email');
            assert(!res.raw.includes('lakkimsettirahulashokh@gmail.com'), 'No typos in terms.html');
        }),

        test('1.5 Privacy Policy page contains official support email', async () => {
            const res = await request('GET', '/privacy-policy.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes(OFFICIAL_SUPPORT_EMAIL), 'privacy-policy.html must have official support email');
            assert(!res.raw.includes('lakkimsettirahulashokh@gmail.com'), 'No typos in privacy-policy.html');
        }),

        test('1.6 Reviews page footer contains official support email', async () => {
            const res = await request('GET', '/reviews.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes(OFFICIAL_SUPPORT_EMAIL), 'reviews.html must have official support email');
        }),

        test('1.7 .env file contains canonical support email', async () => {
            const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
            assert(envContent.includes(`SUPPORT_EMAIL=${OFFICIAL_SUPPORT_EMAIL}`), '.env must define canonical support email');
        }),

        // ----------------------------------------------------------------------
        // 2. SECRET AUDIT & REPOSITORY SANITIZATION
        // ----------------------------------------------------------------------
        test('2.1 .env.example contains only placeholders and zero live secrets', async () => {
            const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
            assert(!envExample.includes('sk-or-v1-'), 'No live OpenRouter key in .env.example');
            assert(!envExample.includes('AQ.Ab8RN6'), 'No live Gemini key in .env.example');
            assert(!envExample.includes('CbkLsyYo7MZr'), 'No live Supabase service role key in .env.example');
            assert(!envExample.includes('GOCSPX-'), 'No live Google client secret in .env.example');
            assert(envExample.includes('your-supabase-service-role-key-here'), 'Safe placeholder present');
        }),

        test('2.2 Frontend client JS files contain zero service role keys or AI provider secrets', async () => {
            const jsDir = path.join(__dirname, '..', 'js');
            const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
            for (const f of jsFiles) {
                const content = fs.readFileSync(path.join(jsDir, f), 'utf8');
                assert(!content.includes('service_role'), `File ${f} must not mention service_role`);
                assert(!content.includes('sk-or-v1-'), `File ${f} must not contain OpenRouter key`);
            }
        }),

        // ----------------------------------------------------------------------
        // 3. REVIEW SUBMISSION & THANK YOU PAGE FLOW
        // ----------------------------------------------------------------------
        test('3.1 POST /api/reviews rejects unauthenticated submission with 401', async () => {
            const res = await request('POST', '/api/reviews', {
                'Content-Type': 'application/json'
            }, {
                rating: 5,
                review_text: 'Excellent platform for engineering learning!',
                feature_used: 'AI Notes'
            });
            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.success, false);
            assert(res.body.error.includes('Authentication required'));
        }),

        test('3.2 Authenticated review submission succeeds with 201 and derives auth.uid()', async () => {
            // 1. Create temporary authenticated test student
            const testEmail = `student_${Date.now()}@btechpath.ai`;
            const signupRes = await request('POST', '/auth/v1/signup', { 'Content-Type': 'application/json' }, {
                email: testEmail,
                password: 'Password123!',
                data: { full_name: 'Test Student', branch: 'AIML' }
            });
            assert(signupRes.status === 200 || signupRes.status === 201);
            const token = signupRes.body.access_token;
            const authUserId = signupRes.body.user.id;
            assert(token, 'Must receive Bearer token');

            // 2. Submit review attempting to spoof user_id
            const uniqueReview = `BTechPath AI transformed how I study for semester exams at ${Date.now()}. Truly exceptional tools!`;
            const reviewRes = await request('POST', '/api/reviews', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-user-id': 'spoofed_user_id_123'
            }, {
                rating: 5,
                review_text: uniqueReview,
                feature_used: 'AI Notes',
                user_id: 'spoofed_body_id_456'
            });

            assert.strictEqual(reviewRes.status, 201);
            assert.strictEqual(reviewRes.body.success, true);
            assert.strictEqual(reviewRes.body.review.user_id, authUserId, 'user_id must be strictly derived from auth.uid()');
        }),

        test('3.3 POST /api/reviews validates rating bounds (1-5) and minimum length', async () => {
            const email = `bound_test_${Date.now()}@btechpath.ai`;
            const signupRes = await request('POST', '/auth/v1/signup', { 'Content-Type': 'application/json' }, {
                email,
                password: 'Password123!',
                data: { full_name: 'Bounds Tester', branch: 'ECE' }
            });
            const token = signupRes.body.access_token;
            assert(token, 'Must receive Bearer token');

            // Invalid rating (> 5)
            const resBadRating = await request('POST', '/api/reviews', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }, {
                rating: 6,
                review_text: 'Valid length text here for testing rating bounds.',
                feature_used: 'AI Notes'
            });
            assert.strictEqual(resBadRating.status, 400);

            // Short text (< 10 chars)
            const resShortText = await request('POST', '/api/reviews', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }, {
                rating: 5,
                review_text: 'Short',
                feature_used: 'AI Notes'
            });
            assert.strictEqual(resShortText.status, 400);
        }),

        test('3.4 Thank You page meets all UI and security specifications', async () => {
            const res = await request('GET', '/thank-you.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes('Thank You!'), 'Contains Thank You! heading');
            assert(res.raw.includes('Your review has been submitted successfully.'), 'Contains confirmed subheading');
            assert(res.raw.includes('Your feedback helps us improve TechPath for engineering students.') || res.raw.includes('Your feedback helps us improve BTechPath AI for engineering students.'), 'Contains description');
            assert(res.raw.includes('Back to Home'), 'Contains Back to Home button');
            assert(res.raw.includes('Continue Learning'), 'Contains Continue Learning button');
            assert(!res.raw.includes('Reference Token'), 'Must NOT leak or generate reference tokens');
        }),

        // ----------------------------------------------------------------------
        // 4. MANDATORY SIGNUP CONSENT & TRACKING SYSTEM
        // ----------------------------------------------------------------------
        test('4.1 signup.html contains unchecked mandatory consent checkbox and clickable links', async () => {
            const res = await request('GET', '/signup.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes('id="terms-consent-checkbox"'), 'Checkbox present');
            assert(!res.raw.includes('id="terms-consent-checkbox" checked'), 'Checkbox must be UNCHECKED by default');
            assert(res.raw.includes('href="privacy-policy.html" target="_blank"'), 'Privacy policy link opens in new tab');
            assert(res.raw.includes('href="terms.html" target="_blank"'), 'Terms of Use link opens in new tab');
            assert(res.raw.includes('Please agree to the Privacy Policy and Terms of Use to create your account.'), 'Validation error message present');
        }),

        test('4.2 POST /api/user/consent records consent and GET /api/user/consent retrieves it', async () => {
            const email = `consent_user_${Date.now()}@btechpath.ai`;
            const signupRes = await request('POST', '/auth/v1/signup', { 'Content-Type': 'application/json' }, {
                email,
                password: 'Password123!',
                data: { full_name: 'Consent Student', branch: 'CSE' }
            });
            const token = signupRes.body.access_token;
            assert(token, 'Must receive Bearer token');

            // Record consent
            const consentRes = await request('POST', '/api/user/consent', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }, {
                terms_accepted: true,
                privacy_accepted: true,
                terms_version: '2026.1',
                privacy_version: '2026.1'
            });
            assert.strictEqual(consentRes.status, 200);
            assert.strictEqual(consentRes.body.success, true);

            // Retrieve consent
            const getConsentRes = await request('GET', '/api/user/consent', {
                'Authorization': `Bearer ${token}`
            });
            assert.strictEqual(getConsentRes.status, 200);
            assert.strictEqual(getConsentRes.body.hasConsent, true);
            assert.strictEqual(getConsentRes.body.consent.terms_version, '2026.1');
            assert.strictEqual(getConsentRes.body.consent.privacy_version, '2026.1');
        }),

        test('4.3 GET /api/admin/consents enforces admin-only access control', async () => {
            // Non-admin student
            const email = `nonadmin_${Date.now()}@btechpath.ai`;
            const signupRes = await request('POST', '/auth/v1/signup', { 'Content-Type': 'application/json' }, {
                email,
                password: 'Password123!'
            });
            const token = signupRes.body.access_token;

            const nonAdminRes = await request('GET', '/api/admin/consents', {
                'Authorization': `Bearer ${token}`
            });
            assert.strictEqual(nonAdminRes.status, 403, 'Non-admin must receive 403 Forbidden');

            // Authorized admin
            const adminLoginRes = await request('POST', '/auth/v1/token?grant_type=password', { 'Content-Type': 'application/json' }, {
                email: 'rahulashokhlakkimsetty@gmail.com',
                password: 'Password123!'
            });
            const adminToken = adminLoginRes.body?.access_token;
            if (adminToken) {
                const adminRes = await request('GET', '/api/admin/consents', {
                    'Authorization': `Bearer ${adminToken}`
                });
                assert.strictEqual(adminRes.status, 200);
                assert.strictEqual(adminRes.body.success, true);
                assert(Array.isArray(adminRes.body.consents));
            }
        }),

        // ----------------------------------------------------------------------
        // 5. PASSWORD RESET EXPERIENCE & GENERIC NON-ENUMERATION
        // ----------------------------------------------------------------------
        test('5.1 POST /auth/v1/recover returns generic non-enumerating message for any email', async () => {
            const res = await request('POST', '/auth/v1/recover', { 'Content-Type': 'application/json' }, {
                email: 'nonexistent_account_xyz999@randomdomain.edu'
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'If the email is registered, you will receive password reset instructions.');
        }),

        test('5.2 login.html has dedicated password reset modal integration', async () => {
            const res = await request('GET', '/login.html');
            assert.strictEqual(res.status, 200);
            assert(res.raw.includes('openForgotPasswordModal'), 'login.html invokes openForgotPasswordModal');
            assert(!res.raw.includes("prompt('Enter your registered account email:')"), 'No browser prompt() in login.html');
        }),

        // ----------------------------------------------------------------------
        // 6. PRODUCTION SECURITY HEADERS & RATE LIMITING
        // ----------------------------------------------------------------------
        test('6.1 Server sends essential security headers on HTTP responses', async () => {
            const res = await request('GET', '/api/config');
            assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
            assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN');
            assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
        }),

        test('6.2 SQL migration 20260912_19_user_consents.sql has correct schema and RLS policies', async () => {
            const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260912_19_user_consents.sql');
            assert(fs.existsSync(migrationPath), 'Migration 19 file exists');
            const sql = fs.readFileSync(migrationPath, 'utf8');
            assert(sql.includes('CREATE TABLE IF NOT EXISTS public.user_consents'), 'Table created');
            assert(sql.includes('ENABLE ROW LEVEL SECURITY'), 'RLS enabled');
            assert(sql.includes('auth.uid() = user_id'), 'User-scoped policy present');
            assert(sql.includes('public.is_admin()'), 'Admin audit policy present');
        })
    ];

    for (const t of testSuite) {
        await t();
    }

    console.log('\n========================================================');
    console.log(`🏁 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
});
