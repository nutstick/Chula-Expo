const express = require('express');
const { User } = require('../../../models');
const { retrieveError } = require('../../../tools/retrieveError');
const { isAuthenticatedByToken } = require('../../../config/authenticate');

const router = express.Router();

const avaliableFields = ['_id', 'name', 'email', 'age', 'gender', 'profile', 'type', 'academic', 'worker', 'staff', 'tags'];

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
router.get('/', isAuthenticatedByToken, (req, res) => {

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


router.get('/where', (req, res) => {
  res.json({
    success: true,
    results: {
      text: {
        en: 'no information',
        th: 'อยู่นอกพื้นที่จัดงาน'
      }
    }
  });
});

/**
 * Update token owner user infomation
 * Access at PUT http://localhost:8080/api/me
 * @param {email} email - Email.
 * @param {password} [password] - Password.
 * @param {string} name - Name.
 * @param {string} gender - Gender, only allow [Male, Female].
 * @param {number} age - Age.
 * @param {string} profile - Prfile picture url.
 * @param {string} type - User type, only allow [Academic, Worker Staff].
 * @param {string} [academicLevel] - Academic Level (required with `academic` type).
 * @param {string} [academicYear] - Year of yor education (required with `academic` type).
 * @param {string} [academicSchool] - School name (required with `academic` type).
 * @param {string} [workerJob] - Job (required with `worker` type).
 * @param {string} [staff] - Staff Type, only allow [Staff, Scanner, Admin]
 *    (required with `staff` type).
 * @param {ObjectId} [zone] - Staff's Zone (required with `staff` type and `Scanner` or `Staff`).
 *
 * @return {boolean} success - Successful request.
 * @return {string} message - Successful message.
 * @return {User} results - Updated user.
 */
router.put('/', isAuthenticatedByToken, (req, res) => {
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
  if (req.body.profile) {
    req.user.profile = req.body.profile;
  }
  if (req.body.type) {
    req.user.type = req.body.type;
  }
  if (req.body.type === 'Academic' && req.body.academicLevel && req.body.academicYear && req.body.academicSchool) {
    req.user.academic.level = req.body.academicLevel;
    req.user.academic.year = req.body.academicYear;
    req.user.academic.school = req.body.academicSchool;
  }
  if (req.body.type === 'Worker' && req.body.workerJob) {
    req.user.worker.job = req.body.workerJob;
  }
  if (req.body.type === 'Staff' && req.body.staff) {
    if (req.body.staff !== 'Admin' && req.body.zone) {
      req.user.staff.staffType = req.body.staff;
      req.user.staff.zone = req.body.zon;
    } else {
      req.user.staff.staffType = req.body.staff;
    }
  }
  if (req.body.tags) {
    req.user.tags = req.body.tags.split(',');
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

    return res.status(202).json({
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
router.get('/account', isAuthenticatedByToken, (req, res) => {
  res.json({
    success: true,
    results: {
      email: req.user.email,
      facebook: req.user.facebook,
      google: req.user.google,
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
router.get('/games', isAuthenticatedByToken, (req, res) => {
  res.json({
    success: true,
    results: req.user.game,
  });
});

/**
 * Get all bookmark activities
 * Access at GET http://localhost:8080/api/me/bookmark_activities
 */
router.get('/bookmark_activities', isAuthenticatedByToken, (req, res) => {});

router.use('/reserved_rounds', require('./reserved_rounds'));

module.exports = router;
