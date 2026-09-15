const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testDiagnostic() {
    console.log('=== TECHPATH STARTUP DIAGNOSTIC ===');
    
    // 1. Test /api/config
    console.log('\n[1] Testing /api/config...');
    try {
        const res = await fetch('http://127.0.0.1:8080/api/config');
        const config = await res.json();
        console.log('  /api/config status:', res.status);
        console.log('  supabaseUrl:', config.supabaseUrl);
        console.log('  supabaseAnonKey length:', config.supabaseAnonKey?.length);
        console.log('  appUrl:', config.appUrl);
    } catch (e) {
        console.error('  /api/config FAILED:', e.message);
    }

    // Read env
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
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false }
    });

    // 2. Test Supabase Auth getSession without session
    console.log('\n[2] Testing unauthenticated getSession()...');
    const { data: noSession, error: noSessionErr } = await client.auth.getSession();
    console.log('  Session data:', noSession?.session);
    console.log('  Session error:', noSessionErr);

    // 3. Test profile lookup without session
    console.log('\n[3] Testing unauthenticated profiles query...');
    const { data: anonProf, error: anonProfErr } = await client.from('profiles').select('*').limit(1);
    console.log('  Anon profiles query error:', anonProfErr?.message || 'None');
    console.log('  Anon profiles rows:', anonProf?.length);

    // 4. Test authenticated session flow with our test account
    console.log('\n[4] Testing authentication with test student account...');
    // Let's check auth.users table or sign in with student password
    const { data: signData, error: signErr } = await client.auth.signInWithPassword({
        email: 'lakkimsettirahulashokh@gmail.com',
        password: 'Password@123'
    });
    console.log('  SignIn Password@123 error:', signErr?.message || 'None');
    
    let authClient = client;
    let user = signData?.user;

    if (!user) {
        // Try Student@123 or other password
        const { data: s2, error: e2 } = await client.auth.signInWithPassword({
            email: 'lakkimsettirahulashokh@gmail.com',
            password: 'Student@123'
        });
        console.log('  SignIn Student@123 error:', e2?.message || 'None');
        user = s2?.user;
    }

    if (user) {
        console.log('  Authenticated user id:', user.id);
        console.log('  User email:', user.email);
        console.log('  User metadata:', user.user_metadata);

        // 5. Test Profile lookup for authenticated user
        console.log('\n[5] Testing authenticated profile lookup...');
        const { data: profile, error: profErr } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        console.log('  Profile error:', profErr?.message || 'None');
        console.log('  Profile exists:', Boolean(profile));
        console.log('  onboarding_completed:', profile?.onboarding_completed);
        console.log('  terms_accepted:', profile?.terms_accepted);
        console.log('  privacy_accepted:', profile?.privacy_accepted);
    }
}

testDiagnostic();
