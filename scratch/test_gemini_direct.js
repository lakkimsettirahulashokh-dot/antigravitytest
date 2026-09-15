const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
let geminiKey = '';
lines.forEach(l => {
  if (l.startsWith('GEMINI_API_KEY=')) {
    geminiKey = l.split('=')[1].trim().replace(/['"]/g, '');
  }
});

console.log('Gemini Key prefix:', geminiKey ? geminiKey.slice(0, 10) : 'none');

async function testModel(model) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: 'Hello, reply with single word "OK"' }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const start = Date.now();
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          model,
          time: Date.now() - start,
          statusCode: res.statusCode,
          body: data.slice(0, 200)
        });
      });
    });

    req.on('error', (err) => resolve({ model, error: err.message }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ model, error: 'Timeout 8s' });
    });
    req.write(payload);
    req.end();
  });
}

async function run() {
  const models = ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
  for (const m of models) {
    console.log(`Testing ${m}...`);
    const res = await testModel(m);
    console.log(`Result for ${m}:`, res);
  }
}

run();
