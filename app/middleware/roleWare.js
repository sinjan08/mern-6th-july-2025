const { apiResponse, HTTP_STATUS_CODES } = require("../utils/responseHelper");

const adminRoleWare = (req, res, next) => {
    const userRole = req.user.role; // Assuming user role is attached to req.user by jwtAuth middleware

    if (userRole === 'admin') {
        next(); // Allow access for admin users
    } else {
        return apiResponse(res, false, HTTP_STATUS_CODES.FORBIDDEN, 'Access denied: Admins only');
    }
}

const authorRoleWare = (req, res, next) => {
    const userRole = req.user.role; // Assuming user role is attached to req.user by jwtAuth middleware

    if (userRole === 'author') {
        next(); // Allow access for author and admin users
    } else {
        return apiResponse(res, false, HTTP_STATUS_CODES.FORBIDDEN, 'Access denied: Authors and Admins only');
    }
}


const readerRoleWare = (req, res, next) => {
    const userRole = req.user.role; // Assuming user role is attached to req.user by jwtAuth middleware

    if (userRole === 'reader') {
        next(); // Allow access for reader users
    } else {
        return apiResponse(res, false, HTTP_STATUS_CODES.FORBIDDEN, 'Access denied: Readers only');
    }
}


module.exports = {
    adminRoleWare,
    authorRoleWare,
    readerRoleWare
};