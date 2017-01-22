const express = require('express');
const { isAuthenticated } = require('../../config/authenticate');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', (req, res) => {
  res.render('account/account.view.ejs');
});

module.exports = router;
