const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
console.log('Pages including js/ads.js:');
files.forEach(f => {
    const text = fs.readFileSync(f, 'utf8');
    if (text.includes('js/ads.js')) {
        console.log(`- ${f}`);
    }
});

console.log('\nPages with ad tags (<ad-banner, <ad-container, <advertisement-unit):');
files.forEach(f => {
    const text = fs.readFileSync(f, 'utf8');
    if (text.match(/<ad-banner|<ad-container|<advertisement-unit/)) {
        console.log(`- ${f}`);
    }
});
