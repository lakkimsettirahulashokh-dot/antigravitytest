require('dotenv').config();
const https = require('https');

async function testOpenRouter() {
    const key = process.env.OPENROUTER_API_KEY;
    console.log('OpenRouter Key present:', Boolean(key), key ? key.substring(0, 10) + '...' : '');
    const models = [
        'openrouter/free',
        'nvidia/nemotron-3.5-lightning:free',
        'minimax/minimax-m2.7:free',
        'liquid/lfm-2.5-2.6b:free',
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free'
    ];
    for (const m of models) {
        try {
            console.log('Testing OpenRouter model:', m);
            const res = await new Promise((resolve) => {
                const payload = JSON.stringify({
                    model: m,
                    messages: [{ role: 'user', content: 'Say hello in 3 words' }]
                });
                const req = https.request({
                    hostname: 'openrouter.ai',
                    port: 443,
                    path: '/api/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:8080',
                        'X-Title': 'BTechPath AI OS',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                }, (r) => {
                    let d = '';
                    r.on('data', c => d += c);
                    r.on('end', () => resolve({ code: r.statusCode, data: d }));
                });
                req.on('error', e => resolve({ err: e.message }));
                req.setTimeout(8000, () => { req.destroy(); resolve({ timeout: true }); });
                req.write(payload);
                req.end();
            });
            console.log(`Model ${m} result:`, res.code ? `HTTP ${res.code}: ${res.data.slice(0, 150)}` : JSON.stringify(res));
        } catch (e) {
            console.error('Error on', m, e.message);
        }
    }
}

testOpenRouter().then(() => console.log('Done test.'));
