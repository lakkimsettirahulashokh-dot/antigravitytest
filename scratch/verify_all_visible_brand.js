const fs = require('fs');
const path = require('path');
const http = require('http');

const rootDir = path.resolve(__dirname, '..');

const checks = {
  htmlTitles: { pass: true, failures: [] },
  htmlVisibleOldBrand: { pass: true, failures: [] },
  htmlTechPathAi: { pass: true, failures: [] },
  manifestCheck: { pass: true, details: null },
  seoScriptCheck: { pass: true, details: null },
  serverStatus: { pass: false, details: null },
  footerTagline: { pass: true, failures: [] }
};

// 1. Audit all 45 HTML files
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');

  // Title check
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || !titleMatch[1].includes('TechPath')) {
    checks.htmlTitles.pass = false;
    checks.htmlTitles.failures.push(`${file}: Title is "${titleMatch ? titleMatch[1] : 'MISSING'}"`);
  }

  // BTechPath visible check (exclude script links or internal ids like btech-3d-bg-canvas)
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    // Ignore script src="js/btech-bg3d.js", canvas id="btech-3d-bg-canvas"
    if (line.includes('btech-bg3d.js') || line.includes('btech-3d-bg-canvas')) return;
    if (/btechpath/i.test(line)) {
      checks.htmlVisibleOldBrand.pass = false;
      checks.htmlVisibleOldBrand.failures.push(`${file}:${idx + 1}: ${line.trim()}`);
    }
    // Prohibited "TechPath AI" as brand
    // allow "AI Notes by TechPath" or "AI Doubt Solver" or "TechPath AI Engine"
    if (/TechPath\s+AI\s+OS/i.test(line) || /TechPath\s*<span[^>]*>\s*AI/i.test(line) || /<title>[^<]*TechPath\s+AI/i.test(line)) {
      checks.htmlTechPathAi.pass = false;
      checks.htmlTechPathAi.failures.push(`${file}:${idx + 1}: ${line.trim()}`);
    }
  });

  // Footer tagline check
  if (content.includes('<footer') && !content.includes('Learn. Build. Prepare. Grow.')) {
    checks.footerTagline.pass = false;
    checks.footerTagline.failures.push(file);
  }
});

// 2. Manifest check
const manifestPath = path.join(rootDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.name === 'TechPath' && manifest.short_name === 'TechPath' && manifest.description.includes('Learn. Build. Prepare. Grow.')) {
  checks.manifestCheck.pass = true;
  checks.manifestCheck.details = manifest;
} else {
  checks.manifestCheck.pass = false;
  checks.manifestCheck.details = manifest;
}

// 3. SEO Metadata check
const seoPath = path.join(rootDir, 'js', 'seo-metadata.js');
const seoContent = fs.readFileSync(seoPath, 'utf8');
if (seoContent.includes("const SITE_NAME = 'TechPath';") && seoContent.includes('Learn. Build. Prepare. Grow.')) {
  checks.seoScriptCheck.pass = true;
} else {
  checks.seoScriptCheck.pass = false;
}

// 4. Server health & config probe
const req = http.get('http://localhost:8080/api/config', res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const cfg = JSON.parse(body);
      checks.serverStatus.pass = true;
      checks.serverStatus.details = cfg;
    } catch (e) {
      checks.serverStatus.details = e.message;
    }
    printReport();
  });
});
req.on('error', err => {
  checks.serverStatus.details = err.message;
  printReport();
});

function printReport() {
  console.log('\n======================================================');
  console.log('       TECHPATH BRAND VERIFICATION AUDIT REPORT       ');
  console.log('======================================================');
  console.log(`1. HTML Titles (${htmlFiles.length} pages): ${checks.htmlTitles.pass ? '✅ ALL PASS' : '❌ FAIL'}`);
  if (!checks.htmlTitles.pass) checks.htmlTitles.failures.forEach(f => console.log(`   - ${f}`));

  console.log(`2. Visible Old Brand "BTechPath": ${checks.htmlVisibleOldBrand.pass ? '✅ ALL CLEAN' : '❌ FAIL'}`);
  if (!checks.htmlVisibleOldBrand.pass) checks.htmlVisibleOldBrand.failures.forEach(f => console.log(`   - ${f}`));

  console.log(`3. Prohibited "TechPath AI" Brand: ${checks.htmlTechPathAi.pass ? '✅ NONE DETECTED' : '❌ FAIL'}`);
  if (!checks.htmlTechPathAi.pass) checks.htmlTechPathAi.failures.forEach(f => console.log(`   - ${f}`));

  console.log(`4. PWA Manifest (manifest.json): ${checks.manifestCheck.pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Name: "${checks.manifestCheck.details.name}" | Short: "${checks.manifestCheck.details.short_name}"`);
  console.log(`   Desc: "${checks.manifestCheck.details.description}"`);

  console.log(`5. Central SEO Engine (js/seo-metadata.js): ${checks.seoScriptCheck.pass ? '✅ PASS' : '❌ FAIL'}`);

  console.log(`6. Server /api/config: ${checks.serverStatus.pass ? '✅ ONLINE' : '❌ FAIL'}`);
  if (checks.serverStatus.details) {
    console.log(`   Support Email: ${checks.serverStatus.details.supportEmail || 'N/A'}`);
  }

  console.log(`7. Footer Tagline Check: ${checks.footerTagline.pass ? '✅ ALL PAGES PASS' : '⚠️ WARNING'}`);
  if (!checks.footerTagline.pass) console.log(`   Pages without tagline: ${checks.footerTagline.failures.join(', ')}`);

  console.log('======================================================\n');
}
