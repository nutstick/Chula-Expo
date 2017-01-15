const express = require('express');
const multer = require('multer');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/uploads/activities');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});

const router = express.Router();

router.use(isAuthenticatedByToken, isStaff);

router.get('/', (req, res) => {
  res.render('activities/activities.view.ejs', {
    user: req.user
  });
});

module.exports = router;
