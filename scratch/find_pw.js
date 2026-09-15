const https = require('https');
const fs = require('fs');
const path = require('path');

const env = {};
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

function postJson(urlStr, data) {
    return new Promise((resolve, reject) => {
        const u = new URL(urlStr);
        const payload = JSON.stringify(data);
        const req = https.request(u, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(body); } catch(e) { parsed = body; }
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function findPw() {
    const email = 'lakkimsettirahulashokh@gmail.com';
    const passwords = [
        'Student@123',
        'Password@123',
        'TechPath@2026',
        'Rahul@123',
        'Rahul@12345',
        'Ashokh@123',
        'Ashokh@2026',
        'Admin@123',
        'Admin@2026',
        'Test@1234'
    ];

    for (const pw of passwords) {
        const res = await postJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { email, password: pw });
        if (res.status === 200 && res.data?.access_token) {
            console.log(`✅ FOUND CORRECT PASSWORD: "${pw}"`);
            return;
        } else {
            console.log(`  "${pw}": ${res.data?.msg || res.data?.error_description || res.status}`);
        }
    }
    console.log('None of the common passwords matched.');
}

findPw().catch(console.error);
