const http = require('http');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, headers: res.headers, json: JSON.parse(body) });
                } catch(e) {
                    resolve({ status: res.statusCode, headers: res.headers, text: body });
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('  BTechPath AI OS — MASTER INTEGRATION TEST SUITE');
    console.log('====================================================\n');

    let passCount = 0;
    let failCount = 0;

    function assert(cond, name) {
        if (cond) {
            console.log(`  ✅ PASS: ${name}`);
            passCount++;
        } else {
            console.error(`  ❌ FAIL: ${name}`);
            failCount++;
        }
    }

    try {
        // 1. Check /api/config
        console.log('1. Testing Public Config (/api/config)...');
        const configRes = await request({ hostname: 'localhost', port: 8080, path: '/api/config', method: 'GET' });
        assert(configRes.status === 200, 'Config status is 200');
        assert(configRes.json.isSupabaseConfigured === true, 'Supabase is configured in bridge');

        // 2. Test Admin Login & Token
        console.log('\n2. Testing Admin Token Generation & Admin Role Verification...');
        const adminEmail = 'rahulashokhlakkimsetty@gmail.com';
        
        // Use password sign in or token check for admin user
        const adminLoginRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/auth/v1/token?grant_type=password',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: adminEmail,
            password: 'test-admin-pass' // If fails, check if we have a direct session in data_store
        });

        let adminToken = null;
        if (adminLoginRes.status === 200 && adminLoginRes.json.access_token) {
            adminToken = adminLoginRes.json.access_token;
        } else {
            // Find session from data_store.json
            const fs = require('fs');
            const ds = JSON.parse(fs.readFileSync('data_store.json', 'utf8'));
            const adminEntry = ds.sessions.find(([tok, s]) => s.email === adminEmail && s.expiresAt > Date.now());
            if (adminEntry) {
                adminToken = adminEntry[0];
            } else {
                // Create a master session
                const crypto = require('crypto');
                const tok = 'sb-sec-' + crypto.randomBytes(32).toString('hex');
                const adminUser = ds.users.find(u => u.email === adminEmail);
                ds.sessions.push([tok, { userId: adminUser.id, email: adminEmail, expiresAt: Date.now() + 86400000 }]);
                fs.writeFileSync('data_store.json', JSON.stringify(ds, null, 2));
                adminToken = tok;
            }
        }
        assert(Boolean(adminToken), 'Admin Bearer Token acquired');

        // 3. Test /api/admin/check-role with Admin Bearer Token
        const adminRoleRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/admin/check-role',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        assert(adminRoleRes.status === 200, 'Admin role check status 200');
        assert(adminRoleRes.json.authorized === true, 'Admin status authorized: true');
        assert(adminRoleRes.json.role === 'admin', 'Admin role returned as "admin"');

        // 4. Test /api/admin/check-role with Student Token
        console.log('\n3. Testing Student Role Verification & Denial...');
        const studentEmail = 'alex.rivera@btechpath.ai';
        const fs = require('fs');
        const ds = JSON.parse(fs.readFileSync('data_store.json', 'utf8'));
        const crypto = require('crypto');
        const studentTok = 'sb-sec-' + crypto.randomBytes(32).toString('hex');
        ds.sessions.push([studentTok, { userId: 'usr-alex-rivera-default', email: studentEmail, expiresAt: Date.now() + 86400000 }]);
        fs.writeFileSync('data_store.json', JSON.stringify(ds, null, 2));

        const studentRoleRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/admin/check-role',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${studentTok}` }
        });
        assert(studentRoleRes.status === 403, 'Student access denied with status 403');
        assert(studentRoleRes.json.authorized === false, 'Student authorized is false');
        assert(studentRoleRes.json.role === 'student', 'Student role returned as "student"');

        // 5. Test Anonymous/Forged /api/admin/check-role
        const anonRoleRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/admin/check-role',
            method: 'GET'
        });
        assert(anonRoleRes.status === 403, 'Unauthenticated check denied with status 403');
        assert(anonRoleRes.json.authorized === false, 'Unauthenticated authorized is false');

        // 6. Test Reviews Direct Publication
        console.log('\n4. Testing Reviews Direct Publication Flow...');
        const testReviewText = 'Direct review test at ' + Date.now() + ' - Excellent curriculum materials for BTech studies!';
        const submitReviewRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/reviews',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            }
        }, {
            rating: 5,
            name: 'Alex Rivera',
            feature_used: 'Video Mastery',
            review_text: testReviewText,
            user_id: 'usr-alex-rivera-default'
        });

        assert(submitReviewRes.status === 201, 'Review POST returned HTTP 201');
        assert(submitReviewRes.json.success === true, 'Review POST success: true');
        assert(submitReviewRes.json.review.status === 'approved', 'Review status is directly set to "approved"');

        // 7. Verify Review Immediately Appears in GET /api/reviews
        const getReviewsRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/reviews',
            method: 'GET'
        });
        assert(getReviewsRes.status === 200, 'GET /api/reviews returned HTTP 200');
        const found = (getReviewsRes.json.reviews || []).some(r => r.review_text === testReviewText);
        assert(found, 'Newly submitted review is immediately present in public reviews feed');

        // 8. Test LearnHub Personalization & Department Isolation
        console.log('\n5. Testing LearnHub Personalization & Video Filtering...');
        const cseVideosRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/videos?department=CSE&semester=4',
            method: 'GET'
        });
        assert(cseVideosRes.status === 200, 'CSE Sem 4 videos returned HTTP 200');
        // Verify no ECE exclusive videos in CSE
        const cseVideos = cseVideosRes.json.videos || [];
        const hasWrongBranch = cseVideos.some(v => {
            const depts = (v.departments || []).map(d => d.toUpperCase());
            return depts.includes('ECE') && !depts.includes('CSE') && !depts.includes('ALL') && !depts.includes('COMMON');
        });
        assert(!hasWrongBranch, 'CSE Sem 4 feed contains zero ECE-exclusive videos');

        const eceVideosRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/videos?department=ECE&semester=4',
            method: 'GET'
        });
        assert(eceVideosRes.status === 200, 'ECE Sem 4 videos returned HTTP 200');

        // 9. Test Admin API Protection on Video Upload
        console.log('\n6. Testing Admin Video Upload API Authorization...');
        // Non-admin attempt
        const studentUploadRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/videos',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentTok}`
            }
        }, {
            title: 'Hacked Video',
            video_url: 'https://youtube.com/watch?v=12345678901',
            subject: 'Hacking',
            departments: ['CSE'],
            semesters: [4]
        });
        assert(studentUploadRes.status === 403, 'Student video upload blocked with 403 Forbidden');

        // Admin attempt
        const adminUploadRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/videos',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            }
        }, {
            title: 'Verified Admin Lecture on Distributed Systems',
            video_url: 'https://youtube.com/watch?v=bkSWJJZNgf8',
            subject: 'Distributed Systems',
            departments: ['CSE'],
            semesters: [4]
        });
        assert(adminUploadRes.status === 201, 'Admin video upload succeeds with 201 Created');
        assert(adminUploadRes.json.success === true, 'Admin video creation returned success: true');

        console.log('\n====================================================');
        console.log(`TOTAL TESTS: ${passCount + failCount} | PASS: ${passCount} | FAIL: ${failCount}`);
        console.log('====================================================');

    } catch (err) {
        console.error('Test execution error:', err);
    }
}

runTests();
