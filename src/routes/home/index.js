const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const menu = ['home', 'about', 'login'];
  res.render('home/home.view.ejs', {
    menu
  });
});

module.exports = router;
