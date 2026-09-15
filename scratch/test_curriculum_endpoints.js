const http = require('http');

async function testEndpoint(port, path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve) => {
        const payload = body ? JSON.stringify(body) : null;
        const req = http.request({
            hostname: '127.0.0.1',
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
    // Check 8081 first (our updated daemon)
    console.log('Testing port 8081 (our active server with latest curriculum routes)...');
    
    // 1. Universities
    const r1 = await testEndpoint(8081, '/api/curriculum/universities');
    console.log('1. Universities status:', r1.status, 'Count:', r1.data?.count);

    // 2. ECE Sem 1 Subjects
    const r2 = await testEndpoint(8081, '/api/curriculum/subjects?branch=ECE&semester=1');
    console.log('2. ECE Sem 1 Subjects status:', r2.status, 'Subjects:', (r2.data?.subjects || []).map(s => s.shortName));

    // 3. ECE Sem 1 BEE Unit 3 Topic details
    const r3 = await testEndpoint(8081, '/api/curriculum/topic?branch=ECE&semester=1&subjectId=ece-1-bee&unitNumber=3&topicName=Transformer');
    console.log('3. Transformer Topic status:', r3.status, 'Topic name:', r3.data?.topic?.name, 'Videos:', r3.data?.topic?.videos?.length);

    // 4. CSE Sem 4 Subjects
    const r4 = await testEndpoint(8081, '/api/curriculum/subjects?branch=CSE&semester=4');
    console.log('4. CSE Sem 4 Subjects status:', r4.status, 'Subjects:', (r4.data?.subjects || []).map(s => s.shortName));

    // 5. Course PDF redirect
    const r5 = await testEndpoint(8081, '/course-pdf');
    console.log('5. GET /course-pdf status (expected 302):', r5.status);
}

run();
