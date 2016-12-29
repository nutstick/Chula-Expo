const express = require('express');

const router = express.Router();

/**
 * Users API
 */
router.use('/users', require('./users'));

/**
 * Welcome Message
 * Access at GET http://localhost:8080/api
 */
router.get('/', (req, res) => {
  res.send('Welcaome to Official Chula Expo API.');
});

module.exports = router;
