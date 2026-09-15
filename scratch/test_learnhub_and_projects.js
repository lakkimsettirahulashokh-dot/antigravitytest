// scratch/test_learnhub_and_projects.js
// Automated verification suite for LearnHub Video System & Project Hub 24-Section Guides

const http = require('http');

const BASE_URL = 'http://localhost:8080';

function request(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, headers: res.headers, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, text: data });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('===============================================================');
    console.log('STARTING BTECHPATH AI — LEARNHUB & PROJECT HUB VERIFICATION');
    console.log('===============================================================');

    let passed = 0;
    let failed = 0;

    function assert(cond, msg) {
        if (cond) {
            console.log('  ✅ PASS: ' + msg);
            passed++;
        } else {
            console.error('  ❌ FAIL: ' + msg);
            failed++;
        }
    }

    try {
        // -------------------------------------------------------------
        // PART 1: LEARNHUB VIDEO SYSTEM
        // -------------------------------------------------------------
        console.log('\n--- PART 1: LEARNHUB VIDEO AUDIT ---');

        // Test 1.1: CSE Semester 4 Query
        const cseRes = await request('/api/videos?department=CSE&semester=4');
        assert(cseRes.status === 200, 'GET /api/videos?department=CSE&semester=4 returns 200');
        assert(cseRes.data.success === true, 'Response contains success: true');
        assert(Array.isArray(cseRes.data.videos) && cseRes.data.videos.length > 0, `Returned ${cseRes.data.videos?.length} eligible videos for CSE Sem 4`);

        // Test 1.2: Check for dead / fake YouTube IDs
        const DEAD_IDS = ['b4b_yXyXWqM', 'kCc8FmEb1nY', 'Y8kRz0f3x8Y', '0W8c3_u4j80', '5V9X_qK9uJk'];
        let hasDeadIds = false;
        cseRes.data.videos.forEach(v => {
            if (DEAD_IDS.includes(v.youtube_id) || DEAD_IDS.some(did => (v.video_url || '').includes(did))) {
                hasDeadIds = true;
                console.error('    Found dead ID in video:', v.id, v.youtube_id, v.video_url);
            }
        });
        assert(!hasDeadIds, 'Zero dead / fake video IDs found in CSE videos');

        // Test 1.3: Verify live verified IDs exist
        const osVideo = cseRes.data.videos.find(v => v.id === 'vid-cse4-os-process');
        assert(osVideo && osVideo.youtube_id === 'bkSWJJZNgf8', 'Operating Systems video correctly mapped to verified live Gate Smashers ID (bkSWJJZNgf8)');

        const dbmsVideo = cseRes.data.videos.find(v => v.id === 'vid-cse4-dbms-norm');
        assert(dbmsVideo && dbmsVideo.youtube_id === 'HXV3zeQKqGY', 'DBMS video correctly mapped to verified live freeCodeCamp ID (HXV3zeQKqGY)');

        const cnVideo = cseRes.data.videos.find(v => v.id === 'vid-cse4-cn-tcp');
        assert(cnVideo && cnVideo.youtube_id === 'VwN91x5i25g', 'Computer Networks video correctly mapped to verified live Gate Smashers ID (VwN91x5i25g)');

        // Test 1.4: Multi-department queries
        const eceRes = await request('/api/videos?department=ECE&semester=4');
        assert(eceRes.data.videos?.some(v => v.id === 'vid-ece4-de-seq'), 'ECE Semester 4 returns Digital Electronics video');

        const mechRes = await request('/api/videos?department=MECH&semester=5');
        assert(mechRes.data.videos?.some(v => v.id === 'vid-mech5-md-shafts'), 'Mechanical Semester 5 returns Machine Design video');

        const civilRes = await request('/api/videos?department=CIVIL&semester=6');
        assert(civilRes.data.videos?.some(v => v.id === 'vid-civil6-struct-matrix'), 'Civil Semester 6 returns Structural Engineering video');

        // Test 1.5: Common / All Departments content
        assert(cseRes.data.videos.some(v => v.id === 'vid-common-resume-ats'), 'Common Resume Building video appears for CSE students');
        assert(mechRes.data.videos.some(v => v.id === 'vid-common-resume-ats'), 'Common Resume Building video appears for MECH students');

        // Test 1.6: Video Progress Save & Retrieval
        const testUserId = 'test_student_' + Date.now() + '@btechpath.ai';
        const progSaveRes = await request('/api/videos/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                userId: testUserId,
                videoId: 'vid-cse4-os-process',
                positionSeconds: 1250,
                durationSeconds: 2700,
                isCompleted: false
            }
        });
        assert(progSaveRes.status === 200 && progSaveRes.data.success, 'POST /api/videos/progress saves progress');

        const progGetRes = await request(`/api/videos/progress?userId=${encodeURIComponent(testUserId)}`);
        assert(progGetRes.data.progress?.some(p => p.video_id === 'vid-cse4-os-process' && p.last_position_seconds === 1250), 'GET /api/videos/progress retrieves accurate student watch position');

        // -------------------------------------------------------------
        // PART 2: PROJECT HUB & 24-SECTION GUIDES
        // -------------------------------------------------------------
        console.log('\n--- PART 2: PROJECT HUB & 24-SECTION GUIDES AUDIT ---');

        // Test 2.1: Complete Departments from Supabase / Backend
        const deptsRes = await request('/api/departments');
        assert(deptsRes.status === 200 && deptsRes.data.success, 'GET /api/departments returns 200 OK');
        assert(deptsRes.data.count >= 40, `Supports complete B.Tech discipline coverage (${deptsRes.data.count} active engineering departments)`);

        const categories = deptsRes.data.categories || [];
        const requiredCategories = ['Computing', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotech', 'Aerospace'];
        requiredCategories.forEach(cat => {
            assert(categories.includes(cat), `Department category "${cat}" is active`);
        });

        // Test 2.2: Filtered Projects Query
        const cseProjRes = await request('/api/projects?department=CSE&year=3');
        assert(cseProjRes.status === 200 && cseProjRes.data.projects.length > 0, `GET /api/projects?department=CSE&year=3 returned ${cseProjRes.data.projects.length} projects`);
        
        const topCseProj = cseProjRes.data.projects[0];
        assert(topCseProj.matchScore >= 80, `Top project "${topCseProj.title}" has high match score: ${topCseProj.matchScore}%`);
        assert(Boolean(topCseProj.personalizedReason), `Personalized recommendation rationale exists: "${topCseProj.personalizedReason}"`);

        // Test 2.3: Electrical & Hardware Projects
        const eceProjRes = await request('/api/projects?department=ECE');
        assert(eceProjRes.data.projects?.some(p => p.id === 'proj-iot-smart-grid-bms'), 'ECE query returns EV Battery Management System blueprint');

        // Test 2.4: Mechanical & Robotics Projects
        const mechProjRes = await request('/api/projects?department=MECH');
        assert(mechProjRes.data.projects?.some(p => p.id === 'proj-robotics-6dof-ros2'), 'MECH query returns Autonomous Mobile Robot with ROS 2 blueprint');

        // Test 2.5: Civil & Structural Projects
        const civilProjRes = await request('/api/projects?department=CIVIL');
        assert(civilProjRes.data.projects?.some(p => p.id === 'proj-civil-bim-seismic'), 'CIVIL query returns Seismic Analysis & Earthquake Resistant Design blueprint');

        // Test 2.6: Comprehensive 24-Section Guide Verification for Single Project
        console.log('\n--- 24-SECTION GUIDE AUDIT FOR: proj-distributed-kv-raft ---');
        const raftRes = await request('/api/projects/proj-distributed-kv-raft');
        assert(raftRes.status === 200 && raftRes.data.success, 'GET /api/projects/proj-distributed-kv-raft returns 200');
        const proj = raftRes.data.project;

        assert(Boolean(proj.title), '1. Project Title present: ' + proj.title);
        assert(Boolean(proj.overview), '2. Overview present');
        assert(Boolean(proj.problemStatement), '3. Problem Statement present');
        assert(Boolean(proj.whyBuild), '4. Why Build It present');
        assert(Boolean(proj.targetAudience), '5. Who It Is For present');
        assert(Boolean(proj.expectedResult), '6. Expected Result present');
        assert(Boolean(proj.difficulty) && Boolean(proj.duration), '7. Difficulty (' + proj.difficulty + ') & Duration (' + proj.duration + ') present');
        assert(Array.isArray(proj.prerequisites) && proj.prerequisites.length > 0, '8. Prerequisites list present (' + proj.prerequisites.length + ' items)');
        assert(proj.requiredSkills?.alreadyHave?.length > 0 && proj.requiredSkills?.needToLearn?.length > 0, '9. Required Skills breakdown (alreadyHave vs needToLearn) present');
        assert(Array.isArray(proj.techStack) && proj.techStack.length > 0, '10. Technology Stack present (' + proj.techStack.join(', ') + ')');
        assert(Array.isArray(proj.softwareRequirements) && proj.softwareRequirements.length > 0, '11. Software Requirements present');
        assert(Boolean(proj.systemArchitecture?.overview) && proj.systemArchitecture?.dataFlow?.length > 0, '12. System Architecture & Flow Diagram present');
        assert(Boolean(proj.folderStructure), '13. Folder Structure present');
        assert(Array.isArray(proj.databaseDesign?.tables) && proj.databaseDesign.tables.length > 0, '14. Database Design & Tables present');
        assert(Array.isArray(proj.apiDesign) && proj.apiDesign.length > 0, '15. API Design & Endpoints present (' + proj.apiDesign.length + ' endpoints)');
        assert(Array.isArray(proj.buildGuide) && proj.buildGuide.length >= 6, '16. Step-by-Step Build Guide present (' + proj.buildGuide.length + ' steps with starter code)');
        assert(Array.isArray(proj.testingGuide?.unit) && Array.isArray(proj.testingGuide?.integration), '17. Testing Guide (unit & integration) present');
        assert(Array.isArray(proj.commonErrors) && proj.commonErrors.length > 0, '18. Common Errors & Troubleshooting present');
        assert(Boolean(proj.demoGuide), '19. Project Demonstration Guide present');
        assert(Boolean(proj.resumeBullet), '20. Google XYZ Resume Bullet present: "' + proj.resumeBullet + '"');
        assert(Array.isArray(proj.interviewQuestions) && proj.interviewQuestions.length > 0, '21. Interview Questions & Model Answers present (' + proj.interviewQuestions.length + ' Q&As)');
        assert(Array.isArray(proj.extensions) && proj.extensions.length > 0, '22. Multi-Level Extensions (Level 2-4) present');
        assert(Array.isArray(proj.targetCareers) && proj.targetCareers.length > 0, '23. Target Careers Connection present');
        assert(Array.isArray(proj.connectedVideoDetails), '24. Connected Curriculum Videos linked');

        // Test 2.7: Student Project Progress Persistence
        const projProgRes = await request('/api/projects/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                userId: testUserId,
                projectId: 'proj-cse-raft-kv',
                status: 'Building',
                progressPct: 50,
                completedSteps: [1, 2, 3],
                notes: 'Successfully implemented leader election timer logic'
            }
        });
        assert(projProgRes.status === 200 && projProgRes.data.success, 'POST /api/projects/progress records student progress');

        const projProgGet = await request(`/api/projects/progress?userId=${encodeURIComponent(testUserId)}`);
        assert(projProgGet.data.progress?.some(p => p.project_id === 'proj-cse-raft-kv' && p.progress_pct === 50), 'GET /api/projects/progress retrieves verified student progress record');

        // Test 2.8: Admin Security Guard
        const unauthProj = await request('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { title: 'Hacked Project', overview: 'Should be rejected' }
        });
        assert(unauthProj.status === 403, 'Unauthorized student cannot add projects (HTTP 403)');

        const authProj = await request('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                adminEmail: 'rahulashokhlakkimsetty@gmail.com',
                title: 'Admin Verified Test Capstone',
                overview: 'Official faculty verified capstone project blueprint for testing.',
                category: 'Computing',
                departments: ['CSE', 'IT']
            }
        });
        assert(authProj.status === 201 && authProj.data.success, 'Authorized Platform Admin can create and publish projects (HTTP 201)');

        console.log('\n===============================================================');
        console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
        console.log('===============================================================');

        if (failed === 0) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (err) {
        console.error('Fatal test error:', err);
        process.exit(1);
    }
}

runTests();
