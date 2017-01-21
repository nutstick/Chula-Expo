const express = require('express');
const { isAuthenticated, isStaff } = require('../../../config/authenticate');

const router = express.Router();

router.use(isAuthenticated, isStaff);

router.get('/', (req, res) => {
  let menuList = ['Home', 'Login', 'Sign Up'];
  if (req.user && req.user.admin === 'Admin') {
    menuList = ['Home', 'Activity', 'Logout'];
  }
  res.render('staff/activities/activities.view.ejs', {
    menuList
  });
});

module.exports = router;
