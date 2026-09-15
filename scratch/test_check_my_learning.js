const http = require('http');

async function testEndpoint(port, path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve) => {
        const payload = body ? JSON.stringify(body) : null;
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
                ...headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch(e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });
        req.on('error', err => resolve({ error: err.message }));
        if (payload) req.write(payload);
        req.end();
    });
}

async function run() {
    console.log('Testing Check My Learning Diagnostic Generator...');
    const qRes = await testEndpoint(8081, '/api/curriculum/check-my-learning', 'POST', {
        branch: 'ECE',
        semester: 1,
        subject: 'Basic Electrical Engineering',
        subjectId: 'ece-1-bee',
        unit: 'Unit 3: Single Phase Transformers',
        unitNumber: 3,
        topic: 'Transformer Operating Principle & EMF Equation'
    });
    console.log('Check My Learning Questions Status:', qRes.status, 'Mode:', qRes.data?.mode);
    console.log('Generated Questions count:', qRes.data?.questions?.length);
    if (qRes.data?.questions) {
        console.log('Q1 prompt:', qRes.data.questions[0]?.prompt?.slice(0, 80) + '...');
    }

    console.log('\nTesting Check My Learning Evaluation with Answers...');
    const evalRes = await testEndpoint(8081, '/api/curriculum/check-my-learning', 'POST', {
        branch: 'ECE',
        semester: 1,
        subject: 'Basic Electrical Engineering',
        subjectId: 'ece-1-bee',
        unit: 'Unit 3: Single Phase Transformers',
        unitNumber: 3,
        topic: 'Transformer Operating Principle & EMF Equation',
        answers: [
            { questionId: 'q1', answer: 'A transformer operates on mutual electromagnetic induction. A time-varying alternating flux in the core links both primary and secondary windings, inducing EMF according to Faraday law.' },
            { questionId: 'q2', answer: 'EMF equation is E = 4.44 * f * N * Phi_m where f is frequency in Hz, N is turns, and Phi_m is peak magnetic flux in Webers.' }
        ]
    });
    console.log('Check My Learning Evaluation Status:', evalRes.status, 'Mode:', evalRes.data?.mode);
    console.log('Overall Mastery:', evalRes.data?.assessment?.overall_mastery + '%');
    console.log('Concept Understanding:', evalRes.data?.assessment?.concept_understanding + '%');
    console.log('Notice:', evalRes.data?.notice);

    console.log('\nTesting Topic Progress Logging...');
    const progRes = await testEndpoint(8081, '/api/curriculum/topic-progress', 'POST', {
        userId: 'test_student_123',
        branch: 'ECE',
        semester: 1,
        subjectId: 'ece-1-bee',
        unitNumber: 3,
        topicName: 'Transformer Operating Principle & EMF Equation',
        status: 'completed'
    });
    console.log('Topic Progress status:', progRes.status, 'Logged status:', progRes.data?.progress?.status);

    console.log('\nTesting Curriculum Overall Progress Calculation...');
    const calcRes = await testEndpoint(8081, '/api/curriculum/progress?userId=test_student_123&branch=ECE&semester=1');
    console.log('Progress Calculation status:', calcRes.status);
    console.log('ECE Sem 1 Total Topics:', calcRes.data?.totalTopics, 'Completed:', calcRes.data?.completedTopics);
    console.log('BEE Subject Progress:', calcRes.data?.subjectProgress?.['ece-1-bee']);
}

run();
