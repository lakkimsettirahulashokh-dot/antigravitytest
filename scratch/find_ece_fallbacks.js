const fs = require('fs');
const path = require('path');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (['node_modules', '.git', 'tools', 'scratch'].includes(f)) continue;
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) {
            walk(fp);
        } else if (f.endsWith('.js') || f.endsWith('.html')) {
            const content = fs.readFileSync(fp, 'utf8');
            const lines = content.split('\n');
            lines.forEach((l, i) => {
                if (l.includes("'ECE'") || l.includes('"ECE"')) {
                    console.log(`${fp}:${i + 1}: ${l.trim()}`);
                }
            });
        }
    }
}

walk('.');
