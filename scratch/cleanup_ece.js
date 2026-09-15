const fs = require('fs');
let s = fs.readFileSync('server.js', 'utf8');

s = s.replace(/const branch = \(parsedUrl\.searchParams\.get\('branch'\) \|\| 'ECE'\)/g, "const branch = (parsedUrl.searchParams.get('branch') || '')");
s = s.replace(/const branch = \(body\.branch \|\| 'ECE'\)/g, "const branch = (body.branch || '')");

fs.writeFileSync('server.js', s, 'utf8');
console.log('✅ Replaced hardcoded ECE fallbacks in server.js');
