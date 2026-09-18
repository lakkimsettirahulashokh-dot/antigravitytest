const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.resolve(ROOT, 'public');

console.log('[TechPath Build] Generating Vercel public distribution directory...');

if (!fs.existsSync(PUBLIC)) {
    fs.mkdirSync(PUBLIC, { recursive: true });
}

// 1. Copy static directories
const dirsToCopy = ['css', 'js', 'assets'];
for (const d of dirsToCopy) {
    const src = path.join(ROOT, d);
    const dest = path.join(PUBLIC, d);
    if (fs.existsSync(src)) {
        fs.cpSync(src, dest, { recursive: true });
        console.log(`  [OK] Synced directory: ${d}/`);
    }
}

// 2. Copy root files (HTML, favicon, manifest, etc.)
const rootFiles = fs.readdirSync(ROOT).filter(f => {
    return f.endsWith('.html') ||
           f === 'favicon.ico' ||
           f === 'manifest.json' ||
           f === 'robots.txt' ||
           f === 'sitemap.xml';
});

for (const file of rootFiles) {
    fs.copyFileSync(path.join(ROOT, file), path.join(PUBLIC, file));
}
console.log(`  [OK] Synced ${rootFiles.length} root HTML and asset files.`);

// 3. Generate static /api/config fallback for Vercel CDN
const apiDir = path.join(PUBLIC, 'api');
if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
}
const staticConfig = JSON.stringify({
    supabaseUrl: 'https://kkdqahqcochicfvkfyan.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZHFhaHFjb2NoaWNmdmtmeWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTMyNjEsImV4cCI6MjEwNDA4OTI2MX0.jMTz-nEpA-GfOqrGvYCC22gmZ7oiMe1e6Sf5z7GqDvc',
    appUrl: 'https://tech-path-six.vercel.app',
    isSupabaseConfigured: true,
    supportEmail: 'lakkimsettirahulashokh@gmail.com'
}, null, 2);
fs.writeFileSync(path.join(apiDir, 'config'), staticConfig, 'utf8');
fs.writeFileSync(path.join(apiDir, 'config.json'), staticConfig, 'utf8');
console.log('  [OK] Generated public/api/config static fallback.');

console.log('[TechPath Build] Complete! Public distribution directory ready for Vercel CDN.');
