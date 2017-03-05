const express = require('express');
const { Activity, ActivityCheck, User } = require('../../../models');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');

const router = express.Router({ mergeParams: true });
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
      .limit(limit);
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

router.post('/', isAuthenticatedByToken, isStaff, (req, res) => {
  // Validate required field from body
  if (req.body.user) {
    // Check exist target activity input
    Activity.findById(req.params.id, (err, activitiy) => {
      // Handle error from Activity.findById
      if (err) {
        return res.sendError(5, err);
      }
      // Related activity not found
      if (!activitiy) {
        return res.sendError(35, err);
      }
      User.findById(req.body.user).exec((err, _user) => {
        if (err) return res.sendError(5, err);
        if (!_user) return res.sendError(24, err);
        const filter = { activityId: req.params.id,
          user: req.body.user };
        ActivityCheck.findOne(filter).exec((err, _checkin) => {
          let duplicate = false;
          if (_checkin) {
            duplicate = true;
          }
          // Create a new instance of the User model
          const checkin = new ActivityCheck();
          checkin.user = req.body.user;
          checkin.activityId = req.params.id;
          checkin.createBy = req.user.id;
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
      return res.sendError(35);
    }
    // Checkin is not belong to Activity
    if (_checkin.activityId.toString() !== req.params.id) {
      return res.sendError(35);
    }

    res.json({
      success: true,
      results: _checkin,
    });
  });
});

router.delete('/:cid', isAuthenticatedByToken, isStaff, (req, res) => {
  ActivityCheck.findById(req.params.cid, (err, _checkin) => {
    // Handle error from ActivityCheck.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Checkin isn't exist.
    if (!_checkin) {
      return res.sendError(35);
    }
    // Checkin is not belong to Activity
    if (_checkin.activityId.toString() !== req.params.id) {
      return res.sendError(35);
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
