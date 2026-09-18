const requestHandler = require('../server.js');

module.exports = (req, res) => {
    // If Vercel rewrote the URL, x-matched-path contains the original client requested path
    if (req.headers['x-matched-path']) {
        req.url = req.headers['x-matched-path'];
    }
    return requestHandler(req, res);
};
