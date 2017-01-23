const express = require('express');

const router = express.Router();

/**
 * Users API
 */
router.use('/users', require('./users'));

/**
 * Signup API
 */
router.use('/signup', require('./signup'));

/**
 * Me API
 */
router.use('/me', require('./me'));

/**
 * Token API
 */
router.use('/token', require('./token'));

/**
 * Activities API
*/
router.use('/activities', require('./activities'));

/**
 * Rounds API
*/
router.use('/rounds', require('./rounds'));

/**
 * Ticket API
*/
router.use('/tickets', require('./tickets'));

/**
 * Facility API
*/
router.use('/facilities', require('./facilities'));
/**
=======
>>>>>>> upstream/master
 * Welcome Message
 * Access at GET http://localhost:8080/api
 */
router.get('/', (req, res) => {
  res.send('Welcaome to Official Chula Expo API.');
});

module.exports = router;
