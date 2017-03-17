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
 * ActivityChecks API
 */
router.use('/activitychecks', require('./activitychecks'));

/**
 * Login API
 */
router.use('/login', require('./login'));

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
 * Comment API
*/
router.use('/comments', require('./comments'));

/**
 * place API
*/
router.use('/places', require('./places'));
router.use('/zones/:zoneid/places', require('./places'));
/**
 * zone API
*/
router.use('/zones', require('./zones'));
/**
 * room API
*/
router.use('/rooms', require('./rooms'));
/**
 * Welcome Message
 * Access at GET http://localhost:8080/api
 */
router.get('/', (req, res) => {
  res.send('Welcome to Official Chula Expo API.');
});

module.exports = router;
