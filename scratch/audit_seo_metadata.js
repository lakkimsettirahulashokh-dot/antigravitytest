/**
 * scratch/audit_seo_metadata.js
 * Comprehensive automated verification of SEO, Open Graph, Favicons, and CTA requirements
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('   BTechPath AI OS — SEO & Open Graph Verification Audit');
console.log('========================================================\n');

// 1. Asset existence verification
console.log('--- 1. Verifying Required Branding & Favicon Assets ---');
const requiredAssets = [
    'assets/branding/favicon.svg',
    'assets/branding/favicon-16x16.png',
    'assets/branding/favicon-32x32.png',
    'assets/branding/apple-touch-icon.png',
    'assets/branding/icon-192.png',
    'assets/branding/icon-512.png',
    'assets/branding/btechpath-ai-og.png',
    'favicon.ico',
    'manifest.json',
    'js/seo-metadata.js'
];

let missingAssets = 0;
requiredAssets.forEach(relPath => {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        console.log(`  [OK] Exists: ${relPath} (${stat.size} bytes)`);
    } else {
        console.error(`  [FAIL] Missing: ${relPath}`);
        missingAssets++;
    }
});

// 2. HTML Files Audit
console.log('\n--- 2. Verifying HTML Metadata in All 43 Pages ---');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

const titleMap = new Map();
const descMap = new Map();
let pagesWithErrors = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const robotsMatch = content.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
    const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const ogTitleMatch = content.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const ogDescMatch = content.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const ogImageMatch = content.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const ogUrlMatch = content.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
    const twitterCardMatch = content.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);
    const svgFaviconMatch = content.match(/<link\s+rel=["']icon["']\s+type=["']image\/svg\+xml["']\s+href=["']([^"']+)["']/i);
    const icoFaviconMatch = content.match(/<link\s+rel=["']icon["']\s+type=["']image\/x-icon["']\s+href=["']([^"']+)["']/i);

    const title = titleMatch ? titleMatch[1].trim() : null;
    const desc = descMatch ? descMatch[1].trim() : null;
    const robots = robotsMatch ? robotsMatch[1].trim() : null;
    const canon = canonMatch ? canonMatch[1].trim() : null;

    let hasError = false;
    const errors = [];

    if (!title) { errors.push('Missing <title>'); hasError = true; }
    if (!desc) { errors.push('Missing <meta name="description">'); hasError = true; }
    if (!robots) { errors.push('Missing <meta name="robots">'); hasError = true; }
    if (!canon || canon === 'undefined') { errors.push('Invalid/Missing canonical'); hasError = true; }
    if (!ogTitleMatch) { errors.push('Missing og:title'); hasError = true; }
    if (!ogDescMatch) { errors.push('Missing og:description'); hasError = true; }
    if (!ogImageMatch || ogImageMatch[1] === 'undefined') { errors.push('Missing/Invalid og:image'); hasError = true; }
    if (!ogUrlMatch || ogUrlMatch[1] === 'undefined') { errors.push('Missing/Invalid og:url'); hasError = true; }
    if (!twitterCardMatch) { errors.push('Missing twitter:card'); hasError = true; }
    if (!svgFaviconMatch) { errors.push('Missing SVG favicon'); hasError = true; }
    if (!icoFaviconMatch) { errors.push('Missing ICO favicon'); hasError = true; }

    if (hasError) {
        pagesWithErrors++;
        console.error(`  [FAIL] ${file}: ${errors.join(', ')}`);
    } else {
        // Track duplicates for primary pages
        if (!file.startsWith('bulk-') && file !== 'pdf-analyzer.html') {
            if (titleMap.has(title)) {
                console.warn(`  [WARN] Duplicate Title: "${title}" in ${file} and ${titleMap.get(title)}`);
            } else {
                titleMap.set(title, file);
            }

            if (descMap.has(desc)) {
                console.warn(`  [WARN] Duplicate Description: "${desc}" in ${file} and ${descMap.get(desc)}`);
            } else {
                descMap.set(desc, file);
            }
        }
    }
});

console.log(`\nAudited ${htmlFiles.length} HTML files: ${pagesWithErrors} errors found.`);

// 3. Verify Above-the-fold CTA in index.html
console.log('\n--- 3. Verifying Hero CTA in index.html ---');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
const heroCta1 = indexHtml.includes('id="hero-primary-cta"');
const heroCta2 = indexHtml.includes('id="hero-secondary-cta"');
const startJourneyLink = indexHtml.includes('href="start-journey.html"');
const exploreLearnHubLink = indexHtml.includes('href="learn.html"');

if (heroCta1 && heroCta2 && startJourneyLink && exploreLearnHubLink) {
    console.log('  [OK] Hero CTA verified:');
    console.log('       - Primary: id="hero-primary-cta" -> start-journey.html ("Start Your Journey")');
    console.log('       - Secondary: id="hero-secondary-cta" -> learn.html ("Explore LearnHub")');
} else {
    console.error('  [FAIL] Hero CTA elements missing or incorrect in index.html!');
}

// 4. Live Server HTTP Check
const port = parseInt(process.env.PORT || '8080', 10);
console.log(`\n--- 4. Live Dev Server Endpoint Testing (Port ${port}) ---`);
const endpointsToTest = [
    { url: `http://localhost:${port}/`, expectedMime: 'text/html' },
    { url: `http://localhost:${port}/assets/branding/favicon.svg`, expectedMime: 'image/svg+xml' },
    { url: `http://localhost:${port}/assets/branding/btechpath-ai-og.png`, expectedMime: 'image/png' },
    { url: `http://localhost:${port}/favicon.ico`, expectedMime: 'image/x-icon' },
    { url: `http://localhost:${port}/manifest.json`, expectedMime: 'application/json' }
];

let liveTestsPending = endpointsToTest.length;

endpointsToTest.forEach(test => {
    http.get(test.url, (res) => {
        const contentType = res.headers['content-type'] || '';
        const status = res.statusCode;
        const pass = (status === 200) && contentType.includes(test.expectedMime);
        if (pass) {
            console.log(`  [OK] ${test.url} -> HTTP ${status} | ${contentType}`);
        } else {
            console.error(`  [FAIL] ${test.url} -> HTTP ${status} | Got: "${contentType}", Expected: "${test.expectedMime}"`);
        }
        liveTestsPending--;
        if (liveTestsPending === 0) {
            console.log('\n========================================================');
            console.log('       SEO & Metadata Audit Complete!');
            console.log('========================================================');
        }
    }).on('error', (e) => {
        console.error(`  [FAIL] Network error querying ${test.url}: ${e.message}`);
        liveTestsPending--;
        if (liveTestsPending === 0) {
            console.log('\n========================================================');
            console.log('       SEO & Metadata Audit Complete (With Errors)!');
            console.log('========================================================');
        }
    });
});
