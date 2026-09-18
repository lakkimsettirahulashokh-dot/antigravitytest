const handleConfig = require('./config.js');

module.exports = (req, res) => {
    // --------------------------------------------------------------------------
    // VERCEL REWRITE ROUTE RECONSTRUCTION
    // When Vercel rewrites /api/:path* to /api/index.js, req.url may arrive as
    // /api/index.js?__route__=... or /api/index.js?path=...
    // Restore the canonical requested URL path before passing to server.js
    // --------------------------------------------------------------------------
    try {
        let reconstructed = false;

        // 1. Check __route__ query parameter (from vercel.json rewrite)
        const parsed = new URL(req.url, 'http://127.0.0.1');
        if (parsed.searchParams.has('__route__')) {
            const route = parsed.searchParams.get('__route__');
            parsed.searchParams.delete('__route__');
            const cleanRoute = route.startsWith('/') ? route : `/${route}`;
            req.url = cleanRoute.startsWith('/api') ? `${cleanRoute}${parsed.search}` : `/api${cleanRoute}${parsed.search}`;
            reconstructed = true;
        }

        // 2. Check req.query parsed by Vercel serverless runtime
        if (!reconstructed && req.query) {
            const rawRoute = req.query.__route__ || req.query.path || req.query.route;
            if (rawRoute) {
                const routeStr = Array.isArray(rawRoute) ? rawRoute.join('/') : rawRoute;
                const cleanRoute = routeStr.startsWith('/') ? routeStr : `/${routeStr}`;
                parsed.searchParams.delete('__route__');
                parsed.searchParams.delete('path');
                parsed.searchParams.delete('route');
                req.url = cleanRoute.startsWith('/api') ? `${cleanRoute}${parsed.search}` : `/api${cleanRoute}${parsed.search}`;
                reconstructed = true;
            }
        }

        // 3. Check Vercel headers (x-now-route-matches, x-forwarded-uri, x-original-url)
        if (!reconstructed) {
            const original = req.headers['x-forwarded-uri'] || req.headers['x-original-url'];
            if (original && original.startsWith('/api') && !original.includes('api/index')) {
                req.url = original;
                reconstructed = true;
            } else if (req.headers['x-now-route-matches']) {
                try {
                    const matchParams = new URLSearchParams(req.headers['x-now-route-matches']);
                    const matched = matchParams.get('1') || matchParams.get('route') || matchParams.get('path');
                    if (matched) {
                        const cleanMatched = matched.startsWith('/') ? matched : `/${matched}`;
                        req.url = cleanMatched.startsWith('/api') ? `${cleanMatched}${parsed.search}` : `/api${cleanMatched}${parsed.search}`;
                        reconstructed = true;
                    }
                } catch (e) {}
            }
        }
    } catch (parseErr) {
        console.warn('[Vercel API URL Reconstruction Warning]:', parseErr.message);
    }

    // Fast-path /api/config or /api/config.json
    if (req.url && (req.url.startsWith('/api/config') || req.url === '/api/config')) {
        return handleConfig(req, res);
    }

    // Fast-path /api/ads/config
    if (req.url && req.url.startsWith('/api/ads/config') && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.end(JSON.stringify({
            success: true,
            config: {
                publisherId: 'ca-pub-1234567890123456',
                enabled: true,
                placements: {
                    dashboard_top: true,
                    dashboard_sidebar: true,
                    dashboard_bottom: true,
                    learnhub_bottom: true,
                    branch_learning_bottom: true
                },
                slots: {
                    dashboard_top: '1850538175',
                    dashboard_sidebar: '1850538175',
                    dashboard_bottom: '1850538175',
                    learnhub_bottom: '1850538175',
                    branch_learning_bottom: '1850538175'
                }
            }
        }));
    }

    try {
        const requestHandler = require('../server.js');
        return requestHandler(req, res);
    } catch (err) {
        console.error('[Vercel Serverless Handler Error]:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'serverless_init_failed', message: err.message }));
    }
};
