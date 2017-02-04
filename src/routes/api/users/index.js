const express = require('express');
const User = require('../../../models/User');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');
const { retrieveError } = require('../../../tools/retrieveError');

const router = express.Router();


router.use(isAuthenticatedByToken, isStaff);
/**
 * Get User by specific ID
 * Access at GET http://localhost:8080/api/users/:id
 */
router.get('/:id', (req, res) => {
  // Get User from instance User model by ID
  User.findById(req.params.id, (err, user) => {
    if (err) {
      // Handle error from User.findById
      return res.sendError(5, err);
    }
    const params = {
      name: user.name,
      email: user.email,
      gender: user.gender,
    };
    res.json({
      success: true,
      results: params,
    });
  });
});

router.get('/', (req, res) => {
  const filters = {};
  if (req.query.name) {
    filters.name = req.query.name;
  }
  if (req.query.age) {
    filters.age = req.query.age;
  } else if (req.query.age_gt) {
    filters.age = { $gt: req.query.age_gt, $lt: req.query.age_lt };
  }
  if (req.query.type) {
    filters.type = req.query.type;
  }
  if (req.query.academic) {
    filters.academic = req.query.academic;
  }
  if (req.query.worker) {
    filters.worker = req.query.worker;
  }
  try {
    let query = User.find(filters);
    const sort = {};
    if (req.query.sort) {
      req.query.sort.split(',').forEach((sortField) => {
        if (sortField[0] === '-') {
          sort[sortField.substr(1)] = -1;
        } else {
          sort[sortField.substr(0)] = 1;
        }
      });
    }
    if (sort) {
      query.sort(sort);
    }
    if (req.query.select) {
      query.select(req.query.select);
    }
    if (req.query.limit) {
      query = query.limit(parseInt(req.query.limit, 10));
    }
    if (req.query.skip) {
      query = query.skip(parseInt(req.query.skip, 10));
    }
    query.exec((err, users) => {
      if (err) {
        res.sendError(5, err);
      } else {
        res.json({
          success: true,
          results: users,
        });
      }
    });
  } catch (error) {
    res.sendError(5, error);
  }
});


/**
 * Create User
 * Access at POST http://staff.chulaexpo.com/api/users
 * @param {email} email - Email.
 * @param {password} [password] - Password.
 * @param {string} [facebook] - Facebook ID.
 * @param {string} [google] - Google ID.
 * @param {[Object]} [token] - Array of token from provider
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
 * @return {boolean} success - Successful querying flag.
 * @return {User} results - Created User.
 */
router.post('/', (req, res) => {
  // Create a new instance of the User model
  const user = new User();

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
  }
  if (req.body.type === 'Worker' && req.body.workerJob) {
    user.worker = {
      job: req.body.workerJob
    };
  }
  if (req.body.type === 'Staff' && req.body.staffT) {
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
  // Save User and check for error
  user.save((err, _user) => {
    if (err) {
      // Handle error from save
      return res.sendError(5, err);
    }

    res.status(201).json({
      success: true,
      results: _user
    });
  });
});

/**
 * PUT Edit user of specific ID
 * Access at PUT http://localhost:8080/api/users/:id
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
 * @return {boolean} success - Successful querying flag.
 * @return {User} results - Created User.
 */
router.put('/:id', (req, res) => {
  const user = {};

  if (req.body.email) {
    user.email = req.body.email;
  }
  if (req.body.password) {
    user.password = req.body.password;
  }

  if (req.body.name) {
    user.name = req.body.name;
  }
  if (req.body.gender) {
    user.gender = req.body.gender;
  }
  if (req.body.age) {
    user.age = req.body.age;
  }
  if (req.body.profile) {
    user.profile = req.body.profile;
  }
  if (req.body.type) {
    user.type = req.body.type;
  }
  if (req.body.type === 'Academic' && req.body.academicLevel && req.body.academicYear && req.body.academicSchool) {
    user.academic = {
      level: req.body.academicLevel,
      year: req.body.academicYear,
      school: req.body.academicSchool
    };
  }
  if (req.body.type === 'Worker' && req.body.workerJob) {
    user.worker = {
      job: req.body.workerJob
    };
  }
  if (req.body.type === 'Staff' && req.body.staffT) {
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

  // Update user in mongoose
  User.update({ _id: req.params.id }, user, (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }

    res.status(202).json({
      success: true,
      results: user,
    });
  });
});

/**
* Remove User by ID
* Access at DELETE http://staff.chulaexpo.com/api/users/:id
*/
router.delete('/:id', (req, res) => {
  User.remove({ _id: req.params.id }, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }

    res.status(202).json({
      success: true,
      message: `User id ${req.params.id} was removed.`,
    });
  });
});

module.exports = router;
