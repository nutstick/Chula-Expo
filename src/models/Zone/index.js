const mongoose = require('mongoose');
const { Activity } = require('./');
const _ = require('lodash');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Activity Schema
 */
const ZoneSchema = new mongoose.Schema({
  name: {
    th: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: true
    }
  },
  places: [{
    type: ObjectId,
    ref: 'Place'
  }],
  thumbnail: {
    type: String
  },
  banner: {
    type: String
  },
  welcomeMessage: {
    th: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: true
    }
  },
  shortName: {
    th: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: true
    }
  },
  description: {
    th: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: true
    }
  },
  website: {
    type: String
  },
  type: {
    type: String,
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  createAt: { type: Date, default: new Date() },
  updateAt: { type: Date, default: new Date() },
  createBy: {
    type: ObjectId,
    ref: 'User'
  },

});

/*

ZoneSchema.statics.getActivityCheckEachActivity = function (zoneId, filter, mergeUser = false) {
  let activities;
  Activity.find({ zone: zoneId })
    .select('_id name.en').exec()
    .then((_activities) => {
      activities = _activities;
      return Promise.all(
        activities.map((activity) => {
          filter_.activityId = activity._id;

          return ActivityCheck.aggregate([
            {
              $match: _.extends
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
}
*/
const Zone = mongoose.model('Zone', ZoneSchema);

module.exports = Zone;
