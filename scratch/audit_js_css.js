const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

const targetDirs = ['js', 'css', 'scripts'];
const targetFiles = ['server.js', 'package.json'];

const report = [];

function check(rel) {
  const full = path.join(rootDir, rel);
  if (!fs.existsSync(full)) return;
  const content = fs.readFileSync(full, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const isBtp = /btechpath/i.test(line);
    const isTpAi = /techpath\s+ai/i.test(line);
    if (isBtp || isTpAi) {
      report.push({
        file: rel.replace(/\\/g, '/'),
        line: idx + 1,
        isTpAi,
        isBtp,
        text: line.trim()
      });
    }
  });
}

targetDirs.forEach(dir => {
  const dPath = path.join(rootDir, dir);
  if (fs.existsSync(dPath)) {
    fs.readdirSync(dPath).forEach(f => {
      if (f.endsWith('.js') || f.endsWith('.css')) {
        check(path.join(dir, f));
      }
    });
  }
});

targetFiles.forEach(f => check(f));

console.log(`Total non-HTML matches: ${report.length}`);
console.log('\n--- Prohibited "TechPath AI" occurrences:');
report.filter(r => r.isTpAi).forEach(r => {
  console.log(`${r.file}:${r.line} -> ${r.text}`);
});

console.log('\n--- "BTechPath" occurrences:');
report.filter(r => r.isBtp && !r.isTpAi).forEach(r => {
  console.log(`${r.file}:${r.line} -> ${r.text}`);
});
