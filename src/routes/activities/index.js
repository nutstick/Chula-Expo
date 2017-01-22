const express = require('express');
const { isAuthenticated, isStaff } = require('../../config/authenticate');
const { menuList } = require('../../tools');

const router = express.Router();

router.use(isAuthenticated, isStaff);

router.get('/', menuList, (req, res) => {
  let menuList = ['Home', 'Login', 'Sign Up'];
  if (req.user && req.user.admin === 'Admin') {
    menuList = ['Home', 'Activity', 'Logout'];
  }
  console.log(req.menuList);
  res.render('staff/activities/activities.view.ejs', {
    menuList: req.menuList,
    selected: 'Activity'
  });
});

module.exports = router;
