const express = require('express');
const { User } = require('../../../models');
const { isAuthenticatedByToken } = require('../../../config/authenticate');
const retrieveError = require('../../../tools/retrieveError');

const router = express.Router();

router.use(isAuthenticatedByToken);

router.get('/', isAuthenticatedByToken, (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return res.json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    res.json({
      success: true,
      data: {
        token: user.generateToken()
      }
    });
  });
});

module.exports = router;
