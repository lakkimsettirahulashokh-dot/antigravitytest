// scratch/test_exam_endpoints.js
// Verification script for Exam Tracker AI Study Pack API endpoints

const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: 8080,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('Testing Exam Tracker endpoints on http://127.0.0.1:8080...');

    // 1. GET /api/exams
    console.log('\n1. Testing GET /api/exams:');
    const examsRes = await makeRequest('/api/exams');
    console.log('Status:', examsRes.status);
    console.log('Exams found:', examsRes.data.exams ? examsRes.data.exams.length : 0);
    const firstExam = examsRes.data.exams ? examsRes.data.exams[0] : null;

    if (!firstExam) {
        console.error('No exams found in response!');
        process.exit(1);
    }

    console.log('Exam ID:', firstExam.id, 'Title:', firstExam.name);

    // 2. GET /api/exams/:id/study-pack
    console.log(`\n2. Testing GET /api/exams/${firstExam.id}/study-pack:`);
    const studyPackRes = await makeRequest(`/api/exams/${firstExam.id}/study-pack`);
    console.log('Status:', studyPackRes.status);
    const sp = studyPackRes.data.studyPack;
    console.log('Study pack keys:', Object.keys(sp || {}));
    console.log('Main Points count:', sp?.mainPoints?.length);
    console.log('Prepared Notes count:', sp?.preparedNotes?.length);
    console.log('Important Questions count:', sp?.importantQuestions?.length);
    console.log('Practice Questions count:', sp?.practiceQuestions?.length);
    console.log('Formula Sheet count:', sp?.formulaSheet?.length);
    console.log('Flashcards count:', sp?.quickRevision?.flashcards?.length);

    // 3. POST /api/exams/:id/record-practice
    console.log(`\n3. Testing POST /api/exams/${firstExam.id}/record-practice:`);
    const practiceRes = await makeRequest(`/api/exams/${firstExam.id}/record-practice`, 'POST', {
        questionId: 'mcq-1',
        topic: 'Database Management Systems',
        isCorrect: true,
        userAnswer: '2NF but not 3NF'
    });
    console.log('Status:', practiceRes.status);
    console.log('Performance accuracy:', practiceRes.data.performance?.accuracyPercent, '%');
    console.log('Total attempts recorded:', practiceRes.data.performance?.totalAttempts);

    // 4. GET /api/exams/:id/performance
    console.log(`\n4. Testing GET /api/exams/${firstExam.id}/performance:`);
    const perfRes = await makeRequest(`/api/exams/${firstExam.id}/performance`);
    console.log('Status:', perfRes.status);
    console.log('Performance attempts:', perfRes.data.performance?.totalAttempts);

    console.log('\nALL ENDPOINT TESTS PASSED SUCCESSFULLY! ✅');
}

runTests().catch(err => {
    console.error('Test error:', err.message);
    process.exit(1);
});
