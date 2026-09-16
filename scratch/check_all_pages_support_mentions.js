const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const supportResults = [];

htmlFiles.forEach(file => {
    const fullPath = path.join(rootDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const l = line.trim();
        // check for email, contact, support mentions with @ or mailto or support text
        if (l.includes('mailto:') || /support@/i.test(l) || /contact@/i.test(l) || /help@/i.test(l) || /grievance/i.test(l) || /lakkimsetti/i.test(l) || /rahulashok/i.test(l)) {
            supportResults.push({
                file,
                line: lineNum,
                text: l
            });
        }
    });
});

console.log(`Found ${supportResults.length} lines:`);
supportResults.forEach(r => {
    console.log(`${r.file}:${r.line} -> ${r.text}`);
});
