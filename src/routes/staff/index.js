const express = require('express');

const router = express.Router();

router.use('/activities', require('./activities'));

module.exports = router;
