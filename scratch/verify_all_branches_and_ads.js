/**
 * Comprehensive Branch Learning & Ads System Verification Script
 * Validates all 17 Engineering Disciplines, Zero-Coercion, Semester Scoping,
 * Ad Configuration and HTML Placements.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        }).on('error', reject);
    });
}

async function runTests() {
    console.log('================================================================');
    console.log('🔬 TECHPATH BRANCH LEARNING & AD SYSTEM VALIDATION TEST SUITE');
    console.log('================================================================\n');

    let totalTests = 0;
    let passedTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`  ✅ [PASS] ${message}`);
        } else {
            console.error(`  ❌ [FAIL] ${message}`);
        }
    }

    // --- TEST 1: ALL 17 ENGINEERING DISCIPLINES ---
    console.log('--- TEST GROUP 1: Canonical Branch Normalization & Catalog Presence ---');
    const branchTestCases = [
        { query: 'Electronics and Communication Engineering', expectedCode: 'ECE', name: 'ECE' },
        { query: 'Electronics and Instrumentation Engineering', expectedCode: 'EIE', name: 'EIE' },
        { query: 'Electrical & Instrumentation Engineering', expectedCode: 'EIE', name: 'EIE' },
        { query: 'Electrical and Electronics Engineering', expectedCode: 'EEE', name: 'EEE' },
        { query: 'Computer Science and Engineering', expectedCode: 'CSE', name: 'CSE' },
        { query: 'Information Technology', expectedCode: 'IT', name: 'IT' },
        { query: 'Artificial Intelligence and Machine Learning', expectedCode: 'AIML', name: 'AIML' },
        { query: 'Mechanical Engineering', expectedCode: 'MECH', name: 'Mechanical' },
        { query: 'Automobile Engineering', expectedCode: 'AUTO', name: 'Automobile' },
        { query: 'Civil Engineering', expectedCode: 'CIVIL', name: 'Civil' },
        { query: 'Chemical Engineering', expectedCode: 'CHEM', name: 'Chemical' },
        { query: 'Biotechnology Engineering', expectedCode: 'BIOTECH', name: 'Biotech' },
        { query: 'Biomedical Engineering', expectedCode: 'BIOMED', name: 'Biomedical' },
        { query: 'Aerospace Engineering', expectedCode: 'AERO', name: 'Aerospace' },
        { query: 'Mechatronics Engineering', expectedCode: 'MECHTRON', name: 'Mechatronics' },
        { query: 'Robotics & Automation', expectedCode: 'ROBOTICS', name: 'Robotics' },
        { query: 'Manufacturing Engineering', expectedCode: 'MFG', name: 'Manufacturing' },
        { query: 'Industrial Engineering', expectedCode: 'IND', name: 'Industrial' }
    ];

    for (const tc of branchTestCases) {
        const res = await get(`http://localhost:8080/api/branch-learning?branch=${encodeURIComponent(tc.query)}&semester=4`);
        assert(res.status === 200, `API returned 200 for ${tc.name} (${tc.query})`);
        assert(res.data.success === true, `API success flag true for ${tc.name}`);
        assert(res.data.resolvedBranch === tc.expectedCode, `${tc.name} resolved to canonical ${tc.expectedCode} (got: ${res.data.resolvedBranch})`);
        assert(res.data.specialization !== null, `${tc.name} has rich specialization object`);
        if (res.data.specialization) {
            const spec = res.data.specialization;
            assert(spec.modules && spec.modules.length >= 5, `${tc.name} has 5 modules (found ${spec.modules?.length})`);
            assert(spec.branchCode === tc.expectedCode, `${tc.name} spec branchCode matches ${tc.expectedCode}`);
            // Verify specific non-coercion checks
            if (tc.expectedCode === 'EIE') {
                assert(spec.branchCode !== 'ECE', 'CRITICAL BUG CHECK: EIE is strictly NOT coerced to ECE');
                assert(spec.specializationTitle.includes('Instrumentation') || spec.specializationTitle.includes('Process Control'), 'EIE contains authentic instrumentation topics');
            }
            if (tc.expectedCode === 'MECHTRON') {
                assert(spec.branchCode !== 'MECH', 'CRITICAL BUG CHECK: Mechatronics is NOT coerced to MECH');
            }
            if (tc.expectedCode === 'AUTO') {
                assert(spec.branchCode !== 'MECH', 'CRITICAL BUG CHECK: Automobile is NOT coerced to MECH');
            }
            if (tc.expectedCode === 'BIOMED') {
                assert(spec.branchCode !== 'BIOTECH', 'CRITICAL BUG CHECK: Biomedical is NOT coerced to BIOTECH');
            }
        }
    }

    // --- TEST 2: EMPTY / UNSELECTED BRANCH STATE ---
    console.log('\n--- TEST GROUP 2: Empty / Unselected Branch State Guard ---');
    const emptyRes = await get('http://localhost:8080/api/branch-learning?branch=');
    assert(emptyRes.status === 200, 'Empty branch query returns 200');
    assert(emptyRes.data.success === true, 'Empty branch returns success flag');
    assert(emptyRes.data.resolvedBranch === null, 'Empty branch resolvedBranch is null');
    assert(emptyRes.data.specialization === null, 'CRITICAL BUG CHECK: Empty branch returns specialization === null (NO silent ECE fallback)');

    const nullRes = await get('http://localhost:8080/api/branch-learning');
    assert(nullRes.data.specialization === null, 'CRITICAL BUG CHECK: Missing branch query parameter returns specialization === null');

    // --- TEST 3: SEMESTER RECOMMENDATION FILTERING ---
    console.log('\n--- TEST GROUP 3: Semester Personalization & Annotation ---');
    const sem2Res = await get('http://localhost:8080/api/branch-learning?branch=EIE&semester=2');
    assert(sem2Res.data.specialization.activeSemester === 2, 'Semester 2 activeSemester is 2');
    assert(sem2Res.data.specialization.modules[0].isRecommendedForSemester === true, 'Module 1 recommended for Sem 2 (Fundamentals)');
    assert(sem2Res.data.specialization.modules[3].isRecommendedForSemester === false, 'Module 4 NOT recommended for Sem 2 (Advanced Automation)');

    const sem8Res = await get('http://localhost:8080/api/branch-learning?branch=EIE&semester=8');
    assert(sem8Res.data.specialization.activeSemester === 8, 'Semester 8 activeSemester is 8');
    assert(sem8Res.data.specialization.modules[3].isRecommendedForSemester === true, 'Module 4 recommended for Sem 8 (Advanced Automation)');
    assert(sem8Res.data.specialization.modules[4].isRecommendedForSemester === true, 'Module 5 recommended for Sem 8 (Industry & Career)');

    // --- TEST 4: AD ENGINE AUDIT & CONFIGURATION ---
    console.log('\n--- TEST GROUP 4: Centralized Ad Engine Configuration ---');
    const adRes = await get('http://localhost:8080/api/ads/config');
    assert(adRes.status === 200, '/api/ads/config returns HTTP 200');
    assert(adRes.data.success === true, '/api/ads/config returns success true');
    assert(adRes.data.config.ads_enabled === true, 'ads_enabled is true');
    assert(adRes.data.config.app_id === 'ca-app-pub-4576597124085942~9258254900', 'app_id matches .env ca-app-pub-4576597124085942~9258254900');
    assert(adRes.data.config.publisher_id === 'ca-pub-4576597124085942', 'publisher_id matches ca-pub-4576597124085942');
    assert(adRes.data.config.test_mode === true, 'test_mode is true in local development (data-adtest="on")');
    assert(adRes.data.config.slots.branch_learning_bottom === '1850538175', 'branch_learning_bottom slot unit configured to 1850538175');
    assert(adRes.data.config.slots.learnhub_bottom === '1850538175', 'learnhub_bottom slot unit configured to 1850538175');
    assert(adRes.data.config.placements.branch_learning_bottom === true, 'branch_learning_bottom placement enabled');

    // --- TEST 5: STATIC TEMPLATE AUDIT ---
    console.log('\n--- TEST GROUP 5: HTML Placements & Script Inclusions ---');
    const branchHtml = fs.readFileSync(path.join(__dirname, '..', 'branch-learning.html'), 'utf8');
    assert(branchHtml.includes('<script src="js/ads.js" defer></script>'), 'branch-learning.html includes js/ads.js');
    assert(branchHtml.includes('placement="branch_learning_bottom"'), 'branch-learning.html includes branch_learning_bottom ad-banner element');
    assert(!branchHtml.includes('user-branch-display">ECE<'), 'branch-learning.html does NOT hardcode user-branch-display to ECE');
    assert(!branchHtml.includes('header-branch-pill">ECE Specialization<'), 'branch-learning.html does NOT hardcode header pill to ECE');

    const learnHtml = fs.readFileSync(path.join(__dirname, '..', 'learn.html'), 'utf8');
    assert(learnHtml.includes('<script src="js/ads.js" defer></script>'), 'learn.html includes js/ads.js');
    assert(learnHtml.includes('placement="learnhub_bottom"'), 'learn.html includes learnhub_bottom ad-banner element');

    console.log('\n================================================================');
    console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('================================================================\n');

    if (passedTests === totalTests) {
        console.log('🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ZERO COERCION & PERFECT AD AUDIT.');
        process.exit(0);
    } else {
        console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test suite crashed with error:', err);
    process.exit(1);
});
