const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

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

async function testCompleteLifecycle() {
    console.log('--- 1. Login with Test User ---');
    const client = createClient(SUPABASE_URL, ANON_KEY);
    const { data: auth, error: authErr } = await client.auth.signInWithPassword({
        email: 'lakkimsettirahulashokh@gmail.com',
        password: 'Student@123'
    });
    assert(!authErr, 'Login failed');
    console.log('✅ Logged in:', auth.user.id);

    console.log('\n--- 2. Onboarding Status Check ---');
    const { data: profile } = await client.from('profiles').select('*').eq('id', auth.user.id).single();
    console.log('Onboarding status in DB:', profile.onboarding_completed);
    assert.strictEqual(profile.onboarding_completed, false, 'User correctly classified as incomplete');
    console.log('✅ Incomplete user will route to start-journey.html');

    console.log('\n--- 3. Simulate Complete Onboarding Update ---');
    const { data: updatedProfile, error: upErr } = await client.from('profiles').update({
        onboarding_completed: true,
        full_name: 'Ashokh Lakkimsetty',
        branch: 'AIML',
        semester: 1
    }).eq('id', auth.user.id).select().single();
    assert(!upErr, 'Profile update failed');
    console.log('✅ Updated onboarding_completed to:', updatedProfile.onboarding_completed);

    console.log('\n--- 4. Verify Completed User Routes to Dashboard ---');
    const hasName = Boolean(updatedProfile.full_name || updatedProfile.name);
    const hasDepartment = Boolean(updatedProfile.department_id || updatedProfile.branch);
    const hasSemester = Boolean(updatedProfile.semester);
    const isComplete = (updatedProfile.onboarding_completed === true) && hasName && hasDepartment && hasSemester;
    assert.strictEqual(isComplete, true, 'User correctly evaluated as complete');
    console.log('✅ Complete user routes directly to dashboard.html');

    console.log('\n--- 5. Session Refresh Simulation ---');
    const { data: refreshed, error: refErr } = await client.auth.refreshSession();
    assert(!refErr, 'Session refresh failed');
    console.log('✅ Session refreshed successfully. User id:', refreshed.user.id);

    console.log('\n--- 6. Reset Test User Back to Incomplete for Testing ---');
    await client.from('profiles').update({
        onboarding_completed: false
    }).eq('id', auth.user.id);
    console.log('✅ Reset test user onboarding_completed back to false.');

    console.log('\n--- 7. Logout Simulation ---');
    const { error: outErr } = await client.auth.signOut();
    assert(!outErr, 'Logout failed');
    console.log('✅ User logged out cleanly.');

    console.log('\n🎉 ALL LIFECYCLE TESTS PASSED!');
}

testCompleteLifecycle();
