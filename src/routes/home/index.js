const express = require('express');
const path = require('path');
const { isAuthenticated, isStaff } = require('../../config/authenticate');
const { menuList } = require('../../tools');

const router = express.Router();

// router.use(isAuthenticated, isStaff);

router.get('*', menuList, (req, res) => {
  res.sendFile(path.join(__dirname, '/home.view.html'));
  // res.render('home/home.view.html', {
  //   menuList: req.menuList,
  //   selected: 'Home'
  // });
});

module.exports = router;
