const express = require('express');
const BlogController = require('../controller/BlogController');
const { authorRoleWare, readerRoleWare, adminRoleWare } = require('../middleware/roleWare');
const jwtAuth = require('../middleware/jwtAuth');
const { blogValidationSchema } = require('../rules/blogRules');
const router = express.Router();

// Create a new blog post
router.post('/create', jwtAuth, authorRoleWare, blogValidationSchema, BlogController.createBlog);
router.patch('/update/:id', jwtAuth, authorRoleWare, blogValidationSchema, BlogController.updateBlog);
router.put('/publish-status/update/:id', jwtAuth, authorRoleWare, BlogController.updatePublishStatus);
router.get('/author-blogs', jwtAuth, authorRoleWare, BlogController.getAuthorBlogs);
router.get('/all', jwtAuth, readerRoleWare, BlogController.getAllBlogs);
router.get('/analytics', jwtAuth, adminRoleWare, BlogController.adminAnalytics);
router.delete('/delete/:id', jwtAuth, authorRoleWare, BlogController.deleteBlog);

module.exports = router;