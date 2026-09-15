const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env
const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envText.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
});

const SUPABASE_URL = env.SUPABASE_URL || 'https://kkdqahqcochicfvkfyan.supabase.co';
const ANON_KEY = env.SUPABASE_ANON_KEY;

function makeRequest(urlStr, options = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(urlStr);
        const reqOpts = {
            hostname: u.hostname,
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                ...(options.headers || {})
            }
        };

        const req = https.request(reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, headers: res.headers, body: data });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runAudit() {
    console.log('--- 1. AUDITING /auth/v1/settings ---');
    try {
        const settingsRes = await makeRequest(`${SUPABASE_URL}/auth/v1/settings`);
        console.log('Status:', settingsRes.status);
        console.log('Settings Data:', JSON.stringify(settingsRes.body, null, 2));
    } catch (e) {
        console.error('Settings check error:', e.message);
    }

    console.log('\n--- 2. AUDITING /auth/v1/authorize?provider=google ---');
    try {
        const authRes = await makeRequest(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=http://localhost:8080/auth-callback.html`);
        console.log('Status:', authRes.status);
        console.log('Authorize Response:', JSON.stringify(authRes.body, null, 2));
    } catch (e) {
        console.error('Authorize check error:', e.message);
    }
}

runAudit();
