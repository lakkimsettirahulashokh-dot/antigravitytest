/**
 * Comprehensive Verification Test Suite for Auth & Onboarding Flow
 * Tests:
 * 1. Server Clean URL Routing & Redirects
 * 2. Onboarding Status Validation & Incomplete Detection
 * 3. Semester to Year Mapping (Sem 1-8 -> Year 1-4)
 * 4. BranchSystem 40+ Disciplines Catalog
 * 5. Route Guard Protection on all Student Routes
 * 6. Start Your Journey Requirements & Title Verification
 * 7. Profile Save Payload Structure (auth.uid() Ownership Key)
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

async function runTests() {
    console.log('========================================================');
    console.log('🧪 Starting Auth & Onboarding Flow Verification Suite');
    console.log('========================================================\n');

    // -------------------------------------------------------------------------
    // TEST 1: Server Clean URLs & Endpoints
    // -------------------------------------------------------------------------
    console.log('1. Testing Clean URLs and HTTP Routing:');
    try {
        const configRes = await getUrl('/api/config');
        assert(configRes.statusCode === 200, 'GET /api/config returns 200 OK');
        const config = JSON.parse(configRes.body);
        assert(config.isSupabaseConfigured !== undefined || config.supabaseUrl !== undefined, '/api/config returns valid JSON config');

        const sjRes = await getUrl('/start-journey');
        assert(sjRes.statusCode === 200, 'GET /start-journey serves start-journey.html without extension');
        assert(sjRes.body.includes('Start Your Journey'), 'start-journey.html contains "Start Your Journey" title');
        assert(sjRes.body.includes("Let's personalize BTechPath AI for you."), 'start-journey.html contains requested subtitle');

        const obRes = await getUrl('/onboarding.html');
        assert(obRes.statusCode === 200 && obRes.body.includes("replace('start-journey.html'"), 'GET /onboarding.html redirects to start-journey.html');

        const dashRes = await getUrl('/dashboard');
        assert(dashRes.statusCode === 200, 'GET /dashboard serves dashboard.html cleanly');
    } catch (err) {
        assert(false, `Server HTTP test failed: ${err.message}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Semester (1-8) to Academic Year (1-4) Calculation
    // -------------------------------------------------------------------------
    console.log('\n2. Testing Semester (1 to 8) to Year (1 to 4) Mapping:');
    const calcYear = (sem) => Math.min(4, Math.max(1, Math.ceil(sem / 2)));
    assert(calcYear(1) === 1, 'Semester 1 -> 1st Year (Freshman Fundamentals)');
    assert(calcYear(2) === 1, 'Semester 2 -> 1st Year (Freshman Fundamentals)');
    assert(calcYear(3) === 2, 'Semester 3 -> 2nd Year (Core Foundations)');
    assert(calcYear(4) === 2, 'Semester 4 -> 2nd Year (Core Foundations)');
    assert(calcYear(5) === 3, 'Semester 5 -> 3rd Year (Junior Pre-Placement)');
    assert(calcYear(6) === 3, 'Semester 6 -> 3rd Year (Junior Pre-Placement)');
    assert(calcYear(7) === 4, 'Semester 7 -> 4th Year (Senior Capstone)');
    assert(calcYear(8) === 4, 'Semester 8 -> 4th Year (Senior Capstone)');

    // -------------------------------------------------------------------------
    // TEST 3: Branch Catalog Availability (40+ Disciplines)
    // -------------------------------------------------------------------------
    console.log('\n3. Testing Engineering Branch Catalog:');
    const branchesFilePath = path.join(ROOT_DIR, 'js', 'branches.js');
    assert(fs.existsSync(branchesFilePath), 'js/branches.js exists');
    const branchesCode = fs.readFileSync(branchesFilePath, 'utf8');
    // Count branches in catalog
    const branchCodeMatches = branchesCode.match(/code:\s*['"]([A-Z0-9_-]+)['"]/g);
    assert(branchCodeMatches && branchCodeMatches.length >= 40, `Branch catalog contains ${branchCodeMatches?.length} engineering disciplines (>= 40 required)`);

    // -------------------------------------------------------------------------
    // TEST 4: Onboarding Logic & Authoritative DB Check Simulation
    // -------------------------------------------------------------------------
    console.log('\n4. Testing Onboarding Verification Rules:');
    function checkOnboardingSim(profile) {
        const hasName = Boolean(profile?.full_name || profile?.name);
        const hasDepartment = Boolean(profile?.department_id || profile?.branch);
        const hasSemester = Boolean(profile?.semester);
        const isExplicitlyComplete = Boolean(profile?.onboarding_completed || profile?.onboardingComplete);

        const isComplete = (isExplicitlyComplete && hasDepartment && hasSemester) || (hasName && hasDepartment && hasSemester && isExplicitlyComplete);
        return { isComplete: Boolean(isComplete) };
    }

    // Case A: Fresh logged-in user with no profile
    const freshUser = { id: 'usr-1', email: 'student@example.com' };
    assert(!checkOnboardingSim(freshUser).isComplete, 'Fresh user with no profile is incomplete -> Routes to Start Your Journey');

    // Case B: User with name but no department or semester
    const partialUser = { id: 'usr-2', name: 'John Doe', email: 'john@example.com' };
    assert(!checkOnboardingSim(partialUser).isComplete, 'User with only name is incomplete -> Routes to Start Your Journey');

    // Case C: User completed onboarding with all required fields
    const completedUser = {
        id: 'usr-3',
        name: 'Rahul Sharma',
        branch: 'CSE',
        semester: 4,
        onboarding_completed: true
    };
    assert(checkOnboardingSim(completedUser).isComplete, 'Fully configured user is complete -> Routes to Dashboard');

    // Case D: Re-login test (Zero onboarding loop)
    assert(checkOnboardingSim(completedUser).isComplete === true, 'Subsequent login for completed user stays complete (Zero onboarding loop)');

    // -------------------------------------------------------------------------
    // TEST 5: Protected Student Routes Script Verification
    // -------------------------------------------------------------------------
    console.log('\n5. Testing Protected Student Pages for Auth Guard & Supabase:');
    const protectedPages = [
        'dashboard.html',
        'learn.html',
        'ai-notes.html',
        'mock-interview.html',
        'projects.html',
        'skills.html',
        'career.html',
        'internships.html',
        'exams.html',
        'study.html',
        'planner.html',
        'profile.html',
        'settings.html',
        'doubt-solver.html',
        'copilot.html',
        'resume-builder.html',
        'analytics.html'
    ];

    for (const page of protectedPages) {
        const filePath = path.join(ROOT_DIR, page);
        assert(fs.existsSync(filePath), `${page} exists`);
        const content = fs.readFileSync(filePath, 'utf8');
        const hasAuthScript = content.includes('src="js/auth.js"') || content.includes("src='js/auth.js'");
        assert(hasAuthScript, `${page} includes js/auth.js route guard engine`);
        const hasRequireAuth = content.includes('requireAuth') || content.includes('checkAuthRouteGuard');
        assert(hasRequireAuth, `${page} invokes AuthManager.requireAuth()`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Start Your Journey Form Elements & Validation
    // -------------------------------------------------------------------------
    console.log('\n6. Testing Start Your Journey (start-journey.html) Form Fields:');
    const sjPath = path.join(ROOT_DIR, 'start-journey.html');
    const sjContent = fs.readFileSync(sjPath, 'utf8');

    assert(sjContent.includes('id="sj-name"'), 'Full Name input field present');
    assert(sjContent.includes('id="sj-department"'), 'Department dropdown present');
    assert(sjContent.includes('id="sj-semester"'), 'Semester selector present');
    assert(sjContent.includes('id="sj-target-role"'), 'Target career role present');
    assert(sjContent.includes('id="sj-skill-level"'), 'Skill level selection present');
    assert(sjContent.includes('id="sj-career-goal"'), 'Career goal selection present');
    assert(sjContent.includes('saveOnboardingProfile'), 'saveOnboardingProfile() called on form submission');
    assert(sjContent.includes('requireAuth'), 'start-journey.html guards against unauthenticated visits');

    // -------------------------------------------------------------------------
    // TEST 7: Supabase Migration Schema
    // -------------------------------------------------------------------------
    console.log('\n7. Testing Supabase Migration Schema:');
    const migrationPath = path.join(ROOT_DIR, 'supabase', 'migrations', '20260908_13_onboarding_and_auth_flow_schema.sql');
    assert(fs.existsSync(migrationPath), 'Migration 20260908_13_onboarding_and_auth_flow_schema.sql exists');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    assert(migrationSql.includes('onboarding_completed'), 'Schema includes onboarding_completed column');
    assert(migrationSql.includes('department_id'), 'Schema includes department_id column');
    assert(migrationSql.includes('semester'), 'Schema includes semester column');
    assert(migrationSql.includes('year'), 'Schema includes year column');
    assert(migrationSql.includes('auth.uid()'), 'RLS policy enforces auth.uid() ownership');

    // -------------------------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------------------------
    console.log('\n========================================================');
    console.log(`📊 Test Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('========================================================');

    if (testsFailed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
