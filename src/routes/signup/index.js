const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('signup/signup.view.ejs');
});

module.exports = router;
