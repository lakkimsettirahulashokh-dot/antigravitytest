const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
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

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Password@123!';

    console.log('Testing signUp with:', testEmail);
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                full_name: 'Test Candidate',
                branch: 'CSE',
                semester: 2
            }
        }
    });

    if (signUpError) {
        console.error('SignUp Error:', signUpError);
    } else {
        console.log('SignUp Success! User:', signUpData.user?.id);
        console.log('Email confirmed at:', signUpData.user?.email_confirmed_at);
        console.log('Session returned on signup?:', Boolean(signUpData.session));
    }

    // Try signInWithPassword
    console.log('\nTesting signInWithPassword with:', testEmail);
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    });

    if (signInError) {
        console.log('SignIn Error:', signInError.message, 'Status:', signInError.status);
    } else {
        console.log('SignIn Success! Session user:', signInData.user?.id);
    }
}

main().catch(console.error);
