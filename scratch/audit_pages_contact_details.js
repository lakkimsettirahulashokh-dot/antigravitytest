const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const report = [];

htmlFiles.forEach(file => {
    const fullPath = path.join(rootDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    const mailtoMatches = content.match(/mailto:[^\s"'>]+/gi) || [];
    const emailMatches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

    // Filter out dummy/mock student emails like unsplash or placeholder
    const relevantEmails = emailMatches.filter(e => !e.includes('example.com') && !e.includes('domain.com') && !e.includes('schema.org'));

    report.push({
        file,
        mailtos: [...new Set(mailtoMatches)],
        emails: [...new Set(relevantEmails)]
    });
});

console.log(JSON.stringify(report.filter(r => r.mailtos.length > 0 || r.emails.length > 0), null, 2));
