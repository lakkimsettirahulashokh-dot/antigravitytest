const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

console.log(`Checking ${htmlFiles.length} HTML files for hidden "AI" badges next to TechPath...`);

const badHtmlFiles = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  
  // Pattern 1: TechPath followed by any span with AI
  const pattern1 = /TechPath\s*<span[^>]*>\s*(?:AI|OS|AI\s*OS)\s*<\/span>/gi;
  // Pattern 2: TechPath AI in raw text
  const pattern2 = /TechPath\s+AI\b/gi;
  // Pattern 3: BTechPath anywhere
  const pattern3 = /BTechPath/gi;

  let m;
  let matches = [];
  while ((m = pattern1.exec(content)) !== null) {
    matches.push({ type: 'TechPath + AI span', match: m[0], index: m.index });
  }
  while ((m = pattern2.exec(content)) !== null) {
    // Check if it's "TechPath AI [feature]" or "TechPath AI" as brand
    matches.push({ type: 'TechPath AI raw', match: m[0], index: m.index });
  }
  while ((m = pattern3.exec(content)) !== null) {
    matches.push({ type: 'BTechPath', match: m[0], index: m.index });
  }

  if (matches.length > 0) {
    badHtmlFiles.push({ file, matches });
    console.log(`\n[${file}] Found ${matches.length} matches:`);
    matches.forEach(match => {
      const snippet = content.slice(Math.max(0, match.index - 30), Math.min(content.length, match.index + 60)).replace(/\r?\n/g, ' ');
      console.log(`  - ${match.type}: "...${snippet}..."`);
    });
  }
});

console.log(`\nTotal files needing cleanup: ${badHtmlFiles.length}`);
