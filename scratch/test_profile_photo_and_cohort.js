// ==============================================================================
// Comprehensive Test Suite: Profile Photo Upload, Supabase Storage, and Cohort Removal
// ==============================================================================

const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:8080';
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ PASS: ${message}`);
    } else {
        console.error(`  ❌ FAIL: ${message}`);
    }
}

function request(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(data); } catch (e) {}
                resolve({ statusCode: res.statusCode, headers: res.headers, body: data, json });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Minimal 1x1 valid PNG in base64
const VALID_1X1_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function runTests() {
    console.log('\n======================================================');
    console.log('🧪 RUNNING PROFILE PHOTO & COHORT REMOVAL VERIFICATION');
    console.log('======================================================\n');

    // --------------------------------------------------------------------------
    // Test Group 1: Search Codebase for AI Pro Cohort
    // --------------------------------------------------------------------------
    console.log('--- Test Group 1: Codebase Audit for Discontinued Cohort ---');
    const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
    let cohortMatches = 0;
    for (const f of htmlFiles) {
        const content = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
        if (content.includes('AI Pro Cohort') || content.includes('ai-pro-cohort')) {
            console.error(`Found AI Pro Cohort in ${f}`);
            cohortMatches++;
        }
    }
    assert(cohortMatches === 0, `Zero occurrences of "AI Pro Cohort" across all ${htmlFiles.length} HTML template files`);

    const authContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'auth.js'), 'utf8');
    assert(!authContent.includes("'AI Pro Cohort'"), 'js/auth.js has zero occurrences of \'AI Pro Cohort\'');
    assert(authContent.includes("'Engineering Scholar'"), 'js/auth.js sets default tier to \'Engineering Scholar\'');

    // --------------------------------------------------------------------------
    // Test Group 2: Photo Validation (Invalid file type rejection)
    // --------------------------------------------------------------------------
    console.log('\n--- Test Group 2: Image Format & Size Validation ---');
    const invalidTypeRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/user/profile-photo',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'user_test_alpha'
        }
    }, JSON.stringify({
        userId: 'user_test_alpha',
        photoData: 'data:application/pdf;base64,JVBERi0xLjQK...'
    }));
    assert(invalidTypeRes.statusCode === 400, 'Invalid file type (non-image) rejected with HTTP 400');
    assert(invalidTypeRes.json && invalidTypeRes.json.error.includes('Please upload a JPG, PNG, or WebP image.'), 'Clear validation error message for unsupported formats');

    // Test oversize (>5MB)
    const bigData = 'data:image/jpeg;base64,' + 'A'.repeat(7 * 1024 * 1024);
    const oversizeRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/user/profile-photo',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'user_test_alpha'
        }
    }, JSON.stringify({
        userId: 'user_test_alpha',
        photoData: bigData
    }));
    assert(oversizeRes.statusCode === 400, 'Oversize file (>5MB) rejected with HTTP 400');
    assert(oversizeRes.json && oversizeRes.json.error.includes('5MB limit'), 'Clear error message indicating 5MB limit exceeded');

    // --------------------------------------------------------------------------
    // Test Group 3: Valid Photo Upload & Profile Record Persistence
    // --------------------------------------------------------------------------
    console.log('\n--- Test Group 3: Valid Photo Upload & Persistence ---');
    const userA_Id = 'user_alpha_' + Date.now();
    const uploadRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/user/profile-photo',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': userA_Id
        }
    }, JSON.stringify({
        userId: userA_Id,
        photoData: VALID_1X1_PNG,
        fileName: 'profile_shot.png'
    }));

    assert(uploadRes.statusCode === 200, 'Valid PNG upload returns HTTP 200');
    assert(uploadRes.json && uploadRes.json.success === true, 'Upload response contains success: true');
    assert(uploadRes.json && uploadRes.json.avatarUrl && uploadRes.json.avatarUrl.includes(userA_Id), 'Avatar URL points to user-owned storage path');
    const userA_AvatarUrl = uploadRes.json.avatarUrl;

    // Verify image is retrievable via public Storage endpoint
    const getPhotoRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: userA_AvatarUrl.split('?')[0],
        method: 'GET'
    });
    assert(getPhotoRes.statusCode === 200, 'Uploaded photo successfully served via /storage/v1/object/public/...');
    assert(getPhotoRes.headers['content-type'] === 'image/png', 'Served photo has correct Content-Type: image/png');

    // Verify profiles record updated in PostgREST endpoint
    const profileRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/rest/v1/profiles?id=eq.${userA_Id}`,
        method: 'GET'
    });
    assert(profileRes.statusCode === 200, 'Profile lookup returns HTTP 200');
    assert(profileRes.json && profileRes.json.length === 1 && profileRes.json[0].avatar_url === userA_AvatarUrl, 'User profile record in DB references saved avatar_url');

    // --------------------------------------------------------------------------
    // Test Group 4: Storage RLS & User Isolation Security
    // --------------------------------------------------------------------------
    console.log('\n--- Test Group 4: Storage RLS & Cross-User Isolation ---');
    const userB_Id = 'user_bravo_' + Date.now();

    // User B tries to overwrite User A's storage object
    const maliciousUploadRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/storage/v1/object/profile-images/${userA_Id}/hacked.png`,
        method: 'POST',
        headers: {
            'Content-Type': 'image/png',
            'x-user-id': userB_Id // User B authenticated
        }
    }, Buffer.from('fake_image_bytes'));

    assert(maliciousUploadRes.statusCode === 403, 'Cross-user write denied with HTTP 403 Forbidden');
    assert(maliciousUploadRes.json && maliciousUploadRes.json.error === 'Forbidden', 'Ownership violation strictly prevented by server');

    // User B tries to delete User A's photo
    const maliciousDeleteRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/storage/v1/object/profile-images/${userA_Id}/profile-photo.png`,
        method: 'DELETE',
        headers: {
            'x-user-id': userB_Id
        }
    });
    assert(maliciousDeleteRes.statusCode === 403, 'Cross-user delete denied with HTTP 403 Forbidden');

    // --------------------------------------------------------------------------
    // Test Group 5: Remove Profile Photo
    // --------------------------------------------------------------------------
    console.log('\n--- Test Group 5: Remove Photo & Cleanup ---');
    const deleteRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/user/profile-photo',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': userA_Id,
            'Content-Length': Buffer.byteLength(JSON.stringify({ userId: userA_Id }))
        }
    }, JSON.stringify({ userId: userA_Id }));
    console.log('DEBUG deleteRes:', deleteRes.statusCode, deleteRes.body);
    assert(deleteRes.statusCode === 200, 'Remove photo returns HTTP 200');
    assert(deleteRes.json && deleteRes.json.success === true, 'Remove response contains success: true');

    // Verify avatar_url is now null in DB
    const updatedProfileRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/rest/v1/profiles?id=eq.${userA_Id}`,
        method: 'GET'
    });
    assert(updatedProfileRes.json && updatedProfileRes.json[0].avatar_url === null, 'Profile avatar_url reset to null in DB');

    // --------------------------------------------------------------------------
    // Summary
    // --------------------------------------------------------------------------
    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
    console.log('======================================================\n');

    if (passedTests === totalTests) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
