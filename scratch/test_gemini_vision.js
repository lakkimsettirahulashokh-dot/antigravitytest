require('dotenv').config();
const https = require('https');
const key = process.env.GEMINI_API_KEY;

// 1x1 transparent PNG base64 for test
const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const payload = JSON.stringify({
    contents: [{
        parts: [
            { text: 'Describe what you see in this image.' },
            { inlineData: { mimeType: 'image/png', data: samplePngBase64 } }
        ]
    }],
    generationConfig: { maxOutputTokens: 100 }
});

const req = https.request({
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: '/v1beta/models/gemini-3.6-flash:generateContent?key=' + key,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, resp => {
    let data = '';
    resp.on('data', c => data += c);
    resp.on('end', () => {
        try {
            const j = JSON.parse(data);
            console.log('Gemini Vision text:', j.candidates?.[0]?.content?.parts?.[0]?.text);
        } catch(e) { console.log('Error:', data); }
    });
});
req.write(payload);
req.end();
