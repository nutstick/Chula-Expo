const express = require('express');
const passport = require('passport');

const router = express.Router();

/**
 * Sign Up
 * Access at POST https://localhost:8080/api/signup
 * @param {email} email - Email.
 * @param {password} password - Password.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {User} results.
 * @return {Token} results.token - Generated token.
 */
router.post('/', (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    // Handle error from save
    return res.sendError(37);
  }

  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.sendError(4);
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) {
        return res.sendError(5, err);
      }
      res.json({
        success: true,
        message: 'User log in successfull!',
        results: {
          token: user.generateToken(),
        },
      });
    });
  })(req, res, next);
});


module.exports = router;
