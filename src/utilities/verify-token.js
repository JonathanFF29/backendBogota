const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({
            auth: false,
            message: 'Token not provided'
        })
    }
    const jwt_decoded = jwt.verify(token, config.JWT_KEY)
    req.id = jwt_decoded.id;
    next();
}