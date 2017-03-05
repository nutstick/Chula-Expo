const express = require('express');

const router = express.Router();

/**
 * API Route
 */
router.use('/api', require('./api'));

/**
 * Authenticate Route
 */
// router.use('/login', require('./login'));
// router.use('/logout', require('./logout'));
// router.use('/signup', require('./signup'));

// router.use('/activities', require('./activities'));
router.use('/upload', require('./upload'));

router.get('*', require('./home'));

module.exports = router;
