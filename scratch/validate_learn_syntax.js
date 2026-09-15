const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'learn.html'), 'utf8');

// Extract inline scripts
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (!code || match[0].includes('src=')) continue;
  count++;
  try {
    new vm.Script(code);
    console.log(`✅ Script block #${count} syntax is valid (${code.length} chars)`);
  } catch (err) {
    console.error(`❌ Script block #${count} syntax error:`, err.message);
    errors++;
  }
}

console.log(`\nSyntax validation summary: ${count} script blocks analyzed, ${errors} errors found.`);
if (errors > 0) process.exit(1);
