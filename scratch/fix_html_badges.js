const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let fixedCount = 0;
let filesModified = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Pattern: TechPath followed by any span containing AI, OS, or AI OS
  // e.g. TechPath <span class="text-indigo-brand font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">AI</span>
  // or TechPath <span class="text-primary font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">AI</span>
  // or TechPath <span class="...">AI</span>
  
  const badgeRegex = /TechPath\s*<span\s+class="[^"]*font-mono[^"]*">\s*(?:AI|OS|AI\s*OS)\s*<\/span>/gi;
  const genericBadgeRegex = /TechPath\s*<span[^>]*>\s*(?:AI|OS|AI\s*OS)\s*<\/span>/gi;

  if (genericBadgeRegex.test(content)) {
    content = content.replace(genericBadgeRegex, 'TechPath');
  }

  // Also check if there's any `<span class="text-[#2DD4BF]">AI</span>` or similar right next to TechPath
  const nextSpanRegex = /(<span[^>]*>TechPath<\/span>)\s*<span[^>]*>\s*(?:AI|OS|AI\s*OS)\s*<\/span>/gi;
  if (nextSpanRegex.test(content)) {
    content = content.replace(nextSpanRegex, '$1');
  }

  // Check for any raw "TechPath AI" that isn't a feature like "AI Notes by TechPath" or "AI Doubt Solver"
  // If "TechPath AI" appears as a brand name:
  // e.g. "TechPath AI OS", "TechPath AI platform", "TechPath AI -"
  content = content.replace(/TechPath\s+AI\s+OS/gi, 'TechPath');
  content = content.replace(/TechPath\s+AI\s+Platform/gi, 'TechPath Platform');
  content = content.replace(/TechPath\s+AI\b(?!\s+(?:Tutor|Engine|Notes|Doubt|Model|Resume|Search|Assistant|Mock|Assessment|Analyst))/gi, 'TechPath');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done! Modified ${filesModified} HTML files.`);
