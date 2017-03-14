// let passport = null;
const passport = require('passport');
const jwt = require('json-web-token');

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
          return res.sendError(5, err);
        }
        return next();
      });
    })(req, res, next);
  },

  deserializeToken: (req, res, next) => {
    let extractHeader = null;
    if (req.headers.authorization) {
      extractHeader = req.headers.authorization.split(' ');
    }
    if (extractHeader !== null && extractHeader[0] === 'JWT') {
      jwt.decode(process.env.JWT_SECRET, extractHeader[1], (err, decodedPayload, decodedHeader) => {
        if (err) {
          return res.sendError(5, err);
        } else {
          req.user = decodedPayload.sub;
          next();
        }
      })
    } else {
      next();
    }
  },

  isAdmin: (req, res, next) => {
    if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Admin') {
      return next();
    }
    return res.sendError(4);
  },

  isStaff: (req, res, next) => {
    if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Staff') {
      return next();
    } else if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Admin') {
      return next();
    }
    return res.sendError(4);
  },

  isScanner: (req, res, next) => {
    if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Staff') {
      return next();
    } else if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Admin') {
      return next();
    } else if (req.user && req.user.type === 'Staff' && req.user.staff.staffType === 'Scanner') {
      return next();
    }
    console.log('Can\'t Scanner', req.user.type, req.user.staff.staffType);
    return res.sendError(4);
  }
};
