const express = require('express');
const { Activity, ActivityCheck, User } = require('../../../models');
const { isAuthenticatedByToken, isStaff, isScanner } = require('../../../config/authenticate');
const RangeQuery = require('../../../tools/RangeQuery');
const ObjectId = require('mongoose').Types.ObjectId;

const router = express.Router({ mergeParams: true });

router.get('/summary', (req, res) => {
  const perminute = req.query.minute || 15;
  const filter = {
    activityId: ObjectId(req.params.id)
  };
  if (req.query.createAt) {
    try {
      req.query.createAt = JSON.parse(req.query.createAt);
    } catch (err) {
      // return res.sendError(5, err);
    }
    filter.createAt = RangeQuery(req.query.createAt, 'Date');
  }
  // ActivityCheck.find(filter).distinct('user').exec((err, s) => {
  //   console.log(err,s.length)
  // })
  const checkAggregate = ActivityCheck.aggregate([
    {
      $match: filter
    }, {
      $group: {
        _id: {
          id: '$user',
          year: {
            $year: '$createAt'
          },
          dayOfYear: {
            $dayOfYear: '$createAt'
          },
          minute: {
            $minute: '$createAt'
          },
          hour: {
            $hour: '$createAt'
          },
          second: {
            $subtract: [
              { $second: '$createAt' },
              {
                $mod: [{
                  $second: '$createAt'
                }, 15]
              }
            ]
          }
        },
        // count: {
        //   $sum: 1
        // },
        // createAt: {
        //   $push: '$createAt'
        // }
      }
    }, {
      $group: {
        _id: {
          year: '$_id.year',
          dayOfYear: '$_id.dayOfYear',
          hour: '$_id.hour',
          minute: {
            $subtract: [
              '$_id.minute',
              {
                $mod: ['$_id.minute', perminute]
              }
            ]
          }
        },
        count: {
          $sum: 1
        },
        // users: {
        //   $push: '$_id.id'
        // }
      }
    }
  ]);

  checkAggregate
    .sort('_id.year _id.dayOfYear _id.hour _id.minute')
    // .unwind('$activity')
    // .unwind('$createAt')
    .then((checks) => {
      console.log(checks.length)
      res.json({
        success: true,
        results: checks
      });
    })
    .catch((err) => {
      res.sendError(5, err);
    });
});

router.get('/', (req, res) => {
  const filter = { activityId: req.params.id };
  let limit;
  let skip = 0;
  // Limit query
  if (req.query.limit) {
    limit = Number.parseInt(req.query.limit, 10);
  }
  // Skip query
  if (req.query.skip) {
    skip = Number.parseInt(req.query.skip, 10);
  }
  // Create query from filter
  let query = ActivityCheck.find(filter);
  query.count().exec((err, count) => {
    if (err) {
      return res.sendError(5, err);
    }
    // Custom query by skip ,limit
    query = ActivityCheck.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email _id')
      .populate('createBy', 'name email _id');
    // Execute query
    query.exec((err, checkin) => {
      if (err) {
        return res.sendError(5, err);
      }

      return res.status(200).json({
        success: true,
        results: checkin,
        queryInfo: {
          total: count,
          limit,
          skip,
        }
      });
    });
  });
});

router.get('/csv', (req, res) => {
  const filter = { activityId: req.params.id };
  const query = ActivityCheck.find(filter).populate('user', 'name gender age email academic worker _id');
  query.exec((err, checkins) => {
    var mySet = [];
    for (let i = 0; i < 5; i++) {
      mySet[i] = new Map();
    }
    for(let i = 0; i < checkins.length; i++) {

      date = new Date(checkins[i].createAt);
      year = date.getFullYear();
      month = date.getMonth() + 1;
      dt = date.getDate();
      if (dt < 10) {
        dt = '0' + dt;
      }
      if (month < 10) {
        month = '0' + month;
      }


      if(year==2017 && month==3 && dt>=15 && dt<=19){
        mySet[dt - 15].set(checkins[i].user, checkins[i].createAt);
      }
    }
    res.attachment('file.csv');
    res.charset = 'UTF-8';
    let excel = '\uFEFF' + ['name', 'gender', 'age', 'email', 'academic-level', 'academic-year', 'academic-school', 'job', 'date', 'time'].join(',') + '\n';

    for (let i = 0; i < 5; i++) {
      for (let [key, value] of mySet[i].entries()) {
        if(key) {
          if (typeof key.name === 'string') {
            key.name = key.name.trim();
          }
          if (typeof key.gender === 'string') {
            key.gender = key.gender.trim();
          }
          if (typeof key.email === 'string') {
            key.email = key.email.trim();
          }
          if (typeof key.academic.level === 'string') {
            key.academic.level = key.academic.level.trim();
          }
          if (typeof key.academic.year === 'string') {
            key.academic.year = key.academic.year.trim();
          }
          if (typeof key.academic.school === 'string') {
            key.academic.school = key.academic.school.trim();
          }
          if (typeof key.worker.job === 'string') {
            key.worker.job = key.worker.job.trim();
          }
          excel += [key.name, key.gender, key.age, key.email, key.academic.level, key.academic.year, key.academic.school, key.worker.job, (15 + i) + '-03-2017', value].join(',')  + '\n';
        }
      }
    }
    return res.send(excel);
  });

/*
  const query = ActivityCheck.distinct('user', filter);
  // Execute query
  query.exec((err, checkin) => {
    if (err) {
      return res.sendError(5, err);
    }
    const filterUser = {};
    filterUser._id = { $in: checkin };
    User.find(filterUser).select('name gender age email academic worker').exec((err, userCheck) => {
      if (err) {
        return res.sendError(5, err);
      }

      for (let i = 0; i < userCheck.length; i++) {
    });
  });*/
});

router.post('/', isAuthenticatedByToken, isScanner, (req, res) => {
  const userId = req.body.user || req.query.user;
  // Validate required field from body
  if (userId) {
    // Check exist target activity input
    Activity.findById(req.params.id, (err, activitiy) => {
      // Handle error from Activity.findById
      if (err) {
        return res.sendError(5, err);
      }
      // Related activity not found
      if (!activitiy) {
        return res.sendError(2, err);
      }
      User.findById(userId).exec((err, _user) => {
        if (err) return res.sendError(5, err);
        if (!_user) return res.sendError(24, err);
        const filter = { activityId: req.params.id,
          user: userId };
        ActivityCheck.findOne(filter).exec((err, _checkin) => {
          let duplicate = false;
          if (_checkin) {
            duplicate = true;
          }
          // Create a new instance of the User model
          const checkin = new ActivityCheck();
          checkin.user = userId;
          checkin.activityId = req.params.id;
          checkin.createBy = req.user.id;
          checkin.createAt = new Date();
          // Save checkin and check for error
          checkin.save((err, _checkin) => {
          // Handle error from save
            if (err) {
              return res.sendError(5, err);
            }
            return res.status(201).json({
              success: true,
              message: 'Create Checkin successfull',
              results: _checkin,
              duplicated: duplicate
            });
          });
        });
      });
    });
  } else {
    return res.sendError(5, 'Missing required field.');
  }
});

router.get('/:cid', (req, res) => {
  // Get round from instance round model by ID
  ActivityCheck.findById(req.params.cid, (err, _checkin) => {
    // Handle error from ActivityCheck.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Checkin isn't exist.
    if (!_checkin) {
      return res.sendError(36);
    }
    // Checkin is not belong to Activity
    if (_checkin.activityId.toString() !== req.params.id) {
      return res.sendError(36);
    }

    res.json({
      success: true,
      results: _checkin,
    });
  });
});

router.delete('/:cid', isAuthenticatedByToken, isScanner, (req, res) => {
  ActivityCheck.findById(req.params.cid, (err, _checkin) => {
    // Handle error from ActivityCheck.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Checkin isn't exist.
    if (!_checkin) {
      return res.sendError(36);
    }
    // Checkin is not belong to Activity
    if (_checkin.activityId.toString() !== req.params.id) {
      return res.sendError(36);
    }
    // Remove the checkin
    _checkin.remove((err) => {
      if (err) {
        return res.sendError(5, err);
      }
      return res.status(202).json({
        success: true,
        message: `Checkin id ${req.params.cid} was removed.`,
      });
    });
  });
});

module.exports = router;
