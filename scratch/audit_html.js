const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

console.log('=== CHECKING ALL HTML FILES FOR BTECHPATH OR TECHPATH AI ===');
let htmlMatches = 0;
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (/btechpath/i.test(line) || /techpath\s+ai/i.test(line)) {
      htmlMatches++;
      console.log(`${file}:${idx + 1} -> ${line.trim().slice(0, 120)}`);
    }
  });
});
console.log(`Total HTML matches: ${htmlMatches}`);
