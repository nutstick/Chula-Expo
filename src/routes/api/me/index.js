const express = require('express');
const _ = require('lodash');
const User = require('../../../models/User');
const deserializeToken = require('../../../config/authenticate').deserializeToken;
const retrieveError = require('../../../tools/retrieveError');

const router = express.Router();

const fields = ['name', 'email', 'age', 'gender', 'pictureUrl', 'type', 'academic', 'worker'];

/**
 * Get user by token
 * Access at GET http://localhost:8080/api/me
 * @param fields {String}
 */
router.get('/', deserializeToken, (req, res) => {
  const query = User.findById(req.user.id);

  // fields query
  const select = _.intersect(req.query.fields.split(','), fields);
  query.select(select.join(' '));

  query.exec((err, me) => {
    if (err) {
      return res.json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    res.json(me);
  });
});

module.exports = router;
