const express = require('express');
const Activity = require('../../../models/Activity');

const router = express.Router();
// Get all activities
router.get('/', (req, res) => {
  // filtering tag with a tags query.
  // http://localhost:3000/?tags=prize,rewards
  const filter = {};
  if (req.query.tags) {
    filter.tags = { $in: req.query.tags.split(',') };
  }
  //  http://localhost:3000/?sort=createAt,-startDate
  let sort = {};
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery[0] === '-' ? sortQuery.substr(1) : sortQuery;
      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else {
        prev[sortFields] = 1;
      }
      return prev;
    }, {});
  }
  // field selector
  // http://localhost:3000/?fields=name,faculty
  let fields;
  if (req.query.fields) {
    fields = req.query.fields.replace(',', ' ');
  }

  let query = Activity.find(filter);

  if (sort) {
    query.sort(sort);
  }
  if (fields) {
    query.select(fields);
  }
  // limiter on each query
  // http://localhost:3000/?limit=10
  if (req.query.limit) {
    query = query.limit(Number.parseInt(req.query.limit, 10));
  }
  // Offset of a query data
  // http://localhost:3000/?limit=10
  if (req.query.skip) {
    query = query.skip(Number.parseInt(req.query.skip, 10));
  }

  query.exec((err, _act) => {
    res.json({
      data: _act
    });
  });
});
//Get activities with sorting
//router.get('')
// Get User by specific ID
// Access at GET http://localhost:8080/api/activities/:id
router.get('/:id', (req, res) => {
  // Get User from instance User model by ID
  Activity.findById(req.params.id, (err, act) => {
    if (err) {
      // Handle error from User.findById
      return res.status(404).send('Error 404 Not Found!');
    }

    res.json(act);
  });
});
// Create a new activity
// Access at POST http://localhost:8080/api/activities
router.post('/', (req, res, next) => {
  // Create a new instance of the User model
  const activity = new Activity();

  // Set field value (comes from the request)
  activity.name = req.body.name;
  activity.thumbnialsUrl = req.body.thumbnialsUrl;
  activity.shortDescription = req.body.shortDescription;
  activity.description = req.body.description;
  activity.imgUrl = req.body.imgUrl;
  activity.videoUrl = req.body.videoUrl;
  activity.tags = req.body.tags;
  activity.location = req.body.location;
  activity.faculty = req.body.faculty;
  activity.reservable = req.body.reservable;
  activity.startTime = req.body.startTime;
  activity.endTime = req.body.endTime;

  // Save User and check for error
  activity.save((err, _act) => {
    if (err) {
      // Handle error from save
      next(err);
    }

    res.status(300).json(_act);
  });
});

module.exports = router;
