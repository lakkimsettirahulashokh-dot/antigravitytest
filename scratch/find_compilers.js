const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Probing Environment PATH ===');
const envPath = (process.env.PATH || '').split(';').filter(Boolean);
console.log('PATH entries:', envPath.length);

const targets = ['gcc.exe', 'g++.exe', 'clang.exe', 'clang++.exe', 'javac.exe', 'java.exe'];
const foundInPath = {};

for (const p of envPath) {
    for (const t of targets) {
        const full = path.join(p, t);
        try {
            if (fs.existsSync(full)) {
                foundInPath[t] = full;
                console.log(`[FOUND IN PATH] ${t} -> ${full}`);
            }
        } catch (e) {}
    }
}

console.log('\n=== Probing Common Install Locations on Windows ===');
const searchRoots = [
    'C:\\MinGW',
    'C:\\msys64',
    'C:\\TDM-GCC-64',
    'C:\\Program Files\\Java',
    'C:\\Program Files (x86)\\Java',
    'C:\\Program Files\\LLVM',
    'C:\\Program Files\\Git\\usr\\bin',
    'C:\\Users\\LENOVO\\AppData\\Local\\Programs',
    'C:\\Users\\LENOVO\\.jdks',
    'C:\\Users\\LENOVO\\.vscode\\extensions',
    'C:\\Users\\LENOVO\\scoop',
    'C:\\ProgramData\\chocolatey\\bin'
];

function scanDir(dir, depth = 0, maxDepth = 4) {
    if (depth > maxDepth || !fs.existsSync(dir)) return [];
    const results = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isFile()) {
                const lower = entry.name.toLowerCase();
                if (targets.includes(lower)) {
                    results.push({ name: lower, fullPath });
                }
            } else if (entry.isDirectory()) {
                results.push(...scanDir(fullPath, depth + 1, maxDepth));
            }
        }
    } catch (e) {}
    return results;
}

for (const root of searchRoots) {
    if (fs.existsSync(root)) {
        console.log(`Scanning: ${root}`);
        const found = scanDir(root, 0, 4);
        found.forEach(f => console.log(`  -> [FOUND] ${f.name} at ${f.fullPath}`));
    }
}

// Check Windows registry or system environment
console.log('\n=== Checking Node and Python ===');
console.log('Node:', process.execPath);
try {
    console.log('Python:', execSync('python --version', { stdio: 'pipe' }).toString().trim());
} catch(e) {
    console.log('Python not found directly');
}
