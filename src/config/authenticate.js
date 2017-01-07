const jwt = require('jsonwebtoken');
const User = require('../models/User');
const retrieveError = require('../tools/retrieveError');

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  },

  isAdmin: (req, res, next) => {
    if (req.user && req.user.admin === 'Admin') {
      next();
    } else {
      res.send(401, 'Unauthorized');
    }
  },

  deserializeToken: (req, res, next) => {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
      // no token provided
      return res.status(401).json({
        success: false,
        errors: retrieveError(22)
      });
    }

    // verifies secret and checks exp
    jwt.verify(token, process.env.SESSION_SECRET, (err, { id }) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      }

      User.findById(id, (err, user) => {
        if (err) {
          return res.status(500).json({
            success: false,
            errors: retrieveError(5)
          });
        }
        if (!user) {
          return res.status(403).json({
            success: false,
            errors: retrieveError(24, 'No match user. Failed to authenticate token.')
          });
        }
        req.user = user;
        next();
      });
    });
  },
};
