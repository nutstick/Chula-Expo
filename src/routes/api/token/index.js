const express = require('express');
const User = require('../../../models/User');
const deserializeToken = require('../../../config/authenticate').deserializeToken;
const retrieveError = require('../../../config/retrieveError');

const router = express.Router();

router.get('/', deserializeToken, (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return res.json({
        success: false,
        erros: retrieveError(5, err)
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
