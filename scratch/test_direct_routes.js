/**
 * scratch/test_direct_routes.js
 * Verifies direct HTTP responses for important routes to ensure metadata
 * is delivered in raw HTML by the server.
 */

const http = require('http');

const routes = [
    { path: '/', expectedTitle: 'BTechPath AI — From Classroom to Career, Guided by AI', expectedRobots: 'index, follow' },
    { path: '/reviews.html', expectedTitle: 'Reviews — Student Feedback | BTechPath AI', expectedRobots: 'index, follow' },
    { path: '/contact.html', expectedTitle: 'Contact Us | BTechPath AI', expectedRobots: 'index, follow' },
    { path: '/faqs.html', expectedTitle: 'FAQs — Frequently Asked Questions | BTechPath AI', expectedRobots: 'index, follow' },
    { path: '/privacy-policy.html', expectedTitle: 'Privacy Policy | BTechPath AI', expectedRobots: 'index, follow' },
    { path: '/terms.html', expectedTitle: 'Terms of Use | BTechPath AI', expectedRobots: 'index, follow' },
    { path: '/login.html', expectedTitle: 'Sign In | BTechPath AI', expectedRobots: 'noindex, nofollow' },
    { path: '/dashboard.html', expectedTitle: 'Student Dashboard | BTechPath AI', expectedRobots: 'noindex, nofollow' },
    { path: '/ai-notes.html', expectedTitle: 'AI Notes — Turn PDFs Into Detailed Study Notes | BTechPath AI', expectedRobots: 'noindex, nofollow' },
    { path: '/404.html', expectedTitle: 'Page Not Found | BTechPath AI', expectedRobots: 'noindex, nofollow' }
];

let pending = routes.length;
let passed = 0;

console.log('Testing direct HTTP GET requests on http://localhost:8081...');

routes.forEach(route => {
    http.get(`http://localhost:8081${route.path}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            const hasTitle = body.includes(`<title>${route.expectedTitle}</title>`);
            const hasRobots = body.includes(`<meta name="robots" content="${route.expectedRobots}">`);
            const hasOgSite = body.includes('<meta property="og:site_name" content="BTechPath AI">');
            const hasFavicon = body.includes('<link rel="icon" type="image/svg+xml" href="assets/branding/favicon.svg">');

            if (res.statusCode === 200 && hasTitle && hasRobots && hasOgSite && hasFavicon) {
                console.log(`  [PASS] ${route.path} -> Title: "${route.expectedTitle}" | Robots: "${route.expectedRobots}"`);
                passed++;
            } else {
                console.error(`  [FAIL] ${route.path} -> HTTP ${res.statusCode} | TitleMatch: ${hasTitle} | RobotsMatch: ${hasRobots}`);
            }

            pending--;
            if (pending === 0) {
                console.log(`\nRoute direct tests finished: ${passed}/${routes.length} passed.`);
            }
        });
    }).on('error', err => {
        console.error(`  [ERROR] Failed to query ${route.path}: ${err.message}`);
        pending--;
    });
});
