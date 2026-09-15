const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const scanExtensions = ['.html', '.js', '.json', '.css'];
const ignoredDirs = ['node_modules', '.git', 'dist', 'artifacts', 'brain', '.gemini'];

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
        // skip this script itself or test scripts if needed, but let's check everything
        if (filePath.includes('scratch\\audit_brand.js') || filePath.includes('scratch/audit_brand.js')) continue;
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
    // Check for BTechPath (case-insensitive)
    const btpMatch = line.match(/btechpath/i);
    // Check for TechPath AI (case-insensitive)
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

console.log(`Total occurrences found: ${findings.length}`);

// Categorize findings
const prohibitedAi = findings.filter(f => f.hasTPAi);
const btpOccurrences = findings.filter(f => f.hasBTP);

console.log(`\n--- Prohibited "TechPath AI" occurrences (${prohibitedAi.length}) ---`);
prohibitedAi.slice(0, 50).forEach(f => {
  console.log(`[${f.file}:${f.lineNum}] ${f.lineText}`);
});

console.log(`\n--- "BTechPath" occurrences (${btpOccurrences.length}) ---`);
// Group by file
const byFile = {};
btpOccurrences.forEach(f => {
  if (!byFile[f.file]) byFile[f.file] = [];
  byFile[f.file].push(f);
});

Object.entries(byFile).forEach(([file, items]) => {
  console.log(`\n${file} (${items.length} occurrences):`);
  items.slice(0, 10).forEach(it => console.log(`  Line ${it.lineNum}: ${it.lineText.slice(0, 120)}`));
  if (items.length > 10) console.log(`  ... and ${items.length - 10} more`);
});
