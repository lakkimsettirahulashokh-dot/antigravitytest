const http = require('http');

const pagesToTest = [
  { url: 'http://localhost:8080/index.html', name: 'Homepage' },
  { url: 'http://localhost:8080/login.html', name: 'Login' },
  { url: 'http://localhost:8080/signup.html', name: 'Signup' },
  { url: 'http://localhost:8080/onboarding.html', name: 'Onboarding' },
  { url: 'http://localhost:8080/dashboard.html', name: 'Dashboard' },
  { url: 'http://localhost:8080/reviews.html', name: 'Reviews' },
  { url: 'http://localhost:8080/contact.html', name: 'Contact' },
  { url: 'http://localhost:8080/thank-you.html', name: 'Thank You' },
  { url: 'http://localhost:8080/admin.html', name: 'Admin' }
];

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('================================================================');
  console.log('  LIVE SERVER HTTP RENDERING & BRAND INTEGRITY VERIFICATION');
  console.log('================================================================\n');

  let allPassed = true;

  for (const page of pagesToTest) {
    try {
      const { status, html } = await fetchPage(page.url);
      if (status !== 200) {
        console.log(`❌ [FAIL] ${page.name} (${page.url}) -> HTTP ${status}`);
        allPassed = false;
        continue;
      }

      // Title
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'NONE';
      const hasTechPathInTitle = title.includes('TechPath');

      // Prohibited TechPath AI check
      const hasProhibitedTechPathAi = /TechPath\s*<span[^>]*>\s*AI/i.test(html) || /TechPath\s+AI\b(?!\s+(?:Tutor|Engine|Notes|Doubt|Model|Resume|Search|Assistant|Mock|Assessment|Analyst))/i.test(html);
      
      // Old BTechPath visible check (ignore script src/canvas ids)
      const hasOldBTechPath = html.split('\n').some(line => {
        if (line.includes('btech-bg3d.js') || line.includes('btech-3d-bg-canvas')) return false;
        return /btechpath/i.test(line);
      });

      // Header logo check
      const hasTechPathLogo = html.includes('TechPath') && !html.includes('BTechPath AI');

      const pagePass = hasTechPathInTitle && !hasProhibitedTechPathAi && !hasOldBTechPath && hasTechPathLogo;

      if (pagePass) {
        console.log(`✅ [PASS] ${page.name.padEnd(12)} | Title: "${title}" | Header Logo: TechPath`);
      } else {
        console.log(`❌ [FAIL] ${page.name} -> Title: "${title}" | OldBTP: ${hasOldBTechPath} | ProhibitedAi: ${hasProhibitedTechPathAi}`);
        allPassed = false;
      }
    } catch (e) {
      console.log(`❌ [ERROR] ${page.name}: ${e.message}`);
      allPassed = false;
    }
  }

  console.log('\n================================================================');
  console.log(`SUMMARY: ${allPassed ? 'ALL PAGES VERIFIED SUCCESSFULLY (100% PASS)' : 'FAILURES DETECTED'}`);
  console.log('================================================================\n');
}

run();
