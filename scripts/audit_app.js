// ==============================================================================
// TechPath - Comprehensive Static & Runtime Integrity Auditor
// ==============================================================================

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

console.log('========================================================');
console.log('🔍 TechPath — Comprehensive Project Audit');
console.log(`📂 Total HTML Pages: ${htmlFiles.length}`);
console.log('========================================================\n');

let totalIssues = 0;
const results = [];

htmlFiles.forEach(file => {
    const fullPath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    const pageAudit = {
        file: file,
        hasTitle: /<title>([^<]+)<\/title>/i.test(content),
        title: (content.match(/<title>([^<]+)<\/title>/i) || [])[1] || 'MISSING',
        brokenHrefs: [],
        brokenScripts: [],
        hasMotionElements: false,
        redirectsToAiNotes: false
    };

    // Check for accidental redirect to ai-notes
    if (file !== 'ai-notes.html') {
        const suspiciousRedirect = /window\.location(\.href)?\s*=\s*['"]ai-notes\.html['"]/i.test(content);
        if (suspiciousRedirect && !['pdf-analyzer.html'].includes(file)) {
            pageAudit.redirectsToAiNotes = true;
            totalIssues++;
        }
    }

    // Check motion classes
    if (content.includes('tilt-card') || content.includes('data-tilt') || content.includes('animate-') || content.includes('perspective') || content.includes('motion.css')) {
        pageAudit.hasMotionElements = true;
    }

    // Strip <script> blocks when inspecting static HTML hrefs
    const htmlWithoutScripts = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Find all static href links
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(htmlWithoutScripts)) !== null) {
        let target = match[1].split('?')[0].split('#')[0];
        if (target && !target.startsWith('http') && !target.startsWith('//') && !target.startsWith('mailto:') && !target.startsWith('javascript:') && !target.startsWith('#')) {
            const resolvedPath = path.resolve(ROOT_DIR, target);
            if (!fs.existsSync(resolvedPath)) {
                pageAudit.brokenHrefs.push(target);
                totalIssues++;
            }
        }
    }

    // Find all script tags
    const scriptRegex = /src=["']([^"']+\.js)["']/g;
    while ((match = scriptRegex.exec(content)) !== null) {
        let src = match[1].split('?')[0];
        if (!src.startsWith('http') && !src.startsWith('//')) {
            const resolvedPath = path.resolve(ROOT_DIR, src);
            if (!fs.existsSync(resolvedPath)) {
                pageAudit.brokenScripts.push(src);
                totalIssues++;
            }
        }
    }

    results.push(pageAudit);
});

// Output Summary Table
results.forEach(r => {
    const statusTag = (r.brokenHrefs.length === 0 && r.brokenScripts.length === 0 && !r.redirectsToAiNotes) ? '🟢 PASS' : '🔴 FAIL';
    console.log(`${statusTag} | ${r.file.padEnd(26)} | Motion: ${r.hasMotionElements ? 'Yes' : 'No '} | Title: ${r.title.slice(0, 38)}`);
    if (r.brokenHrefs.length > 0) {
        console.log(`    ⚠️ Broken Hrefs: ${r.brokenHrefs.join(', ')}`);
    }
    if (r.brokenScripts.length > 0) {
        console.log(`    ⚠️ Broken Scripts: ${r.brokenScripts.join(', ')}`);
    }
    if (r.redirectsToAiNotes) {
        console.log(`    🚨 CRITICAL ERROR: Redirects to ai-notes.html`);
    }
});

console.log('\n========================================================');
console.log(`Audit Finished: ${totalIssues === 0 ? '✅ 0 Issues Found — All Pages Healthy!' : `⚠️ Found ${totalIssues} issues.`}`);
console.log('========================================================');
