const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const ignoreDirs = new Set(['.git', 'node_modules', '.gemini', 'scratch']);

const patterns = [
    /gamil\.com/i,
    /lakkimsetti/i,
    /rahulashok/i,
    /support@/i,
    /contact@/i,
    /grievance/i,
    /help@/i,
    /info@/i,
    /admin@/i
];

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (ignoreDirs.has(f)) continue;
        const fullPath = path.join(dir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allFiles = walk(rootDir);
console.log(`Scanning ${allFiles.length} files...`);

const results = [];

for (const file of allFiles) {
    // Only check text files
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.ico', '.pdf', '.woff', '.woff2', '.ttf', '.mp4'].includes(ext)) continue;
    
    try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            for (const p of patterns) {
                if (p.test(line)) {
                    results.push({
                        file: path.relative(rootDir, file),
                        lineNum: idx + 1,
                        match: line.trim()
                    });
                    break;
                }
            }
        });
    } catch (e) {}
}

console.log(`Found ${results.length} matching lines:`);
results.forEach(r => {
    console.log(`${r.file}:${r.lineNum} -> ${r.match}`);
});
