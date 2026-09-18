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
console.log('[TechPath Build] Complete! Public distribution directory ready for Vercel CDN.');
