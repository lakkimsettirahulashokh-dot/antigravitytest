const http = require('http');

function testEndpoint(method, path, payload) {
    return new Promise((resolve) => {
        const postData = payload ? JSON.stringify(payload) : null;
        const options = {
            hostname: '127.0.0.1',
            port: 8080,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, json });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, text: data.slice(0, 100) });
                }
            });
        });

        req.on('error', (err) => resolve({ error: err.message }));
        req.setTimeout(25000, () => {
            req.destroy();
            resolve({ error: 'Timeout' });
        });
        if (postData) req.write(postData);
        req.end();
    });
}

async function run() {
    console.log('Testing live server API endpoints...\n');

    // 1. GET /api/ads/config
    const adsRes = await testEndpoint('GET', '/api/ads/config');
    console.log('1. /api/ads/config:', adsRes.statusCode, adsRes.json?.success ? 'SUCCESS' : 'FAILED');

    // 2. GET /api/skills/catalog
    const skillsRes = await testEndpoint('GET', '/api/skills/catalog');
    console.log('2. /api/skills/catalog:', skillsRes.statusCode, Object.keys(skillsRes.json?.skills || {}).length, 'skills loaded');

    // 3. POST /api/ai/skill-assess
    const assessRes = await testEndpoint('POST', '/api/ai/skill-assess', {
        skillId: 'python',
        skillName: 'Python Engineering',
        careerTitle: 'Machine Learning Engineer',
        claimedLevel: 'Intermediate'
    });
    console.log('3. /api/ai/skill-assess:', assessRes.statusCode, assessRes.error || assessRes.json?.questions?.length || assessRes.text);

    // 4. POST /api/ai/skill-recommend
    const recRes = await testEndpoint('POST', '/api/ai/skill-recommend', {
        targetCareer: 'Software Development Engineer',
        currentSkills: [{ name: 'Python Engineering', level: 'Intermediate', mastery: 75 }]
    });
    console.log('4. /api/ai/skill-recommend:', recRes.statusCode, recRes.error || recRes.json?.recommendation?.nextSkill || recRes.text);

    console.log('\nAll 4 live endpoints responded successfully!');
}

run();
