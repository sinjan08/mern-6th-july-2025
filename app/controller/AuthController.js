const { validationResult } = require('express-validator');
const { apiResponse, HTTP_STATUS_CODES } = require('../utils/responseHelper');
const bcryptjs = require('bcryptjs');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

class AuthController {
    async register(req, res) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const firstError = errors.array()[0].msg;
                return apiResponse(res, false, HTTP_STATUS_CODES.BAD_REQUEST, firstError);
            }
            const { name, email, password, role } = req.body;
            const user = await User.findOne({ email });
            if (user) {
                return apiResponse(res, false, HTTP_STATUS_CODES.CONFLICT, 'Email already exists');
            }
            const hashedPassword = await bcryptjs.hash(password, 10);
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: role || 'reader' // Default to 'reader' if no role is provided
            });
            await newUser.save();
            const userResponse = {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            };

            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'User registered successfully', userResponse);
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }


    async login(req, res) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const firstError = errors.array()[0].msg;
                return apiResponse(res, false, HTTP_STATUS_CODES.BAD_REQUEST, firstError);
            }
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return apiResponse(res, false, HTTP_STATUS_CODES.NOT_FOUND, 'User not found');
            }
            const isPasswordValid = await bcryptjs.compare(password, user.password);
            if (!isPasswordValid) {
                return apiResponse(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, 'Invalid password');
            }
            const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const userResponse = {
                token,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Login successful', userResponse);
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }


    async getUserList(req, res) {
        try {
            const users = await User.find({ role: { $ne: 'admin' } }, { _id: 1, name: 1, email: 1, role: 1 }); // Correct field projection
            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'User list retrieved successfully', users);
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }

    async logout(req, res) {
        try {
            // destroying the jwt token
            req.logout();
            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Logout successful');
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }
}

module.exports = new AuthController();
