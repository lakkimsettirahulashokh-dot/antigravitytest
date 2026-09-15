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
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(SUPABASE_URL, ANON_KEY);

async function testFlow() {
    console.log('--- 1. Testing Supabase Auth with test user ---');
    // Test user
    const email = 'lakkimsettirahulashokh@gmail.com';
    const passwords = ['Student@123', 'Password@123', 'TechPath@2026', 'Rahul@123', 'Rahul@12345'];
    
    let loggedIn = false;
    let authData = null;
    for (const pw of passwords) {
        const { data, error } = await client.auth.signInWithPassword({ email, password: pw });
        if (!error && data?.user) {
            console.log(`✅ Logged in successfully with password: ${pw}`);
            loggedIn = true;
            authData = data;
            break;
        } else {
            console.log(`Attempt with ${pw} failed:`, error?.message);
        }
    }

    if (!loggedIn) {
        console.log('Could not log in with test passwords. Checking user existence via DB...');
    } else {
        console.log('User ID:', authData.user.id);
        console.log('User metadata:', authData.user.user_metadata);

        console.log('\n--- 2. Checking profile in profiles table ---');
        const { data: profile, error: profErr } = await client
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

        console.log('Profile query error:', profErr);
        console.log('Profile data:', profile);

        console.log('\n--- 3. Checking consent in user_consents table ---');
        const { data: consents, error: consentErr } = await client
            .from('user_consents')
            .select('*')
            .eq('user_id', authData.user.id);

        console.log('Consent query error:', consentErr);
        console.log('Consent data:', consents);
    }
}

testFlow();
