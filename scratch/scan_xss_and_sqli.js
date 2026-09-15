const fs = require('fs');
const path = require('path');

console.log('--- SCANNING FOR UNESCAPED USER INPUT IN FRONTEND ---');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const jsFiles = fs.readdirSync('js').map(f => path.join('js', f)).filter(f => f.endsWith('.js'));
const allFiles = [...files, ...jsFiles];

let flagged = 0;
allFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((l, i) => {
            if (l.includes('.innerHTML =') && !l.includes('escapeHtml') && !l.includes('sanitizeHtml')) {
                if (l.includes('user.') || l.includes('profile.') || l.includes('input') || l.includes('search') || l.includes('q') || l.includes('comment')) {
                    console.log(`[XSS POTENTIAL] ${file}:${i+1}: ${l.trim().slice(0, 100)}`);
                    flagged++;
                }
            }
        });
    } catch (e) {}
});

console.log(`\nScan finished: ${flagged} potential XSS injection locations found.`);
