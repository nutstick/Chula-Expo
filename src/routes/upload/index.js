const express = require('express');

const router = express.Router();

router.use('/img', require('./img'));

module.exports = router;
