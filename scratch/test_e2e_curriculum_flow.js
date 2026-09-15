const http = require('http');

const PORT = 8081;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', err => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting End-to-End Curriculum & Learning System Tests ---');
  let passed = 0;
  let failed = 0;

  // 1. Check /course-pdf 302 redirect
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/course-pdf',
      method: 'GET'
    });
    if (res.statusCode === 302 && res.headers.location === '/ai-notes.html') {
      console.log('✅ Test 1 Passed: /course-pdf redirects 302 to /ai-notes.html');
      passed++;
    } else {
      console.error(`❌ Test 1 Failed: Status ${res.statusCode}, Location: ${res.headers.location}`);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 1 Error:', e.message);
    failed++;
  }

  // 2. Universities endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/curriculum/universities',
      method: 'GET'
    });
    const data = JSON.parse(res.body);
    if (data.success && data.universities.length >= 6) {
      console.log(`✅ Test 2 Passed: Universities retrieved (${data.universities.length} universities)`);
      passed++;
    } else {
      console.error('❌ Test 2 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 2 Error:', e.message);
    failed++;
  }

  // 3. Branches endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/curriculum/branches',
      method: 'GET'
    });
    const data = JSON.parse(res.body);
    if (data.success && data.branches.length >= 10) {
      console.log(`✅ Test 3 Passed: Branches retrieved (${data.branches.length} branches)`);
      passed++;
    } else {
      console.error('❌ Test 3 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 3 Error:', e.message);
    failed++;
  }

  // 4. Subjects for ECE, Semester 1
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/curriculum/subjects?branch=ECE&semester=1&university=jntuh&regulation=R22',
      method: 'GET'
    });
    const data = JSON.parse(res.body);
    const hasBEE = data.subjects.some(s => s.code.includes('EE101') || s.id === 'ece-1-bee');
    if (data.success && hasBEE) {
      console.log(`✅ Test 4 Passed: ECE Sem 1 subjects retrieved, includes BEE (${data.subjects[0].code})`);
      passed++;
    } else {
      console.error('❌ Test 4 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 4 Error:', e.message);
    failed++;
  }

  // 5. Subject Deep Dive for EE101 / ece-1-bee
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/curriculum/subject/ece-1-bee?branch=ECE&semester=1',
      method: 'GET'
    });
    const data = JSON.parse(res.body);
    if (data.success && data.subject.units.length === 5) {
      console.log(`✅ Test 5 Passed: Subject ece-1-bee loaded with all 5 units`);
      passed++;
    } else {
      console.error('❌ Test 5 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 5 Error:', e.message);
    failed++;
  }

  // 6. Topic details with verified educational videos
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/curriculum/topic?branch=ECE&semester=1&subjectId=ece-1-bee&unitNumber=3&topicName=' + encodeURIComponent('Transformer Operating Principle & EMF Equation'),
      method: 'GET'
    });
    const data = JSON.parse(res.body);
    if (data.success && data.topic && data.topic.videos && data.topic.videos.length > 0) {
      console.log(`✅ Test 6 Passed: Topic details retrieved with verified video (${data.topic.videos[0].channel}, ID: ${data.topic.videos[0].youtubeId})`);
      passed++;
    } else {
      console.error('❌ Test 6 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 6 Error:', e.message);
    failed++;
  }

  // 7. Topic Progress recording
  try {
    const postPayload = {
      userId: 'test-student-e2e',
      branch: 'ECE',
      semester: 1,
      subjectId: 'ece-1-bee',
      unitNumber: 3,
      topicName: 'Transformer Operating Principle & EMF Equation',
      status: 'completed'
    };
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/curriculum/topic-progress',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, postPayload);
    const data = JSON.parse(res.body);
    if (data.success && data.progress.status === 'completed') {
      console.log(`✅ Test 7 Passed: Topic progress recorded as completed for ece-1-bee Unit 3`);
      passed++;
    } else {
      console.error('❌ Test 7 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 7 Error:', e.message);
    failed++;
  }

  // 8. Fetch overall progress
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/curriculum/progress?userId=test-student-e2e&branch=ECE&semester=1',
      method: 'GET'
    });
    const data = JSON.parse(res.body);
    if (data.success && data.subjectProgress && data.subjectProgress['ece-1-bee']) {
      const p = data.subjectProgress['ece-1-bee'];
      console.log(`✅ Test 8 Passed: Student progress fetched successfully. BEE Progress: ${p.completedTopics}/${p.totalTopics} (${p.progressPercent}%), Semester overall: ${data.semesterProgressPercent}%`);
      passed++;
    } else {
      console.error('❌ Test 8 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 8 Error:', e.message);
    failed++;
  }

  console.log(`\n================================`);
  console.log(`E2E Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`================================`);
  if (failed > 0) process.exit(1);
}

runTests();
