const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ statusCode: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
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

async function run() {
  console.log('=================================================');
  console.log('LEARNHUB VIDEO PERSONALIZATION VERIFICATION (NODE)');
  console.log('=================================================');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
    }
  }

  // 1. CSE Sem 4
  await test('CSE Sem 4 Query Returns Correct Curated Subjects & Common Videos', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos?department=CSE&semester=4',
      method: 'GET'
    });
    if (res.statusCode !== 200 || !res.data.success) throw new Error(`Status ${res.statusCode}`);
    const subjects = res.data.videos.map(v => v.subject);
    if (!subjects.includes('Operating Systems')) throw new Error('Missing Operating Systems');
    if (!subjects.includes('Database Management Systems')) throw new Error('Missing DBMS');
    if (!subjects.includes('Computer Networks')) throw new Error('Missing Computer Networks');
    if (subjects.includes('Applied Thermodynamics')) throw new Error('Leaked MECH into CSE!');
    if (subjects.includes('Structural Engineering')) throw new Error('Leaked CIVIL into CSE!');
  });

  // 2. ECE Sem 4
  await test('ECE Sem 4 Query Returns Digital Electronics & Microprocessors (No CSE Leaks)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos?department=ECE&semester=4',
      method: 'GET'
    });
    if (res.statusCode !== 200 || !res.data.success) throw new Error(`Status ${res.statusCode}`);
    const subjects = res.data.videos.map(v => v.subject);
    if (!subjects.includes('Digital Electronics')) throw new Error('Missing Digital Electronics');
    if (!subjects.includes('Microprocessors & Microcontrollers')) throw new Error('Missing Microprocessors');
    if (subjects.includes('Operating Systems')) throw new Error('Leaked CSE Operating Systems into ECE!');
  });

  // 3. MECH Sem 5
  await test('MECH Sem 5 Query Returns Machine Design & Thermodynamics', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos?department=MECH&semester=5',
      method: 'GET'
    });
    if (res.statusCode !== 200 || !res.data.success) throw new Error(`Status ${res.statusCode}`);
    const subjects = res.data.videos.map(v => v.subject);
    if (!subjects.includes('Machine Design')) throw new Error('Missing Machine Design');
    if (!subjects.includes('Applied Thermodynamics')) throw new Error('Missing Thermodynamics');
    if (subjects.includes('Operating Systems')) throw new Error('Leaked CSE into MECH!');
  });

  // 4. CIVIL Sem 6
  await test('CIVIL Sem 6 Query Returns Structural Engineering (No CSE Leaks)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos?department=CIVIL&semester=6',
      method: 'GET'
    });
    if (res.statusCode !== 200 || !res.data.success) throw new Error(`Status ${res.statusCode}`);
    const subjects = res.data.videos.map(v => v.subject);
    if (!subjects.includes('Structural Engineering')) throw new Error('Missing Structural Engineering');
    if (subjects.includes('Operating Systems')) throw new Error('Leaked CSE into CIVIL!');
  });

  // 5. COMMON Engineering Skills (Universally present)
  await test('COMMON Videos (Interview Preparation, Resume) are Present in Both CSE and CIVIL', async () => {
    const cse = await request({ hostname: '127.0.0.1', port: 8080, path: '/api/videos?department=CSE&semester=4', method: 'GET' });
    const civil = await request({ hostname: '127.0.0.1', port: 8080, path: '/api/videos?department=CIVIL&semester=6', method: 'GET' });
    const cseCommon = cse.data.videos.some(v => v.title.includes('Interview') || v.title.includes('Resume'));
    const civilCommon = civil.data.videos.some(v => v.title.includes('Interview') || v.title.includes('Resume'));
    if (!cseCommon || !civilCommon) throw new Error('Common interview/resume prep missing from either CSE or CIVIL');
  });

  // 6. Scoped Search
  await test('Scoped Search within Department & Semester', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos?department=CSE&semester=4&search=normalization',
      method: 'GET'
    });
    if (res.data.videos.length !== 1 || res.data.videos[0].subject !== 'Database Management Systems') {
      throw new Error(`Unexpected search result count: ${res.data.videos.length}`);
    }
  });

  // 7. Security Guard (403 for unauthorized requests)
  await test('Security Guard: Non-Admin receives 403 on POST /api/videos', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': 'unauthorized_student@gmail.com'
      }
    }, { title: 'Test Injection' });
    if (res.statusCode !== 403) throw new Error(`Expected 403, got ${res.statusCode}`);
  });

  // 8. Admin Video Lifecycle (Create, Update, Delete)
  await test('Admin Video CRUD Lifecycle', async () => {
    const adminEmail = 'rahulashokhlakkimsetty@gmail.com';
    const testVideo = {
      title: 'E2E Test Electrical Machines Analysis',
      description: 'Synchronous motor excitation curves',
      video_url: 'https://www.youtube.com/watch?v=e2eTest555',
      provider: 'YouTube',
      subject: 'Electrical Machinery',
      topic: 'V-Curves & Inverted V-Curves',
      unit: 2,
      instructor: 'Dr. Test Faculty',
      duration: '45:00',
      difficulty_level: 'Intermediate',
      departments: ['EEE'],
      semesters: [4],
      is_published: true
    };

    // Create
    const createRes = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail
      }
    }, testVideo);
    if (createRes.statusCode !== 201 || !createRes.data.success) {
      throw new Error(`Create failed: ${createRes.statusCode}`);
    }
    const createdId = createRes.data.video.id;

    // Verify presence in EEE Sem 4
    const verifyRes = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos?department=EEE&semester=4',
      method: 'GET'
    });
    const found = verifyRes.data.videos.find(v => v.id === createdId);
    if (!found) throw new Error('Created video not found in EEE Sem 4 query');

    // Toggle publish to false
    const putRes = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: `/api/videos/${createdId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail
      }
    }, { is_published: false });
    if (putRes.statusCode !== 200) throw new Error(`Update failed: ${putRes.statusCode}`);

    // Verify unpublished not visible in standard query
    const verifyUnpublished = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos?department=EEE&semester=4',
      method: 'GET'
    });
    if (verifyUnpublished.data.videos.some(v => v.id === createdId)) {
      throw new Error('Unpublished video was returned in public query');
    }

    // Clean up: delete
    const delRes = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: `/api/videos/${createdId}`,
      method: 'DELETE',
      headers: { 'x-admin-email': adminEmail }
    });
    if (delRes.statusCode !== 200) throw new Error(`Delete failed: ${delRes.statusCode}`);
  });

  // 9. User Progress Upsert & Fetch
  await test('User Video Progress Tracking and Feed', async () => {
    const studentId = 'e2e_student_test_101';
    const progressData = {
      userId: studentId,
      videoId: 'vid-cse4-os-process',
      positionSeconds: 1250,
      durationSeconds: 2700,
      isCompleted: false
    };

    const postRes = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/videos/progress',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, progressData);
    if (postRes.statusCode !== 200) throw new Error(`Progress save failed: ${postRes.statusCode}`);

    const getRes = await request({
      hostname: '127.0.0.1',
      port: 8080,
      path: `/api/videos/progress?userId=${studentId}`,
      method: 'GET'
    });
    if (getRes.statusCode !== 200 || !getRes.data.success) throw new Error(`Progress fetch failed`);
    const rec = getRes.data.progress.find(p => p.video_id === 'vid-cse4-os-process');
    if (!rec) throw new Error('Progress record not found');
    const pos = rec.last_position_seconds || rec.progress_seconds;
    if (pos !== 1250) {
      throw new Error(`Progress mismatch: ${JSON.stringify(rec)}`);
    }
  });

  console.log('=================================================');
  console.log(`RESULTS: ${passed} / ${total} Tests Passed`);
  console.log('=================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch(e => {
  console.error('Test runner fatal:', e);
  process.exit(1);
});
