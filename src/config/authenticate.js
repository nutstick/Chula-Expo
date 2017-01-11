const passport = require('passport');
const retrieveError = require('../tools/retrieveError');

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  },

  isAuthenticatedByToken: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          errors: retrieveError(22, err)
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return next();
      });
    })(req, res, next);
  },

  isAdmin: (req, res, next) => {
    if (req.user && req.user.admin === 'Admin') {
      next();
    } else {
      res.send(401, 'Unauthorized');
    }
  },

  isStaff: (req, res, next) => {
    if (req.user && (req.user.admin === 'Staff' || req.user.admin === 'Admin')) {
      next();
    } else {
      res.send(401, 'Unauthorized');
    }
  },
};
