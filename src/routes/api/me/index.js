const express = require('express');
const User = require('../../../models/User');
const deserializeToken = require('../../../config/authenticate').deserializeToken;
const retrieveError = require('../../../config/retrieveError');

const router = express.Router();

router.get('/', deserializeToken, (req, res) => {
  const query = User.findById(req.user.id);

  query.select('name email age gender pictureUrl academic worker');

  query.exec((err, me) => {
    if (err) {
      return res.json({
        success: false,
        erros: retrieveError(5, err)
      });
    }
    res.json(me);
  });
});

module.exports = router;
