const express = require('express');

const router = express.Router();

router.use('/activities', require('./activities'));
router.use('/zones', require('./zones'));

module.exports = router;
