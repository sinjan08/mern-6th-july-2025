const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const blogRoutes = require('./blogRoutes');

router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);

module.exports = router;