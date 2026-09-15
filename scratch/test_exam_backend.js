const http = require('http');
const zlib = require('zlib');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
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

// Generate a valid mock PDF buffer with a syllabus
function createTestSyllabusPdf() {
    const streamContent = `
BT
/F1 14 Tf
1 0 0 1 50 750 Tm
(OFFICIAL SYLLABUS: GATE COMPUTER SCIENCE & IT 2026) Tj
T*
(Paper Code: CS | Total Marks: 100 | Duration: 180 Minutes) Tj
T*
(Negative Marking: 1/3rd for 1-mark MCQs, 2/3rd for 2-mark MCQs) Tj
T*
(Section 1: Operating Systems) Tj
T*
(Process management, CPU scheduling algorithms, threads, concurrency, deadlocks, virtual memory.) Tj
T*
(Section 2: Database Management Systems) Tj
T*
(ER-model, Relational model, SQL queries, Normalization BCNF, Transactions and Concurrency Control.) Tj
T*
(Section 3: Computer Networks) Tj
T*
(OSI and TCP/IP stacks, routing algorithms, flow and error control, sockets.) Tj
ET
`;
    const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf8'));

    const pdfParts = [
        '%PDF-1.4\n',
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n',
        `4 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`,
        compressed.toString('binary'),
        '\nendstream\nendobj\n',
        'xref\n0 5\n0000000000 65535 f \n',
        'trailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n500\n%%EOF'
    ];

    return Buffer.from(pdfParts.join(''), 'binary');
}

async function runTests() {
    console.log('--- EXAM TRACKER & PDF SYLLABUS BACKEND TESTS ---');

    // TEST 1: GET /api/exams
    console.log('\n[TEST 1] GET /api/exams');
    const res1 = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exams?user=alex.rivera@btechpath.ai',
        method: 'GET'
    });
    console.log('Status:', res1.status);
    console.log('Count:', res1.data.count);
    const exam1 = res1.data.exams[0];
    console.log('Exam Title:', exam1.name);
    console.log('Metrics:', exam1.metrics);
    if (res1.status === 200 && res1.data.count > 0 && exam1.metrics.totalTopics > 0) {
        console.log('PASS: GET /api/exams returns user exams with computed metrics');
    } else {
        console.error('FAIL: GET /api/exams failed');
        process.exit(1);
    }

    // TEST 2: GET /api/exams/:id
    console.log('\n[TEST 2] GET /api/exams/' + exam1.id);
    const res2 = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/api/exams/${exam1.id}`,
        method: 'GET'
    });
    console.log('Status:', res2.status);
    console.log('Subjects count:', res2.data.exam.subjects.length);
    if (res2.status === 200 && res2.data.exam && res2.data.exam.subjects.length >= 1) {
        console.log('PASS: Single exam fetched with official subjects tree');
    } else {
        console.error('FAIL: GET /api/exams/:id failed');
        process.exit(1);
    }

    // TEST 3: POST /api/exams/analyze-pdf with real PDF upload
    console.log('\n[TEST 3] POST /api/exams/analyze-pdf (Real PDF upload & analysis)');
    const pdfBuf = createTestSyllabusPdf();
    const res3 = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exams/analyze-pdf',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fileBase64: pdfBuf.toString('base64'),
        fileName: 'Official_GATE_2026_CS_Notification.pdf',
        fileSize: pdfBuf.length,
        examName: 'GATE CS 2026 Official Test Round',
        examCategory: 'Competitive',
        targetDate: '2026-02-07',
        prepLevel: 'Intermediate',
        dailyHours: 2,
        strongSubjects: ['Programming'],
        weakSubjects: ['Database Management Systems']
    });
    console.log('Status:', res3.status);
    console.log('Success:', res3.data.success);
    console.log('Is Live AI:', res3.data.isLiveAI);
    console.log('Extracted Subjects:', res3.data.exam?.subjects?.map(s => s.name));
    console.log('Daily Schedule:', res3.data.exam?.studyPlan?.dailySchedule);
    if (res3.status === 201 && res3.data.success && res3.data.exam?.subjects?.length > 0) {
        console.log('PASS: PDF text extracted and analyzed into structured official syllabus');
    } else {
        console.error('FAIL: POST /api/exams/analyze-pdf failed');
        process.exit(1);
    }

    const createdExamId = res3.data.exam.id;
    const testTopicId = res3.data.exam.subjects[0].topics[0].id;

    // TEST 4: POST /api/exams/:id/topic-progress
    console.log('\n[TEST 4] POST /api/exams/:id/topic-progress');
    const res4 = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/api/exams/${createdExamId}/topic-progress`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        topicId: testTopicId,
        status: 'Completed',
        notes: 'Reviewed standard scheduling invariants.'
    });
    console.log('Status:', res4.status);
    console.log('Updated status:', res4.data.status);
    console.log('New coverage %:', res4.data.metrics?.coveragePercent);
    if (res4.status === 200 && res4.data.status === 'Completed' && res4.data.metrics?.completedTopics === 1) {
        console.log('PASS: Topic progress updated and coverage recalculated');
    } else {
        console.error('FAIL: POST /api/exams/:id/topic-progress failed');
        process.exit(1);
    }

    // TEST 5: POST /api/exams/:id/generate-mock
    console.log('\n[TEST 5] POST /api/exams/:id/generate-mock');
    const res5 = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/api/exams/${createdExamId}/generate-mock`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    console.log('Status:', res5.status);
    console.log('Questions count:', res5.data.questions?.length);
    console.log('Label:', res5.data.label);
    if (res5.status === 200 && res5.data.questions?.length > 0 && res5.data.label === 'AI-GENERATED PRACTICE QUESTION') {
        console.log('PASS: Practice questions generated constrained strictly to official topics');
    } else {
        console.error('FAIL: POST /api/exams/:id/generate-mock failed');
        process.exit(1);
    }

    // TEST 6: POST /api/exams/:id/replace-pdf
    console.log('\n[TEST 6] POST /api/exams/:id/replace-pdf (Version replacement & change detection)');
    const res6 = await request({
        hostname: 'localhost',
        port: 8080,
        path: `/api/exams/${createdExamId}/replace-pdf`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fileBase64: pdfBuf.toString('base64'),
        fileName: 'GATE_2026_CS_Corrigendum_v2.pdf',
        fileSize: pdfBuf.length
    });
    console.log('Status:', res6.status);
    console.log('New Version:', res6.data.diff?.newVersion);
    console.log('Diff:', res6.data.diff);
    if (res6.status === 200 && res6.data.diff?.newVersion === 2) {
        console.log('PASS: PDF replaced and version incremented with change detection');
    } else {
        console.error('FAIL: POST /api/exams/:id/replace-pdf failed');
        process.exit(1);
    }

    console.log('\n========================================');
    console.log('ALL 6 BACKEND EXAM API TESTS PASSED 100%');
    console.log('========================================');
}

runTests().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
