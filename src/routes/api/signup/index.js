const express = require('express');
const User = require('../../../models/User');
const retrieveError = require('../../../tools/retrieveError');

const router = express.Router();

/**
 * Sign Up
 * Access at POST https://localhost:8080/api/signup
 * @param {string} name
 * @param {string} email
 * @param {string} [facebook]
 * @param {string} [tokens]
 * @param {string} gender
 * @param {name} age
 * @param {string} pictureUrl
 * @param {string} type
 * @param {string} [school]
 * @param {number} [year]
 * @param {string} [company]
 *
 * @return {boolean} success
 * @return {string} message.
 * @return {Token} results - Authenticated token.
 */
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
  user.academic.year = req.body.year;
  user.academic.school = req.body.school;
  user.worker.company = req.body.company;

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
      results: {
        token: user.generateToken(),
      },
    });
  });
});

module.exports = router;
