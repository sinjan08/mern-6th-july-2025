const { body } = require('express-validator');

const blogValidationSchema = [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('content').not().isEmpty().withMessage('Content is required'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array of strings')
        .custom((value) => {
            if (value.some(tag => typeof tag !== 'string')) {
                throw new Error('Each tag must be a string');
            }
            return true;
        }),
    body('isPublished')
        .optional()
        .isBoolean()
        .withMessage('isPublished must be a boolean value'),
]

module.exports = {
    blogValidationSchema
};