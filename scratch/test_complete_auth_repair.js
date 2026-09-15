// ==============================================================================
// Test Complete Auth & Verification Flow Verification Script
// Tests live against Supabase and localhost:8080 API
// ==============================================================================

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Read .env
const env = {};
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

function postJson(urlStr, data, headers = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(urlStr);
        const isHttps = u.protocol === 'https:';
        const lib = isHttps ? https : http;
        const payload = JSON.stringify(data);

        const req = lib.request(u, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                ...headers
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(body); } catch(e) { parsed = body; }
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function getJson(urlStr, headers = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(urlStr);
        const isHttps = u.protocol === 'https:';
        const lib = isHttps ? https : http;

        const req = lib.request(u, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                ...headers
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(body); } catch(e) { parsed = body; }
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runAudit() {
    console.log('=== TECHPATH COMPLETE AUTH & VERIFICATION AUDIT ===\n');

    // 1. Check /api/config
    console.log('1. Testing Local Server /api/config ...');
    const configRes = await getJson('http://localhost:8080/api/config');
    console.log(`   Status: ${configRes.status}`);
    console.log(`   appUrl: ${configRes.data.appUrl}`);
    console.log(`   supabaseUrl: ${configRes.data.supabaseUrl}`);
    console.log(`   isSupabaseConfigured: ${configRes.data.isSupabaseConfigured}`);

    // 2. Test Supabase Email Provider Settings
    console.log('\n2. Auditing Supabase Auth Settings ...');
    const settingsRes = await getJson(`${SUPABASE_URL}/auth/v1/settings`);
    console.log(`   Status: ${settingsRes.status}`);
    console.log(`   Email Provider: ${settingsRes.data?.external?.email ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   Google Provider: ${settingsRes.data?.external?.google ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   Disable Signup: ${settingsRes.data?.disable_signup ? 'YES' : 'NO'}`);

    // 3. Test Wrong Password Handling
    console.log('\n3. Testing Wrong Password Authentication ...');
    const wrongAuth = await postJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        email: 'lakkimsettirahulashokh@gmail.com',
        password: 'DefinitelyWrongPassword123!'
    });
    console.log(`   Status: ${wrongAuth.status}`);
    console.log(`   Error code: ${wrongAuth.data?.error_code || wrongAuth.data?.code}`);
    console.log(`   Error msg: ${wrongAuth.data?.msg || wrongAuth.data?.error_description}`);
    const isInvalidCreds = (wrongAuth.data?.error_code === 'invalid_credentials' || wrongAuth.data?.msg?.includes('Invalid login credentials'));
    console.log(`   Mapped To User Toast: "${isInvalidCreds ? 'Email or password is incorrect.' : 'Unable to sign in right now.'}"`);

    // 4. Test Correct Password Authentication
    console.log('\n4. Testing Real Account Authentication (lakkimsettirahulashokh@gmail.com) ...');
    const correctAuth = await postJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        email: 'lakkimsettirahulashokh@gmail.com',
        password: 'Student@123'
    });
    console.log(`   Status: ${correctAuth.status}`);
    const token = correctAuth.data?.access_token;
    const user = correctAuth.data?.user;
    if (token && user) {
        console.log(`   ✅ Session Created: Token length ${token.length}`);
        console.log(`   ✅ User ID: ${user.id}`);
        console.log(`   ✅ Email Confirmed: ${user.email_confirmed_at}`);
        
        // 5. Test Profile Loading with auth.uid() token
        console.log('\n5. Testing Profile Lookup with JWT under RLS ...');
        const profileRes = await getJson(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
            'Authorization': `Bearer ${token}`
        });
        console.log(`   Profile Status: ${profileRes.status}`);
        const profile = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
        console.log(`   Profile Name: ${profile?.full_name}`);
        console.log(`   Profile Branch: ${profile?.branch}`);
        console.log(`   Onboarding Completed: ${profile?.onboarding_completed}`);

        // 6. Test Routing Evaluation
        console.log('\n6. Testing Route Decision ...');
        const isComplete = Boolean(profile?.onboarding_completed && profile?.full_name && profile?.branch && profile?.semester);
        const targetPage = isComplete ? 'dashboard.html' : 'onboarding.html';
        console.log(`   Target Route: ${targetPage}`);
    } else {
        console.error('   ❌ Login failed:', correctAuth.data);
    }

    // 7. Test Verification Callback Page Availability
    console.log('\n7. Testing Verification Callback Page Routing ...');
    const callbackHtml = await getJson('http://localhost:8080/auth-callback.html');
    console.log(`   /auth-callback.html Status: ${callbackHtml.status}`);
    const callbackClean = await getJson('http://localhost:8080/auth/callback');
    console.log(`   /auth/callback Clean Alias Status: ${callbackClean.status}`);
    const onboardingClean = await getJson('http://localhost:8080/onboarding');
    console.log(`   /onboarding Clean Alias Status: ${onboardingClean.status}`);

    console.log('\n=== AUDIT COMPLETE ===');
}

runAudit().catch(console.error);
