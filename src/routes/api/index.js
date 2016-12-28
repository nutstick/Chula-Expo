const express = require('express');

const router = express.Router();

router.use('/users', require('./users'));

router.get('/', (req, res) => {
  res.send('Welcaome to Official Chula Expo API.');
});

module.exports = router;
