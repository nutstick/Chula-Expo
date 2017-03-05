const express = require('express');
const User = require('../../../models/User');
const retrieveError = require('../../../tools/retrieveError');

const router = express.Router();

/**
 * Sign Up
 * Access at POST https://localhost:8080/api/signup
 * @param {email} email - Email.
 * @param {password} [password] - Password.
 * @param {string} [facebook] - Facebook ID.
 * @param {string} [google] - Google ID.
 * @param {[Object]} [tokens] - Array of token from provider
 * @param {string} name - Name.
 * @param {string} gender - Gender, only allow [Male, Female, Other].
 * @param {number} age - Age.
 * @param {string} profile - Prfile picture url.
 * @param {string} type - User type, only allow [Academic, Worker Staff].
 * @param {string} [academicLevel] - Academic Level (required with `academic` type).
 * @param {string} [academicYear] - Year of yor education (required with `academic` type).
 * @param {string} [academicSchool] - School name (required with `academic` type).
 * @param {string} [workerJob] - Job (required with `worker` type).
 * @param {string} [tags] - Interesting tags include interest faculty.
 *    In each tag seperate by `,`(`abc,bcd,cde`).
 * @param {string} [staff] - Staff Type, only allow [Staff, Scanner, Admin]
 *    (required with `staff` type).
 * @param {string} [registationCode] - Registation Code (needed when need grant user permission).
 * @param {ObjectId} [zone] - Staff's Zone (required with `staff` type and `Scanner` or `Staff`).
 *
 * @return {boolean} success - Successful querying flag.
 * @return {User} results - Created User.
 * @return {Token} results.token - Generated token.
 */
router.post('/', (req, res) => {
  // Reject `admin` field if not correct registration code

  if (req.body.type === 'Staff' && req.body.staff === 'Admin' && req.body.registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
    return res.sendError(11);
  }
  if (req.body.type === 'Staff' && req.body.staff === 'Staff' && req.body.registrationCode !== process.env.STAFF_REGISTRATION_CODE) {
    return res.sendError(11);
  }
  if (req.body.type === 'Staff' && req.body.staff === 'Scanner' && req.body.regisationCode !== process.env.SCANNER_REGISTRATION_CODE) {
    return res.sendError(11);
  }

  // Create a new instance of the User model
  const user = new User();

  // Set field value (comes from the request)
  user.email = req.body.email;
  user.password = req.body.password;
  user.facebook = req.body.facebook;
  user.google = req.body.google;
  user.tokens = req.body.tokens;

  user.name = req.body.name;
  user.gender = req.body.gender;
  user.age = req.body.age;
  user.profile = req.body.profile;
  user.type = req.body.type;
  if (req.body.type === 'Academic' && req.body.academicLevel && req.body.academicYear && req.body.academicSchool) {
    user.academic = {
      level: req.body.academicLevel,
      year: req.body.academicYear,
      school: req.body.academicSchool
    };
    if (req.body.tags) {
      user.tags = req.body.tags.split(',');
    }
  }
  if (req.body.type === 'Worker' && req.body.workerJob) {
    user.worker = {
      job: req.body.workerJob
    };
    if (req.body.tags) {
      user.tags = req.body.tags.split(',');
    }
  }
  if (req.body.type === 'Staff' && req.body.staff) {
    if (req.body.staff !== 'Admin' && req.body.zone) {
      user.staff = {
        staffType: req.body.staff,
        zone: req.body.zone
      };
    } else {
      user.staff = {
        staffType: req.body.staff
      };
    }
  }

  user.save((err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    res.json({
      success: true,
      message: 'User sign up successfull!',
      results: {
        token: user.generateToken(),
      },
    });
  });
});

module.exports = router;
