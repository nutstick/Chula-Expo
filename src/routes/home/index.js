const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  let menuList = ['Home', 'Login', 'Sign Up'];
  if (req.user && req.user.admin === 'Admin') {
    menuList = ['Home', 'Activity', 'Logout'];
  }
  res.render('home/home.view.ejs', {
    menuList
  });
});

module.exports = router;
