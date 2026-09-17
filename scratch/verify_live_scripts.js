const https = require('https');

const scripts = [
    '/js/seo-metadata.js',
    '/js/supabase.min.js',
    '/js/supabase-client.js',
    '/js/auth.js',
    '/js/db.js',
    '/js/hero-3d.js',
    '/js/btech-bg3d.js',
    '/js/motion.js',
    '/js/loading-system.js',
    '/js/cookie-consent.js',
    '/js/analytics.js',
    '/js/app.js',
    '/js/paradrop.js'
];

async function checkScripts() {
    for (const s of scripts) {
        await new Promise(resolve => {
            https.get('https://tech-path-six.vercel.app' + s, res => {
                let bytes = 0;
                res.on('data', c => bytes += c.length);
                res.on('end', () => {
                    console.log(`[${res.statusCode}] [${res.headers['content-type']}] [${bytes} bytes] ${s}`);
                    resolve();
                });
            }).on('error', e => {
                console.error(`[ERROR] ${s}:`, e.message);
                resolve();
            });
        });
    }
}

checkScripts();
