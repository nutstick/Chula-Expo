const mongoose = require('mongoose');
const _ = require('lodash');
const { User, Activity, ActivityCheck } = require('./');

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

ZoneSchema.statics.getActivityCheckEachActivity = function (zoneId, filter,
  fields, mergeUser = false) {
  let activities;
  Activity.find({ zone: zoneId })
    .select('_id name.en')
    .exec()
    .then((_activities) => {
      activities = _activities;

      return Promise.all(
        activities.map((activity) => {
          const aggregateQuery = [
            {
              $match: _.extend({ activityId: activity._id }, filter)
            }
          ];
          if (mergeUser) {
            aggregateQuery.push({
              $group: {
                _id: '$user'
              }
            });
          }
          return ActivityCheck.aggregate(aggregateQuery).exec();
        })
      );
    })
    .then((checks) => {
      const users = Object.keys(checks.reduce((user, check) => {
        check.forEach((c) => { user[c.user] = true; });
        return user;
      }, {}));
      return Promise.all(users.map((u) => {
        return User.findOne({ _id: u }).select(fields).exec();
      }));
    })
}

const Zone = mongoose.model('Zone', ZoneSchema);

module.exports = Zone;
