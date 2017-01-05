const express = require('express');
const User = require('../../../models/User');
const retrieveError = require('../../../tools/retrieveError');

const router = express.Router();

router.post('/', (req, res) => {
  const user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.facebook = req.body.facebook;
  user.tokens = req.body.tokens;
  user.gender = req.body.gender;
  user.age = req.body.age;
  user.pictureUrl = req.body.pictureUrl;
  user.type = req.body.type;
  user.academic = req.body.academic;
  user.worker = req.body.worker;

  user.save((err, user) => {
    if (err) {
      res.status(400);
      return res.json({
        success: false,
        errors: retrieveError(23, err),
      });
    }
    res.json({
      success: true,
      message: 'User sign up successfull!',
      data: {
        token: user.generateToken(),
      },
    });
  });
});

module.exports = router;
