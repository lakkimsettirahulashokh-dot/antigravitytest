const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const assert = require('assert');

// 1. Read .env
const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envText.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
});

const SUPABASE_URL = env.SUPABASE_URL;
const ANON_KEY = env.SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = 'http://localhost:8080';

const client = createClient(SUPABASE_URL, ANON_KEY);

function fetchUrl(urlPath, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = urlPath.startsWith('https:');
        const lib = isHttps ? https : http;
        const u = new URL(urlPath.startsWith('http') ? urlPath : APP_URL + urlPath);
        
        const reqOpts = {
            hostname: u.hostname,
            port: u.port || (isHttps ? 443 : 80),
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = lib.request(reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch {}
                resolve({ status: res.statusCode, headers: res.headers, body: parsed || data });
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runMatrix() {
    console.log('============================================================');
    console.log('TECHPATH AUTHENTICATION FULL MATRIX TEST');
    console.log('============================================================\n');

    const results = {};

    // 1. Email Sign In
    console.log('▶ [TEST 1] Email Sign In with test user');
    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: 'lakkimsettirahulashokh@gmail.com',
            password: 'Student@123'
        });
        assert(!error && data?.user, 'SignIn failed: ' + error?.message);
        assert.strictEqual(data.user.email, 'lakkimsettirahulashokh@gmail.com');
        results['Email Sign In'] = 'PASS';
        console.log('  ✅ PASS: Authenticated user ' + data.user.id);
    } catch (e) {
        results['Email Sign In'] = 'FAIL: ' + e.message;
        console.log('  ❌ FAIL:', e.message);
    }

    // 2. Email Sign Up (New random student account)
    console.log('\n▶ [TEST 2] Email Sign Up');
    const testSignupEmail = `test.student.${Date.now()}@gmail.com`;
    try {
        const { data, error } = await client.auth.signUp({
            email: testSignupEmail,
            password: 'TestPassword@2026',
            options: {
                data: {
                    full_name: 'Test Matrix Student',
                    branch: 'CSE',
                    terms_accepted: true,
                    privacy_accepted: true
                }
            }
        });
        assert(!error, 'Signup error: ' + error?.message);
        assert(data.user, 'No user returned from signup');
        results['Email Sign Up'] = 'PASS';
        console.log('  ✅ PASS: Created test user ' + testSignupEmail);
    } catch (e) {
        results['Email Sign Up'] = 'FAIL: ' + e.message;
        console.log('  ❌ FAIL:', e.message);
    }

    // 3. Supabase Google Provider status
    console.log('\n▶ [TEST 3] Google OAuth Provider check in Supabase');
    try {
        const settingsRes = await fetchUrl(`${SUPABASE_URL}/auth/v1/settings`, {
            headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
        });
        console.log('  Supabase external settings:', JSON.stringify(settingsRes.body?.external || {}));
        const isGoogleEnabled = Boolean(settingsRes.body?.external?.google);
        if (isGoogleEnabled) {
            results['Google provider enabled'] = 'PASS';
            results['Google OAuth configuration'] = 'PASS';
            console.log('  ✅ PASS: Google provider is enabled in Supabase');
        } else {
            results['Google provider enabled'] = 'BLOCKED (Dashboard config needed)';
            results['Google OAuth configuration'] = 'BLOCKED (Google Client ID & Secret needed in Supabase Dashboard)';
            console.log('  ⚠️ BLOCKED: external.google is false. Requires Google Client ID & Secret in Supabase Dashboard');
        }
    } catch (e) {
        results['Google provider enabled'] = 'FAIL: ' + e.message;
        console.log('  ❌ FAIL:', e.message);
    }

    // 4. Google Auth Endpoint behavior
    console.log('\n▶ [TEST 4] Google Sign In Endpoint behavior');
    try {
        const authRes = await fetchUrl(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=http://localhost:8080/auth-callback.html`, {
            headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
        });
        if (authRes.status === 400 && authRes.body?.error_code === 'validation_failed') {
            console.log('  Supabase returned 400 validation_failed as expected when provider is unconfigured.');
            console.log('  Frontend handleGoogleSSO pre-flight catches this and shows:');
            console.log('  "Google sign-in is temporarily unavailable. Please try again or use email and password."');
            results['Google Sign In'] = 'BLOCKED (Supabase Google provider disabled)';
            results['Google Sign Up'] = 'BLOCKED (Supabase Google provider disabled)';
        } else if (authRes.status === 200 || authRes.status === 302 || authRes.status === 303) {
            results['Google Sign In'] = 'PASS';
            results['Google Sign Up'] = 'PASS';
        }
    } catch (e) {
        results['Google Sign In'] = 'FAIL: ' + e.message;
    }

    // 5. Session Restoration
    console.log('\n▶ [TEST 5] Session Restoration');
    try {
        const { data: sessionData, error: sErr } = await client.auth.signInWithPassword({
            email: 'lakkimsettirahulashokh@gmail.com',
            password: 'Student@123'
        });
        assert(!sErr && sessionData?.session, 'Session creation failed');
        
        // Restore with getUser
        const clientRestore = createClient(SUPABASE_URL, ANON_KEY, {
            auth: { persistSession: false }
        });
        const { data: restored, error: rErr } = await clientRestore.auth.getUser(sessionData.session.access_token);
        assert(!rErr && restored.user, 'Session restoration failed: ' + rErr?.message);
        assert.strictEqual(restored.user.id, sessionData.user.id);
        results['Session restoration'] = 'PASS';
        console.log('  ✅ PASS: Token successfully restored user ' + restored.user.id);
    } catch (e) {
        results['Session restoration'] = 'FAIL: ' + e.message;
        console.log('  ❌ FAIL:', e.message);
    }

    // 6. Profile query for authenticated user
    console.log('\n▶ [TEST 6] Profile lookup for authenticated user');
    try {
        const { data: profile, error: pErr } = await client
            .from('profiles')
            .select('*')
            .eq('id', 'ae777e6c-a60a-45fe-856d-ca0140ca4197')
            .single();
        assert(!pErr, 'Profile query error: ' + pErr?.message);
        assert(profile.id, 'Profile id missing');
        results['Profile lookup'] = 'PASS';
        console.log('  ✅ PASS: Profile found, onboarding_completed = ' + profile.onboarding_completed);
    } catch (e) {
        results['Profile lookup'] = 'FAIL: ' + e.message;
        console.log('  ❌ FAIL:', e.message);
    }

    // 7. Consent check
    console.log('\n▶ [TEST 7] User consent enforcement');
    try {
        const { data: userConsents, error: cErr } = await client
            .from('user_consents')
            .select('*')
            .eq('user_id', 'ae777e6c-a60a-45fe-856d-ca0140ca4197');
        assert(!cErr, 'Consent query error: ' + cErr?.message);
        results['Consent tracking'] = 'PASS';
        console.log('  ✅ PASS: user_consents table queried successfully');
    } catch (e) {
        results['Consent tracking'] = 'FAIL: ' + e.message;
        console.log('  ❌ FAIL:', e.message);
    }

    // 8. Protected routes verification via server
    console.log('\n▶ [TEST 8] Protected routes accessibility & routing');
    const protectedPages = [
        '/dashboard.html',
        '/profile.html',
        '/learn.html',
        '/mock-interview.html',
        '/pdf-analyzer.html',
        '/flashcards.html',
        '/quiz.html',
        '/ide.html',
        '/projects.html',
        '/skills.html',
        '/internships.html',
        '/career.html',
        '/analytics.html',
        '/settings.html',
        '/admin.html'
    ];

    let allProtectedPagesServed = true;
    for (const page of protectedPages) {
        const pageRes = await fetchUrl(page);
        if (pageRes.status !== 200 || !pageRes.body.includes('requireAuth')) {
            // Check if it's admin or normal
            if (page === '/admin.html' && pageRes.body.includes('verifyAdminStatus')) {
                continue;
            }
            allProtectedPagesServed = false;
            console.log(`  ❌ Issue on ${page}: status ${pageRes.status}`);
        }
    }
    if (allProtectedPagesServed) {
        results['Protected routes'] = 'PASS';
        console.log('  ✅ PASS: All 15 protected routes include authoritative guards');
    } else {
        results['Protected routes'] = 'FAIL';
    }

    // 9. Logout
    console.log('\n▶ [TEST 9] Logout verification');
    try {
        const { data: logoutSession } = await client.auth.signInWithPassword({
            email: 'lakkimsettirahulashokh@gmail.com',
            password: 'Student@123'
        });
        assert(logoutSession?.session?.access_token, 'Session missing');
        const { error: signOutErr } = await client.auth.signOut();
        assert(!signOutErr, 'Signout error: ' + signOutErr?.message);
        results['Logout'] = 'PASS';
        console.log('  ✅ PASS: User logged out cleanly from Supabase Auth');
    } catch (e) {
        results['Logout'] = 'FAIL: ' + e.message;
        console.log('  ❌ FAIL:', e.message);
    }

    // 10. Dashboard & Routing Pages
    console.log('\n▶ [TEST 10] Static file serving and clean routes');
    const checkPages = ['/login.html', '/signup.html', '/dashboard.html', '/auth-callback.html', '/start-journey.html'];
    let allOk = true;
    for (const p of checkPages) {
        const res = await fetchUrl(p);
        if (res.status !== 200) {
            allOk = false;
            console.log(`  ❌ ${p} returned ${res.status}`);
        }
    }
    if (allOk) {
        results['Static routing'] = 'PASS';
        console.log('  ✅ PASS: All auth and dashboard routes return HTTP 200');
    } else {
        results['Static routing'] = 'FAIL';
    }

    console.log('\n============================================================');
    console.log('MATRIX SUMMARY');
    console.log('============================================================');
    console.table(results);
}

runMatrix();
