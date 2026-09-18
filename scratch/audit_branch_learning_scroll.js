const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');

console.log('====================================================');
console.log('AUDITING BRANCH LEARNING PAGE SCROLL & INTERACTION');
console.log('====================================================');

// 1. Audit branch-learning.html elements & classes
const htmlPath = path.join(ROOT, 'branch-learning.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('\n--- 1. HTML & BODY TAGS IN branch-learning.html ---');
const htmlTagMatch = html.match(/<html[^>]*>/i);
const bodyTagMatch = html.match(/<body[^>]*>/i);
console.log('HTML tag:', htmlTagMatch ? htmlTagMatch[0] : 'N/A');
console.log('BODY tag:', bodyTagMatch ? bodyTagMatch[0] : 'N/A');

// Look for any style tags or inline styles
const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
if (styleMatches) {
    console.log('\n--- INLINE STYLE TAGS ---');
    styleMatches.forEach((s, idx) => {
        console.log(`[Style block ${idx + 1}]:\n`, s);
    });
}

// Check all elements with overflow, height, h-screen, fixed, absolute, z-index
console.log('\n--- ELEMENTS WITH OVERFLOW / HEIGHT CLASSES ---');
const lines = html.split('\n');
lines.forEach((l, i) => {
    if (/overflow|h-screen|h-full|fixed|sticky|z-\d+|cursor-|pointer-events|touch-/i.test(l)) {
        console.log(`Line ${i + 1}: ${l.trim()}`);
    }
});

// 2. Audit JS files loaded in branch-learning.html
const scripts = [
    'js/motion.js',
    'js/seo-metadata.js',
    'js/supabase-client.js',
    'js/auth.js',
    'js/study-tracker.js',
    'js/branches.js',
    'js/ads.js',
    'js/branch-3d.js',
    'js/branch-learning.js'
];

console.log('\n--- 2. JS EVENT & SCROLL LOCK AUDIT ---');
scripts.forEach(scriptRel => {
    const sPath = path.join(ROOT, scriptRel);
    if (!fs.existsSync(sPath)) {
        console.log(`Script not found: ${scriptRel}`);
        return;
    }
    const content = fs.readFileSync(sPath, 'utf8');
    const sLines = content.split('\n');
    sLines.forEach((line, idx) => {
        if (/preventDefault|stopPropagation|addEventListener\(['"](wheel|touchmove|touchstart|touchend|pointerdown|pointermove|scroll)/i.test(line) ||
            /document\.body\.style\.overflow|document\.documentElement\.style\.overflow|touch-action/i.test(line)) {
            console.log(`${scriptRel}:${idx + 1}: ${line.trim()}`);
        }
    });
});
