const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'seo-metadata.js');
let s = fs.readFileSync(filePath, 'utf8');

// 1. Tagline and site name
s = s.replace(/const SITE_NAME = 'BTechPath AI';/g, "const SITE_NAME = 'TechPath';");
s = s.replace(/BTechPath AI — From Classroom to Career, Guided by AI/g, "TechPath — Learn. Build. Prepare. Grow.");
s = s.replace(/From Classroom to Career, Your Engineering Journey Guided by AI/g, "Learn. Build. Prepare. Grow. From Classroom to Career.");
s = s.replace(/BTechPath AI OS — Centralized SEO/g, "TechPath — Centralized SEO");

// 2. Systematic brand replacement (ensuring no "TechPath AI" is ever produced)
s = s.replace(/BTechPath\s*AI\s*OS/g, 'TechPath');
s = s.replace(/BTechPath\s*AI/g, 'TechPath');
s = s.replace(/BTechPath/g, 'TechPath');
s = s.replace(/TechPath\s*AI/g, 'TechPath');

// 3. Keep backwards compatibility alias
s = s.replace(/window\.BTechPathSEO\s*=/g, 'window.TechPathSEO = window.BTechPathSEO =');

fs.writeFileSync(filePath, s, 'utf8');

// Verify
const updated = fs.readFileSync(filePath, 'utf8');
const badMatches = updated.match(/TechPath\s*AI|BTechPath\s*AI|BTechPath/gi) || [];
console.log('Verification: remaining prohibited brand tokens in seo-metadata.js:', badMatches.length);
if (badMatches.length > 0) {
    console.log('Prohibited tokens:', badMatches);
} else {
    console.log('SUCCESS: js/seo-metadata.js completely rebranded to TechPath with 0 prohibited tokens.');
}
