const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const ignoreDirs = new Set(['.git', 'node_modules', '.gemini', 'scratch', 'tools']);
const validExtensions = new Set(['.html', '.js', '.json', '.md', '.env', '.txt', '.css']);

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (ignoreDirs.has(f)) continue;
        const fullPath = path.join(dir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath, fileList);
        } else {
            const ext = path.extname(f).toLowerCase();
            if (validExtensions.has(ext) || f === '.env') {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

const files = walk(rootDir);

const gamilMatches = [];
const ashokhMatches = [];
const genericSupportMatches = [];
const correctMatches = [];

files.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');

        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const l = line.trim();

            if (/gamil\.com/i.test(l)) {
                gamilMatches.push({ file: rel, line: lineNum, text: l });
            }

            if (/lakkimsettirahulashokh@/i.test(l)) {
                ashokhMatches.push({ file: rel, line: lineNum, text: l });
            }

            if (/(support|contact|grievance|privacy|help|legal)@(btechpath|techpath)/i.test(l)) {
                genericSupportMatches.push({ file: rel, line: lineNum, text: l });
            }

            if (/lakkimsettirahulashok@gmail\.com/i.test(l)) {
                correctMatches.push({ file: rel, line: lineNum, text: l });
            }
        });
    } catch (e) {}
});

console.log('=== 1. GAMIL.COM TYPOS ===');
console.log(JSON.stringify(gamilMatches, null, 2));

console.log('\n=== 2. LAKKIMSETTIRAHULASHOKH (EXTRA H) ===');
console.log(JSON.stringify(ashokhMatches, null, 2));

console.log('\n=== 3. GENERIC TECHPATH / BTECHPATH EMAILS ===');
console.log(JSON.stringify(genericSupportMatches, null, 2));

console.log(`\n=== 4. CURRENT CORRECT OCCURRENCES COUNT: ${correctMatches.length} ===`);
