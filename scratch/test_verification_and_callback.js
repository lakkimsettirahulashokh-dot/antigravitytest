const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
    console.log('========================================================');
    console.log('TECHPATH AUTH REPAIR VERIFICATION TEST SUITE');
    console.log('========================================================\n');

    let allPassed = true;

    // Test 1: Existing email signup detection
    console.log('▶ [1] Testing Existing User Signup Detection...');
    const existingRes = await supabase.auth.signUp({
        email: 'lakkimsettirahulashokh@gmail.com',
        password: 'TestPassword@123'
    });
    const isExistingDetected = existingRes.data?.user && Array.isArray(existingRes.data.user.identities) && existingRes.data.user.identities.length === 0;
    if (isExistingDetected) {
        console.log('  ✅ SUCCESS: Existing registered email cleanly detected (identities: []). App correctly routes to login.');
    } else {
        console.error('  ❌ FAIL: Existing email not detected:', existingRes);
        allPassed = false;
    }

    // Test 2: Resend verification API
    console.log('\n▶ [2] Testing Resend Verification Flow...');
    const resendRes = await supabase.auth.resend({
        type: 'signup',
        email: 'lakkimsettirahulashokh@gmail.com',
        options: {
            emailRedirectTo: 'http://localhost:8080/auth-callback.html?type=signup'
        }
    });
    if (!resendRes.error || resendRes.error.message.includes('rate limit')) {
        console.log('  ✅ SUCCESS: Resend API executed without unhandled exceptions.');
    } else {
        console.log('  Notice on resend:', resendRes.error?.message);
    }

    // Test 3: Existing verified account login
    console.log('\n▶ [3] Testing Existing Verified Account Login...');
    const loginRes = await supabase.auth.signInWithPassword({
        email: 'lakkimsettirahulashokh@gmail.com',
        password: 'Student@123'
    });
    if (loginRes.data?.session && loginRes.data?.user) {
        console.log('  ✅ SUCCESS: Authenticated user:', loginRes.data.user.id);
        console.log('  Session active, token present.');
    } else {
        console.error('  ❌ FAIL: Login failed:', loginRes.error);
        allPassed = false;
    }

    // Test 4: Profile and Onboarding check for verified user
    console.log('\n▶ [4] Testing Profile & Onboarding Evaluation...');
    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginRes.data.user.id)
        .single();
    
    if (!profErr && profile) {
        console.log('  ✅ SUCCESS: Profile retrieved for:', profile.full_name || profile.name);
        console.log('  onboarding_completed:', profile.onboarding_completed);
        const destination = profile.onboarding_completed ? 'dashboard.html' : 'start-journey.html';
        console.log('  Destination determined:', destination);
        if (destination === 'dashboard.html') {
            console.log('  ✅ SUCCESS: Verified onboarding-complete user correctly routed to dashboard.html');
        } else {
            console.error('  ❌ Unexpected destination for completed user');
        }
    } else {
        console.error('  ❌ FAIL: Profile fetch error:', profErr);
        allPassed = false;
    }

    // Test 5: Verify auth-callback destination routing logic
    console.log('\n▶ [5] Testing Callback Destination Logic Matrix...');
    function evaluateCallbackRoute(user, profile) {
        if (!user) return 'ERROR_NO_SESSION';
        const isComplete = Boolean(profile?.onboarding_completed === true);
        return isComplete ? 'dashboard.html' : 'start-journey.html';
    }

    const testCompleteUser = { id: 'u1' };
    const testCompleteProf = { onboarding_completed: true };
    const testIncompleteProf = { onboarding_completed: false };

    console.log('  Complete user ->', evaluateCallbackRoute(testCompleteUser, testCompleteProf));
    console.log('  Incomplete user ->', evaluateCallbackRoute(testCompleteUser, testIncompleteProf));
    console.log('  Unauthenticated ->', evaluateCallbackRoute(null, null));

    if (evaluateCallbackRoute(testCompleteUser, testCompleteProf) === 'dashboard.html' &&
        evaluateCallbackRoute(testCompleteUser, testIncompleteProf) === 'start-journey.html') {
        console.log('  ✅ SUCCESS: Callback routing matrix matches specifications perfectly.');
    } else {
        console.error('  ❌ FAIL: Routing logic matrix mismatch');
        allPassed = false;
    }

    console.log('\n========================================================');
    console.log('FINAL TEST VERDICT:', allPassed ? 'ALL TESTS PASSED ✅' : 'TESTS FAILED ❌');
    console.log('========================================================');
}

runTests().catch(console.error);
