const https = require('https');
const fs = require('fs');
const path = require('path');

const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envText.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
});

const SUPABASE_URL = env.SUPABASE_URL;
const ANON_KEY = env.SUPABASE_ANON_KEY;

async function checkProvider() {
    const authorizeUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=http://localhost:8080/auth-callback.html`;
    
    console.log('Testing fetch to:', authorizeUrl);
    const res = await fetch(authorizeUrl, {
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`
        },
        redirect: 'manual'
    });

    console.log('Status:', res.status);
    console.log('Headers location:', res.headers.get('location'));
    const text = await res.text();
    console.log('Body:', text);
}

checkProvider();
