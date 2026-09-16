const fs = require('fs');
const path = require('path');

function search(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'tools' || ent.name === 'scratch' || ent.name === 'data_store.json') continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            search(full);
        } else if (ent.isFile() && (ent.name.endsWith('.js') || ent.name.endsWith('.html') || ent.name.endsWith('.json') || ent.name.endsWith('.env'))) {
            try {
                const text = fs.readFileSync(full, 'utf8');
                const lines = text.split('\n');
                lines.forEach((line, idx) => {
                    if (line.match(/admob|adsense|ad_unit|admob_app_id|ca-app-pub|adsbygoogle|advertisement|AdManager|techpath.*ad/i)) {
                        console.log(`${full}:${idx + 1}: ${line.trim().substring(0, 140)}`);
                    }
                });
            } catch (e) {}
        }
    }
}

search('.');
