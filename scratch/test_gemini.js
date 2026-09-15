require('dotenv').config();
const https = require('https');
const key = process.env.GEMINI_API_KEY;

const payload = JSON.stringify({
    contents: [{ parts: [{ text: 'Return a strict raw JSON object with title and 2 topics: {"title": "Distributed Systems", "topics": ["Consensus", "Replication"]}. Output JSON only.' }] }],
    generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 2048
    }
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
            const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('Gemini output text:', text);
            console.log('Parsed successfully:', JSON.parse(text));
        } catch(e) { console.log('Error:', data); }
    });
});
req.write(payload);
req.end();
