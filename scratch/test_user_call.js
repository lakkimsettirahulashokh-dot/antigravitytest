const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function testUserCall() {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false }
    });

    console.log('1. Signing in...');
    const { data: signData, error: signErr } = await client.auth.signInWithPassword({
        email: 'lakkimsettirahulashokh@gmail.com',
        password: 'Student@123'
    });
    console.log('Sign in error:', signErr);
    console.log('Sign in user:', signData?.user?.id);
    console.log('Access token exists:', Boolean(signData?.session?.access_token));

    console.log('\n2. Calling getUser(token)...');
    const { data: userData, error: userErr } = await client.auth.getUser(signData.session.access_token);
    console.log('getUser error:', userErr);
    console.log('getUser result:', userData?.user?.id);
}

testUserCall();
