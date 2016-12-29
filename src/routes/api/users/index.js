const express = require('express');
const User = require('../../../models/User');

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
      res.end(err);
    }

    res.json(user);
  });
});

/**
 * Create User
 * Access at POST http://localhost:8080/api/users
 */
router.post('/', (req, res, next) => {
  // Create a new instance of the User model
  const user = new User();

  // Set field value (comes from the request)
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.gender = req.body.gender;
  user.age = req.body.age;

  // Save User and check for error
  user.save((err, _user) => {
    if (err) {
      // Handle error from save
      next(err);
    }

    res.status(300).json({
      message: 'Create User successfull',
      user: _user
    });
  });
});

module.exports = router;
