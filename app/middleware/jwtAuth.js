const jwt = require('jsonwebtoken');
const { HTTP_STATUS_CODES, apiResponse } = require('../utils/responseHelper');
const User = require('../models/UserModel');

const jwtAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return apiResponse(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, 'Unauthorized: Authentication key is missing');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return apiResponse(res, false, HTTP_STATUS_CODES.NOT_FOUND, 'User not found');
        }

        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return apiResponse(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, 'Invalid token');
    }
}

module.exports = jwtAuth;