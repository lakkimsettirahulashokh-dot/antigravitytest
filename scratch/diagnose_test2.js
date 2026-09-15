const http = require('http');
const fs = require('fs');

const sampleImgPath = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/9b69a063-24cd-4e1a-a928-16f7602527b3/.user_uploaded/media_1788764689512.jpg';
const imgBase64 = fs.readFileSync(sampleImgPath).toString('base64');

console.log('Sending Test 2 payload, image length:', imgBase64.length);
const startTime = Date.now();

const data = JSON.stringify({
    image: {
        data: imgBase64,
        mimeType: 'image/jpeg',
        name: 'circuit_diagram_exam.jpg',
        size: imgBase64.length
    },
    mode: 'detailed',
    branch: 'CSE',
    userEmail: 'alex.rivera@btechpath.ai'
});

const req = http.request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/ai/doubt',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(`Elapsed: ${Date.now() - startTime}ms`);
        console.log(`Status: ${res.statusCode}`);
        console.log('Body:', body.slice(0, 300));
    });
});

req.on('error', err => console.error('Net error:', err.message));
req.write(data);
req.end();
