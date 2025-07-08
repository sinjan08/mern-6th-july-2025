const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    tags: {
        type: [String],
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    versionKey: false
})

const Blog = mongoose.model('blog', BlogSchema);
module.exports = Blog;