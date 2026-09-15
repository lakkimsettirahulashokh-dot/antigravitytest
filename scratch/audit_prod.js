const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const scanExtensions = ['.html', '.js', '.json', '.css'];
const ignoredDirs = ['node_modules', '.git', 'dist', 'artifacts', 'brain', '.gemini', 'scratch'];

const findings = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.includes(entry.name)) {
        scanDir(path.join(dir, entry.name));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (scanExtensions.includes(ext)) {
        const filePath = path.join(dir, entry.name);
        checkFile(filePath);
      }
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');

  lines.forEach((line, idx) => {
    const btpMatch = line.match(/btechpath/i);
    const tpAiMatch = line.match(/techpath\s+ai/i);

    if (btpMatch || tpAiMatch) {
      findings.push({
        file: relPath,
        lineNum: idx + 1,
        lineText: line.trim(),
        hasBTP: !!btpMatch,
        hasTPAi: !!tpAiMatch
      });
    }
  });
}

scanDir(rootDir);

console.log(`=== PRODUCTION FILES AUDIT (excluding scratch/) ===`);
console.log(`Total occurrences: ${findings.length}`);

const prohibitedAi = findings.filter(f => f.hasTPAi);
console.log(`\n--- PROHIBITED "TechPath AI" occurrences (${prohibitedAi.length}) ---`);
prohibitedAi.forEach(f => {
  console.log(`[${f.file}:${f.lineNum}] ${f.lineText}`);
});

const byFile = {};
findings.forEach(f => {
  if (!byFile[f.file]) byFile[f.file] = [];
  byFile[f.file].push(f);
});

console.log(`\n--- ALL FINDINGS BY FILE ---`);
Object.entries(byFile).forEach(([file, items]) => {
  console.log(`\n>>> ${file} (${items.length} occurrences):`);
  items.forEach(it => {
    console.log(`  Line ${it.lineNum} [${it.hasTPAi ? 'TECHPATH_AI' : 'BTECHPATH'}]: ${it.lineText.slice(0, 140)}`);
  });
});
