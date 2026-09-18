const requestHandler = require('../server.js');

module.exports = (req, res) => {
    req.url = '/api/config';
    return requestHandler(req, res);
};
