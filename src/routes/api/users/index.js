const express = require('express');
const User = require('../../../models/User');
const retrieveError = require('../../../tools/retrieveError');
// const RangeQuery = require('../../../tools/RangeQuery');
const router = express.Router();

/**
 * Get User by specific ID
 * Access at GET http://localhost:8080/api/users/:id
 */
router.get('/:id', (req, res) => {
  // Get User from instance User model by ID
  User.findById(req.params.id, (err, user) => {
    if (err) {
      // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
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
        res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      } else {
        res.json({
          success: true,
          results: users,
        });
      }
    });
  } catch (error) {
    res.send(error);
  }
});
/**
* Create User
* Access at POST http://localhost:8080/api/users
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
// update specific user
router.put('/:id', (req, res) => {
  const user = {};

  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.gender = req.body.gender;
  user.age = req.body.age;
  user.type = req.body.type;
  // console.log(req.params.id);
  User.update({ _id: req.params.id }, user, { upsert: true }, (err, users) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    res.status(202).json({
      success: true,
      message: 'Update user successfully',
      results: users,
    });
  });
});
router.post('/', (req, res) => {
  // Create a new instance of the User model
  const user = new User();

  // Set field value (comes from the request)
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.gender = req.body.gender;
  user.age = req.body.age;
  user.type = req.body.type;

  // Save User and check for error
  user.save((err, _user) => {
    if (err) {
      // Handle error from save
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Create User successfull',
      user: _user
    });
  });
});
/**
* Get User by specific ID
* Access at GET http://localhost:8080/api/users/:id
*/


module.exports = router;
