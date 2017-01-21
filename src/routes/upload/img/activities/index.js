const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/img/activity');
  },
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(null, `${raw.toString('hex')}${Date.now()}.${mime.extension(file.mimetype)}`);
    });
  }
});
const router = express.Router();

router.post('/', multer({ storage, limits: { fileSize: 4000000 } }).array('picture'), (req, res, next) => {
  return res.json({
    success: true,
    results: {
      images: req.files.map(file => file.filename),
    }
  });
});

module.exports = router;
