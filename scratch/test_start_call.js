const http = require('http');

async function testStart() {
    console.log('Sending start request...');
    const payload = JSON.stringify({
        userId: 'candidate_test',
        resume: {
            personal: { name: 'Test Candidate' },
            education: [{ degree: 'B.Tech', department: 'CSE', college: 'JNTU' }],
            allSkillsList: ['Node.js', 'PostgreSQL', 'Redis'],
            projects: [{ name: 'Test Project', technologies: ['Node.js', 'PostgreSQL'] }]
        },
        targetRole: 'Full Stack Engineer',
        department: 'CSE',
        difficulty: 'Intermediate',
        interviewType: 'Technical + Resume Based',
        questionCount: 3
    });

    const req = http.request({
        hostname: '127.0.0.1',
        port: 8080,
        path: '/api/ai/mock-interview/start',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => console.log('Response:', res.statusCode, d.slice(0, 300)));
    });
    req.on('error', e => console.error('Error:', e.message));
    req.write(payload);
    req.end();
}

testStart();
