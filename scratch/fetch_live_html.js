const https = require('https');

https.get('https://tech-path-six.vercel.app/', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('HTML length:', data.length);
        const re = /<script\s+[^>]*src=["']([^"']+)["']/gi;
        let match;
        while ((match = re.exec(data)) !== null) {
            console.log('  script src:', match[1]);
        }
    });
});
