const express = require('express');
const User = require('../../../models/User');

const router = express.Router();

<<<<<<< Updated upstream
/**
 * Get User by specific ID
 * Access at GET http://localhost:8080/api/users/:id
 */
router.get('/:id', (req, res) => {
  // Get User from instance User model by ID
  User.findById(req.params.id, (err, user) => {
    if (err) {
      // Handle error from User.findById
      return res.send(err);
=======
router.get('/ss', (req,res)=>{
  var sort = req.query.sort;
  //var age = req.query.age;
  var filters = req.query.filters;
  //var gender = req.query.gender;
  //var email = req.query.email;
  //var name = req.query.name;
  User.find(filters).
  sort(req.query.sort).
  exec(function(err,user){
    if(error){
      res.end(error);
>>>>>>> Stashed changes
    }
    res.json(user);
  });
})

router.get('/',(req,res,next)=>{
  var filters = {}
  if (req.query.name){
    filter.name = req.query.name;
  }
  if (req.query.age){
    filter.age = req.query.age;
  }
  if (req.query.)
  var _age = req.query.age;

  console.log(_name + _gender);
  // console.log(filters);
  // filters = {name:"Pun"}
  // console.log(filters);
  User.find(filters,function(err,user){
    res.json(user);
  });
});
/**
<<<<<<< Updated upstream
 * Create User
 * Access at POST http://localhost:8080/api/users
 */
router.post('/', (req, res) => {
=======
* Create User
* Access at POST http://localhost:8080/api/users
*/
router.post('/', (req, res, next) => {
>>>>>>> Stashed changes
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
      return res.send(err);
    }

    res.status(300).json({
      message: 'Create User successfull',
      user: _user
    });
  });
});
/**
* Get User by specific ID
* Access at GET http://localhost:8080/api/users/:id
*/
router.get('/:id', (req, res,next) => {
  // Get User from instance User model by ID
  User.findById(req.params.id, (err, user) => {
    if (err) {
      // Handle error from User.findById
      res.end(err);
    }

    res.json(user);
  });
});

module.exports = router;
