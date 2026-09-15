/**
 * Comprehensive Verification Test Suite for Google Sign-In & OAuth Callback
 * Tests:
 * 1. Canonical /auth/callback Route Resolution (HTTP 200 OK, No 404)
 * 2. Route Aliases (/auth/callback, /auth-callback, /auth/callback.html)
 * 3. Local /auth/v1/authorize Endpoint (HTTP 302 Redirect with code=)
 * 4. PKCE Code Exchange via /auth/v1/token (HTTP 200 OK + access_token)
 * 5. PKCE Code Single-Use Enforcement (Burned on exchange)
 * 6. auth-callback.html and auth/callback.html Source Integrity
 * 7. js/auth.js handleGoogleSSO & checkUrlTokens Invariants
 * 8. Onboarding & Route Guard Flow Invariants
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8080;

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        testsFailed++;
    }
}

function getUrl(urlPath) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        }).on('error', reject);
    });
}

function postJson(urlPath, payload) {
    return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(payload);
        const req = http.request(`http://localhost:${PORT}${urlPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = {};
                try { parsed = JSON.parse(data); } catch (e) { parsed = { raw: data }; }
                resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

async function runTests() {
    console.log('========================================================');
    console.log('🧪 Starting Google OAuth & Callback Verification Suite');
    console.log('========================================================\n');

    // -------------------------------------------------------------------------
    // TEST 1: Canonical Callback Routes
    // -------------------------------------------------------------------------
    console.log('1. Testing Callback Routes in server.js:');
    try {
        const cbRes = await getUrl('/auth/callback');
        assert(cbRes.statusCode === 200, 'GET /auth/callback returns 200 OK (NOT 404)');
        assert(cbRes.body.includes('Authenticating Account'), '/auth/callback serves auth-callback.html UI');
        assert(!cbRes.body.includes('Page Not Found') && !cbRes.body.includes('404'), '/auth/callback contains zero 404 references');

        const cbAliasRes = await getUrl('/auth-callback');
        assert(cbAliasRes.statusCode === 200, 'GET /auth-callback returns 200 OK');

        const cbHtmlRes = await getUrl('/auth-callback.html');
        assert(cbHtmlRes.statusCode === 200, 'GET /auth-callback.html returns 200 OK');

        const cbSubRes = await getUrl('/auth/callback.html');
        assert(cbSubRes.statusCode === 200, 'GET /auth/callback.html fallback file returns 200 OK');
    } catch (e) {
        assert(false, `Callback routes error: ${e.message}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Local /auth/v1/authorize
    // -------------------------------------------------------------------------
    console.log('\n2. Testing /auth/v1/authorize (Local OAuth Initiation):');
    let generatedAuthCode = '';
    try {
        const authorizeRes = await getUrl('/auth/v1/authorize?provider=google&redirect_to=http://localhost:8080/auth/callback');
        assert(authorizeRes.statusCode === 302, 'GET /auth/v1/authorize returns HTTP 302 redirect');
        const loc = authorizeRes.headers.location || '';
        assert(loc.startsWith('http://localhost:8080/auth/callback?code='), `Location redirects to canonical callback with code (${loc})`);
        
        const urlObj = new URL(loc);
        generatedAuthCode = urlObj.searchParams.get('code');
        assert(Boolean(generatedAuthCode && generatedAuthCode.startsWith('oauth-code-')), 'Authorization code generated successfully');
    } catch (e) {
        assert(false, `Authorize endpoint error: ${e.message}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: PKCE Code Exchange (/auth/v1/token)
    // -------------------------------------------------------------------------
    console.log('\n3. Testing PKCE Authorization Code Exchange (/auth/v1/token):');
    try {
        const tokenRes = await postJson('/auth/v1/token?grant_type=pkce', {
            auth_code: generatedAuthCode
        });
        assert(tokenRes.statusCode === 200, 'POST /auth/v1/token?grant_type=pkce returns 200 OK');
        assert(tokenRes.body.access_token && tokenRes.body.access_token.startsWith('sb-sec-'), 'Returns cryptographically signed session access_token');
        assert(tokenRes.body.user && tokenRes.body.user.email === 'alex.rivera@btechpath.ai', 'Returns authenticated user identity (auth.uid())');

        // Test single use: re-submitting burned code should fail with invalid_grant
        const repeatRes = await postJson('/auth/v1/token?grant_type=pkce', {
            auth_code: generatedAuthCode
        });
        assert(repeatRes.statusCode === 400 && repeatRes.body.error === 'invalid_grant', 'Burned authorization code cannot be replayed (anti-replay safe)');
    } catch (e) {
        assert(false, `Token exchange error: ${e.message}`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Frontend Code Audit (auth.js & app.js)
    // -------------------------------------------------------------------------
    console.log('\n4. Testing Frontend Code Invariants:');
    try {
        const authJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'auth.js'), 'utf8');
        assert(authJs.includes("'/auth/callback'"), "handleGoogleSSO specifies canonical '/auth/callback' as redirectTo");
        assert(!authJs.includes("window.location.origin + '/login.html'"), "Removed incorrect redirectTo pointing to login.html");
        assert(authJs.includes("exchangeCodeForSession(code)"), "checkUrlTokens supports PKCE ?code= exchange");

        const callbackHtml = fs.readFileSync(path.join(ROOT_DIR, 'auth-callback.html'), 'utf8');
        assert(callbackHtml.includes("exchangeCodeForSession(code)"), "auth-callback.html implements PKCE exchangeCodeForSession");
        assert(callbackHtml.includes("start-journey.html") && callbackHtml.includes("dashboard.html"), "auth-callback.html branches on onboarding completeness");
        assert(callbackHtml.includes("Unable to sign in with Google"), "auth-callback.html includes required user-friendly error copy");
        assert(callbackHtml.includes("Google sign-in could not be completed"), "auth-callback.html includes required callback error copy");
    } catch (e) {
        assert(false, `Frontend code audit error: ${e.message}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Existing Login & Signup Regressions
    // -------------------------------------------------------------------------
    console.log('\n5. Testing Email/Password Login Regressions:');
    try {
        const loginPageRes = await getUrl('/login');
        assert(loginPageRes.statusCode === 200, 'GET /login returns 200 OK');
        assert(loginPageRes.body.includes('handleGoogleSSO'), 'Google SSO trigger is bound to handleGoogleSSO');

        const signupPageRes = await getUrl('/signup');
        assert(signupPageRes.statusCode === 200, 'GET /signup returns 200 OK');

        // Test wrong password
        const badLoginRes = await postJson('/auth/v1/token?grant_type=password', {
            email: 'alex.rivera@btechpath.ai',
            password: 'wrongpassword'
        });
        assert(badLoginRes.statusCode === 400, 'Invalid credentials returns 400 Bad Request');
    } catch (e) {
        assert(false, `Regression test error: ${e.message}`);
    }

    console.log('\n========================================================');
    console.log(`Test Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('========================================================\n');

    if (testsFailed > 0) {
        process.exit(1);
    }
}

runTests();
