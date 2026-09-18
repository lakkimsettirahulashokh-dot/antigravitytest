const handleConfig = require('./config.js');

module.exports = (req, res) => {
    // If Vercel rewrote the URL, x-matched-path contains the original client requested path
    if (req.headers['x-matched-path']) {
        req.url = req.headers['x-matched-path'];
    }

    // Fast-path /api/config to avoid loading monolithic server bundle
    if (req.url && (req.url === '/api/config' || req.url.startsWith('/api/config?') || req.url.startsWith('/api/config/'))) {
        return handleConfig(req, res);
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
