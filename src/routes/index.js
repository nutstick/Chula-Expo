const express = require('express');

const router = express.Router();

/**
 * API Route
 */
router.use('/api', require('./api'));

/**
 * Authenticate Route
 */
router.use('/upload', require('./upload'));

module.exports = router;
