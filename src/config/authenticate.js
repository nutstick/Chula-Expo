// let passport = null;
const passport = require('passport');

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  },

  isAuthenticatedByToken: (req, res, next) => {
    passport.authenticate('jwt', (err, user) => {
      if (err) {
        return res.sendError(5, err);
      }
      if (!user) {
        return res.sendError(4);
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        return next();
      });
    })(req, res, next);
  },

  deserializeToken: (req, res, next) => {
    passport.authenticate('jwt', (err, user) => {
      if (err) {
        return res.sendError(5, err);
      }
      if (!user) {
        return next();
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        return next();
      });
    })(req, res, next);
  },

  isAdmin: (req, res, next) => {
    if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Admin') {
      next();
    } else {
      res.sendError(4);
    }
  },

  isStaff: (req, res, next) => {
    if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Admin') {
      next();
    } if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Staff') {
      next();
    } else {
      res.sendError(4);
    }
  },
};
