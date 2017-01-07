const express = require('express');
const passport = require('passport');
const User = require('../../../models/User');
const retrieveError = require('../../../tools/retrieveError');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
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
