const { body } = require('express-validator');

const registerValidationSchema = [
    body('name')
        .notEmpty()
        .withMessage('Name is required'),

    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .bail()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .bail()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('role')
        .optional()
        .isIn(['admin', 'author', 'reader'])
        .withMessage('Role must be one of: admin, author, or reader'),
];

const loginValidationSchema = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .bail()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .bail()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

module.exports = {
    registerValidationSchema,
    loginValidationSchema
};
