const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

console.log(`Processing ${htmlFiles.length} HTML files...`);

let totalReplacements = 0;
const fileStats = {};

htmlFiles.forEach(fileName => {
    const filePath = path.join(rootDir, fileName);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Title tags
    content = content.replace(/<title>BTechPath AI — From Classroom to Career, Guided by AI<\/title>/gi, '<title>TechPath — Learn. Build. Prepare. Grow.</title>');
    content = content.replace(/<title>BTechPath AI FAQs<\/title>/gi, '<title>TechPath FAQs</title>');
    content = content.replace(/\|\s*BTechPath\s*AI\s*OS<\/title>/gi, '| TechPath</title>');
    content = content.replace(/\|\s*BTechPath\s*AI<\/title>/gi, '| TechPath</title>');
    content = content.replace(/\|\s*BTechPath<\/title>/gi, '| TechPath</title>');
    content = content.replace(/<title>BTechPath\s*AI\s*—\s*/gi, '<title>TechPath — ');
    content = content.replace(/<title>BTechPath\s*—\s*/gi, '<title>TechPath — ');

    // 2. Metadata tags
    content = content.replace(/content="BTechPath AI — From Classroom to Career, Guided by AI"/gi, 'content="TechPath — Learn. Build. Prepare. Grow."');
    content = content.replace(/content="BTechPath AI - The Engineering Intelligence Platform"/gi, 'content="TechPath — Learn. Build. Prepare. Grow."');
    content = content.replace(/content="BTechPath AI"/gi, 'content="TechPath"');
    content = content.replace(/content="BTechPath AI OS"/gi, 'content="TechPath"');
    content = content.replace(/content="BTechPath"/gi, 'content="TechPath"');

    // 3. Header / Navbar brand wordmark variations:
    // Variation A: <span ...>BTechPath <span ...>AI</span></span>
    content = content.replace(/<span class="font-extrabold text-xl tracking-tight text-\[#F5F7FA\]">BTechPath <span class="text-\[#2DD4BF\] font-mono text-xs px-2 py-0\.5 rounded bg-\[#1A2031\] border border-\[#2A3147\]">AI<\/span><\/span>/gi,
        '<span class="font-extrabold text-xl tracking-tight text-[#F5F7FA]">TechPath</span>');
    content = content.replace(/<span class="font-extrabold text-xl tracking-tight text-white">BTechPath <span class="text-\[#2DD4BF\] font-mono text-xs px-2 py-0\.5 rounded bg-\[#1A2031\] border border-\[#2A3147\]">AI<\/span><\/span>/gi,
        '<span class="font-extrabold text-xl tracking-tight text-white">TechPath</span>');

    // Variation B: BTechPath <span class="text-[#2DD4BF]">AI</span>
    content = content.replace(/<span class="text-base font-extrabold tracking-tight text-\[#F5F7FA\]">BTechPath <span class="text-\[#2DD4BF\]">AI<\/span><\/span>\s*<span class="text-\[10px\] font-mono text-\[#A1A7BC\] -mt-1">ENGINEERING OS<\/span>/gi,
        '<span class="text-base font-extrabold tracking-tight text-[#F5F7FA]">TechPath</span>\n                    <span class="text-[10px] font-mono text-[#A1A7BC] -mt-1">Learn. Build. Prepare. Grow.</span>');

    // Variation C: Generic BTechPath <span ...>AI</span>
    content = content.replace(/BTechPath\s*<span class="text-xs px-1\.5 py-0\.5 rounded bg-teal-brand\/10 text-teal-brand border border-teal-brand\/20 font-mono">AI<\/span>/gi, 'TechPath');
    content = content.replace(/BTechPath\s*<span class="text-\[#2DD4BF\] font-mono text-xs px-2 py-0\.5 rounded bg-\[#1A2031\] border border-\[#2A3147\]">AI<\/span>/gi, 'TechPath');
    content = content.replace(/BTechPath\s*<span class="text-\[#2DD4BF\]">AI<\/span>/gi, 'TechPath');
    content = content.replace(/BTechPath\s*<span class="text-teal-brand">AI<\/span>/gi, 'TechPath');
    content = content.replace(/BTechPath\s*<span class="text-primary font-mono text-xs px-1\.5 py-0\.5 rounded bg-primary\/10 border border-primary\/20">AI<\/span>/gi, 'TechPath');

    // 4. Footers:
    // Brand name in footers
    content = content.replace(/<span class="font-bold text-\[#F5F7FA\] text-sm">BTechPath AI<\/span>/gi, '<span class="font-bold text-[#F5F7FA] text-sm">TechPath</span>');
    content = content.replace(/<span class="font-bold text-white text-sm">BTechPath AI<\/span>/gi, '<span class="font-bold text-white text-sm">TechPath</span>');
    content = content.replace(/<span class="font-bold text-white">BTechPath AI<\/span>/gi, '<span class="font-bold text-white">TechPath</span>');
    content = content.replace(/<span class="font-bold text-white">BTechPath<\/span>/gi, '<span class="font-bold text-white">TechPath</span>');
    content = content.replace(/<span class="font-bold text-\[#F5F7FA\]">BTechPath<\/span>/gi, '<span class="font-bold text-[#F5F7FA]">TechPath</span>');

    // Taglines in footers
    content = content.replace(/"From Classroom to Career, Your Journey Guided by AI\."/gi, '"Learn. Build. Prepare. Grow. • From Classroom to Career."');
    content = content.replace(/"From Classroom to Career, Your Engineering Journey Guided by AI\."/gi, '"Learn. Build. Prepare. Grow. • From Classroom to Career."');
    content = content.replace(/&copy; 2026 BTechPath AI OS\. All rights reserved\./gi, '&copy; 2026 TechPath. All rights reserved.');
    content = content.replace(/&copy; 2026 BTechPath AI\. All rights reserved\./gi, '&copy; 2026 TechPath. All rights reserved.');
    content = content.replace(/© 2026 BTechPath AI OS\. All rights reserved\./gi, '© 2026 TechPath. All rights reserved.');
    content = content.replace(/BTechPath AI OS • Secured by Cryptographic Identity & Real-Time RLS/gi, 'TechPath • Secured by Cryptographic Identity & Real-Time RLS');
    content = content.replace(/BTechPath AI OS • Secured by Cryptographic Identity/gi, 'TechPath • Secured by Cryptographic Identity');
    content = content.replace(/BTechPath AI OS •/gi, 'TechPath •');
    content = content.replace(/BTechPath AI •/gi, 'TechPath •');

    // 5. Common text patterns
    content = content.replace(/About BTechPath AI/gi, 'About TechPath');
    content = content.replace(/Welcome to BTechPath AI/gi, 'Welcome to TechPath');
    content = content.replace(/Join BTechPath AI/gi, 'Join TechPath');
    content = content.replace(/Why BTechPath AI/gi, 'Why TechPath');
    content = content.replace(/Inside BTechPath AI/gi, 'Inside TechPath');
    content = content.replace(/Explore BTechPath AI/gi, 'Explore TechPath');
    content = content.replace(/using BTechPath AI/gi, 'using TechPath');
    content = content.replace(/with BTechPath AI/gi, 'with TechPath');
    content = content.replace(/on BTechPath AI/gi, 'on TechPath');
    content = content.replace(/for BTechPath AI/gi, 'for TechPath');
    content = content.replace(/in BTechPath AI/gi, 'in TechPath');
    content = content.replace(/to BTechPath AI/gi, 'to TechPath');
    content = content.replace(/by BTechPath AI/gi, 'by TechPath');
    content = content.replace(/BTechPath AI helps/gi, 'TechPath helps');
    content = content.replace(/BTechPath AI platform/gi, 'TechPath platform');
    content = content.replace(/BTechPath AI OS/gi, 'TechPath');
    content = content.replace(/BTechPath AI/gi, 'TechPath');
    content = content.replace(/BTechPathAI/gi, 'TechPath');
    content = content.replace(/BTechPath/gi, 'TechPath');

    // 6. Fix any accidental "TechPath AI" created by substitutions
    content = content.replace(/TechPath\s*AI/g, 'TechPath');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        fileStats[fileName] = true;
        totalReplacements++;
    }
});

console.log(`Updated ${totalReplacements} files.`);
