const express = require('express');
const { User } = require('../../../models');
const { retrieveError } = require('../../../tools/retrieveError');
const { isAuthenticatedByToken } = require('../../../config/authenticate');

const router = express.Router();

const avaliableFields = ['_id', 'name', 'email', 'age', 'gender', 'profile', 'type', 'academic', 'worker', 'staff'];

router.use(isAuthenticatedByToken);

/**
 * Get user by token
 * Access at GET http://localhost:8080/api/me
 * @param {string} fields
 * Accessible field '_id', name', 'email', 'age', 'gender', 'profile', 'type',
 *    'academic', 'worker', 'staff'.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {User} results - Token owner results.
 */
router.get('/', (req, res) => {
  let fields = [];
  // Fields selecting query
  if (req.query.fields) {
    fields = req.query.fields.split(',')
      .filter(f => avaliableFields.find(field => f === field));
  }
  if (fields.length === 0) {
    fields = avaliableFields;
  }
  // Create query from filter
  User.findById(req.user.id)
    .select(fields.join(' '))
    .exec((err, me) => {
      if (err) {
        return res.json({
          success: false,
          errors: retrieveError(5, err)
        });
      }
      res.json({
        success: true,
        results: me,
      });
    });
});

/**
 * Update token owner user infomation
 * Access at GET http://localhost:8080/api/me
 * @param {string} [name]
 * @param {string} [email]
 * @param {number} [age]
 * @param {string} [gender]
 * @param {string} [picture]
 * @param {string} [type]
 * @param {number} [ัyear]
 * @param {string} [ัschool]
 * @param {string} [ัcompony]
 *
 * @return {boolean} success - Successful request.
 * @return {string} message - Successful message.
 * @return {User} results - Updated user.
 */
router.put('/', (req, res) => {
  if (req.body.name) {
    req.user.name = req.body.name;
  }
  if (req.body.email) {
    req.user.email = req.body.email;
  }
  if (req.body.age) {
    req.user.age = Number.parseInt(req.body.age, 10);
  }
  if (req.body.gender) {
    req.user.gender = req.body.gender;
  }
  if (req.body.picture) {
    req.user.picture = req.body.picture;
  }
  if (req.body.type) {
    req.user.type = req.body.type;
  }
  if (req.user.type === 'Academic') {
    if (req.body.year) {
      req.user.academic.year = Number.parseInt(req.body.year, 10);
    }
    if (req.body.school) {
      req.user.academic.school = req.body.school;
    }
    if (!req.user.academic.school || !req.user.academic.year) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(27, 'Missing Academic infomation (year, school) of tager user.'),
      });
    }
  } else if (req.user.type === 'Worker') {
    if (req.body.company) {
      req.user.worker.company = req.body.company;
    }
    if (!req.user.worker.company) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(27, 'Missing Work infomation (company) of target user.'),
      });
    }
  }

  // Save User and check for error
  req.user.save((err, _user) => {
    // Handle error from save
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }

    res.status(202).json({
      success: true,
      message: 'Update user infomation successfull',
      results: _user,
    });
  });
});

/**
 * Get account infomation
 * Access at GET http://localhost:8080/api/me/account
 * @return {boolean} success - Successful request flag.
 * @return {Object} results - Results.
 * @return {string} results.admin - Admin type.
 * @return {string} results.email - User's email.
 * @return {string} results.facebook - User's facebook accessId.
 */
router.get('/account', (req, res) => {
  res.json({
    success: true,
    results: {
      admin: req.user.admin,
      email: req.user.email,
      facebook: req.user.facebook,
    },
  });
});

/**
 * Get games that user played
 * Access at GET http://localhost:8080/api/me/games
 * @return {boolean} success - Successful request flag.
 * @return {Object} results - Results.
 * @return {number} results.totalScore - Total score of all games that user played.
 * @return {Game[]} results.pending - Pending paay games.
 * @return {Game[]} results.passed - Passed games.
 */
router.get('/games', (req, res) => {
  res.json({
    success: true,
    results: req.user.game,
  });
});

/**
 * Get all bookmark activities
 * Access at GET http://localhost:8080/api/me/bookmark_activities
 */
router.get('/bookmark_activities', (req, res) => {});

router.use('/reserved_rounds', require('./reserved_rounds'));

module.exports = router;
