const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const ignoreDirs = new Set(['.git', 'node_modules', '.gemini', 'scratch', 'tools']);
const validExtensions = new Set(['.html', '.js', '.json', '.md', '.env', '.txt', '.css', '.sql']);

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

const searchTerms = [
    'gamil.com',
    'lakkimsetti',
    'rahulashok',
    'support@',
    'contact@',
    'grievance',
    'help@',
    'privacy@',
    'legal@',
    'btechpath.ai'
];

const found = [];

files.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            for (const term of searchTerms) {
                if (line.toLowerCase().includes(term)) {
                    found.push({
                        file: path.relative(rootDir, filePath).replace(/\\/g, '/'),
                        line: index + 1,
                        term,
                        text: line.trim()
                    });
                    break;
                }
            }
        });
    } catch (e) {}
});

console.log(JSON.stringify(found, null, 2));
console.log(`Total occurrences found: ${found.length}`);
