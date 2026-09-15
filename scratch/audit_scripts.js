const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let m;
  const scripts = [];
  while ((m = regex.exec(content)) !== null) {
    scripts.push(m[1]);
  }
  const counts = {};
  scripts.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  const dupes = Object.entries(counts).filter(([_, c]) => c > 1);
  if (dupes.length > 0) {
    console.log(f, dupes);
  }
});
