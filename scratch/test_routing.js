const http = require('http');

function checkUrl(urlPath) {
    return new Promise((resolve) => {
        http.get('http://localhost:8080' + urlPath, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ path: urlPath, status: res.statusCode, length: data.length, contentType: res.headers['content-type'] });
            });
        }).on('error', (err) => resolve({ path: urlPath, error: err.message }));
    });
}

async function run() {
    console.log(await checkUrl('/auth/callback'));
    console.log(await checkUrl('/auth/callback.html'));
    console.log(await checkUrl('/auth-callback'));
    console.log(await checkUrl('/auth-callback.html'));
    console.log(await checkUrl('/dashboard'));
    console.log(await checkUrl('/dashboard.html'));
}

run();
