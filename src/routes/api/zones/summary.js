const express = require('express');
const { Activity, ActivityCheck } = require('../../../models');
const User = require('../../../models/User');
const { RangeQuery } = require('../../../tools');
const { isAuthenticatedByToken, isStaff, deserializeToken } = require('../../../config/authenticate');

const router = express.Router({ mergeParams: true });

router.get('/sum', (req, res) => {
  let activities;
  const filter = {};
  if (req.query.createAt) {
    try {
      req.query.createAt = JSON.parse(req.query.createAt);
    } catch (err) {
      // return res.sendError(5, err);
    }
    filter.createAt = RangeQuery(req.query.createAt, 'Date');
  }
  Activity.find({ zone: req.params.id })
    .select('_id name.en').exec()
    .then((_activities) => {
      activities = _activities;
      return Promise.all(
        activities.map((activity) => {
          const filter_ = filter;
          filter_.activityId = activity._id;

          return ActivityCheck.aggregate([
            {
              $match: filter_
            },
            {
              $group: {
                _id: '$user'
              }
            },
            {
              $count: 'total'
            }
          ])
            .exec();
        })
      );
    })
    .then((checks) => {
      // console.log(checks)
      res.json({
        success: true,
        results: {
          list: checks.reduce((result, check, index) => {
            result[activities[index].name.en] = check[0] && check[0].total ? check[0].total : 0;
            return result;
          }, {}),
          total: checks.reduce((result, check) => {
            return result + (check[0] && check[0].total ? check[0].total : 0);
          }, 0)
        }
      });
    })
    .catch((err) => {
      res.sendError(5, err);
    });
});

router.get('/users', (req, res) => {
  let activities;
  const filter = {};
  if (req.query.createAt) {
    try {
      req.query.createAt = JSON.parse(req.query.createAt);
    } catch (err) {
      // return res.sendError(5, err);
    }
    filter.createAt = RangeQuery(req.query.createAt, 'Date');
  }
  Activity.find({ zone: req.params.id })
    .select('_id name.en').exec()
    .then((_activities) => {
      activities = _activities;
      return Promise.all(
        activities.map((activity) => {
          const filter_ = filter;
          filter_.activityId = activity._id;

          return ActivityCheck.aggregate([
            {
              $match: filter_
            },
          ])
            .exec();
        })
      );
    })
    .then((checks) => {
      console.log("asa");
      const users = Object.keys(checks.reduce((user, check) => {
        check.forEach((c) => { user[c.user] = true; });
        return user;
      }, {}));
      return Promise.all(users.map((u) => {
        return User.findOne({ _id: u }).select('name').exec();
      })).then((users) => {
        const _u = users;
        const qrcode = _u.reduce((c, u) => (u && u.name && u.name === 'qrcode' ? c + 1 : c), 0)
        return res.json({
          success: true,
          results: {
            total: _u.length,
            qrcode,
            mobile: _u.length - qrcode,
          }
        });
      });
    })
    .catch((err) => {
      return res.sendError(5, err);
    });
});

// #TODO show list
router.get('/users/list', (req, res) => {
  let activities;
  const filter = {};
  if (req.query.createAt) {
    try {
      req.query.createAt = JSON.parse(req.query.createAt);
    } catch (err) {
      // return res.sendError(5, err);
    }
    filter.createAt = RangeQuery(req.query.createAt, 'Date');
  }
  Activity.find({ zone: req.params.id })
    .select('_id name.en').exec()
    .then((_activities) => {
      activities = _activities;
      return Promise.all(
        activities.map((activity) => {
          const filter_ = filter;
          filter_.activityId = activity._id;

          return ActivityCheck.aggregate([
            {
              $match: filter_
            },
          ])
            .exec();
        })
      );
    })
    .then((checks) => {
      const users = Object.keys(checks.reduce((user, check) => {
        check.forEach((c) => { user[c.user] = true; });
        return user;
      }, {}));
      return Promise.all(users.map((u) => {
        return User.findOne({ _id: u , age: { $ne: 100}}).select('name type academic worker gender tags age').exec();
      })).then((users) => {
        return res.json({
          success: true,
          results: {
            users
          }
        });
      });
    })
    .catch((err) => {
      res.sendError(5, err);
    });
});

module.exports = router;
