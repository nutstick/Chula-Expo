const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('signup/signup.view.ejs');
});

module.exports = router;
