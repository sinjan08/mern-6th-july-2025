const { validationResult } = require('express-validator');
const { apiResponse, HTTP_STATUS_CODES } = require('../utils/responseHelper'); // Assuming you have a utility for API responses
const Blog = require('../models/BlogModel');

class BlogController {
    async createBlog(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const firstError = errors.array()[0].msg;
                return apiResponse(res, false, HTTP_STATUS_CODES.BAD_REQUEST, firstError);
            }
            const { title, content, tags, isPublished } = req.body;
            const blogPost = new Blog({
                title,
                content,
                author: req.user._id, // Use the authenticated user's ID
                tags,
                isPublished
            });
            await blogPost.save();
            return apiResponse(res, true, HTTP_STATUS_CODES.CREATED, 'Blog post created successfully', blogPost);
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }

    async getAuthorBlogs(req, res) {
        try {
            const loggedInAuthor = req.user?._id; // Assuming user is set in the request by authentication middleware
            const blogs = await Blog.find(
                { author: loggedInAuthor },
                { _id: 1, title: 1, content: 1, tags: 1, isPublished: 1 }
            )
                .populate('author', 'name')
                .sort({ createdAt: -1 }); // -1 for descending (newest first), 1 for ascending

            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Blogs retrieved successfully', blogs);
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }


    async updateBlog(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const firstError = errors.array()[0].msg;
                return apiResponse(res, false, HTTP_STATUS_CODES.BAD_REQUEST, firstError);
            }
            const { id } = req.params;
            const { title, content, tags, isPublished } = req.body;

            const blogPost = await Blog.findByIdAndUpdate(
                id,
                { title, content, tags, isPublished },
                { new: true }
            );

            if (!blogPost) {
                return apiResponse(res, false, HTTP_STATUS_CODES.NOT_FOUND, 'Blog post not found');
            }
            if (blogPost.author.toString() !== req.user._id.toString()) {
                return apiResponse(res, false, HTTP_STATUS_CODES.FORBIDDEN, 'You are not authorized to update this blog post');
            }

            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Blog post updated successfully', blogPost);
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }

    async updatePublishStatus(req, res) {
        try {
            const { id } = req.params;
            const { isPublished } = req.body;

            if (typeof isPublished !== 'boolean') {
                return apiResponse(res, false, HTTP_STATUS_CODES.BAD_REQUEST, 'isPublished must be a boolean value');
            }

            const blogPost = await Blog.findByIdAndUpdate(
                id,
                { isPublished },
                { new: true }
            );

            if (!blogPost) {
                return apiResponse(res, false, HTTP_STATUS_CODES.NOT_FOUND, 'Blog post not found');
            }
            if (blogPost.author.toString() !== req.user._id.toString()) {
                return apiResponse(res, false, HTTP_STATUS_CODES.FORBIDDEN, 'You are not authorized to update this blog post');
            }

            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Blog post publish status updated successfully', blogPost);
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }

    async deleteBlog(req, res) {
        try {
            const { id } = req.params;
            const blogPost = await Blog.findByIdAndDelete(id);
            if (!blogPost) {
                return apiResponse(res, false, HTTP_STATUS_CODES.NOT_FOUND, 'Blog post not found');
            }
            if (blogPost.author.toString() !== req.user._id.toString()) {
                return apiResponse(res, false, HTTP_STATUS_CODES.FORBIDDEN, 'You are not authorized to delete this blog post');
            }
            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Blog post deleted successfully');
        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }


    async getAllBlogs(req, res) {
        try {
            const { tags, author, search, items_per_page = 10, page = 1 } = req.query;

            const limit = parseInt(items_per_page);
            const skip = (parseInt(page) - 1) * limit;

            const matchStage = { isPublished: true };

            if (tags) {
                matchStage.tags = { $in: tags.split(',') };
            }

            if (author) {
                matchStage.author = author;
            }

            if (search) {
                matchStage.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ];
            }

            const blogs = await Blog.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author'
                    }
                },
                { $unwind: '$author' },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        content: 1,
                        tags: 1,
                        author: {
                            _id: '$author._id',
                            name: '$author.name'
                        },
                        createdAt: 1
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit }
            ]);

            // Get total count for pagination info
            const totalCountResult = await Blog.aggregate([
                { $match: matchStage },
                { $count: 'total' }
            ]);


            const total = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
            const totalPages = Math.ceil(total / limit);

            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Blogs retrieved successfully', {
                pagination: {
                    total,
                    totalPages,
                    currentPage: parseInt(page),
                    itemsPerPage: limit
                },
                blogs
            });

        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }


    async adminAnalytics(req, res) {
        try {
            // Total number of blogs
            const totalBlogs = await Blog.countDocuments();

            // Total number of unique authors
            const totalAuthors = (await Blog.distinct('author')).length;

            // Number of blogs per author
            const blogsByAuthor = await Blog.aggregate([
                {
                    $group: {
                        _id: '$author',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'author'
                    }
                },
                { $unwind: '$author' },
                {
                    $project: {
                        _id: 0,
                        authorId: '$_id',
                        authorName: '$author.name',
                        count: 1
                    }
                },
                { $sort: { count: -1 } } // Optional: sort by most blogs
            ]);

            // Most used tags in published blogs
            const mostUsedTags = await Blog.aggregate([
                { $match: { isPublished: true } }, // Only published blogs
                { $unwind: '$tags' },              // Flatten tags array
                {
                    $group: {
                        _id: '$tags',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        tag: '$_id',
                        count: 1
                    }
                },
                { $sort: { count: -1 } } // Most used tags first
            ]);

            return apiResponse(res, true, HTTP_STATUS_CODES.OK, 'Admin analytics retrieved successfully', {
                totalBlogs,
                totalAuthors,
                blogsByAuthor,
                mostUsedTags
            });

        } catch (error) {
            return apiResponse(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
        }
    }

}

module.exports = new BlogController();