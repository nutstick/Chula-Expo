const mongoose = require('mongoose');
const _ = require('lodash');
const { Round } = require('../');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Activity Schema
 */
const ActivitySchema = new mongoose.Schema({
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
  thumbnailUrl: String,
  bannerUrl: String,
  shortDescription: {
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
  contact: String,
  imageUrl: [String],
  videoUrl: String,
  pdfUrl: String,
  link: [String],
  isHighlight: Boolean,
  tags: [{
    type: String,
    index: true
  }],
  location: {
    place: {
      type: ObjectId,
      ref: 'Place',
      required: true
    },
    floor: String,
    room: String,
    latitute: Number,
    longtitute: Number
  },
  zone: {
    type: ObjectId,
    ref: 'Zone',
    required: true,
    index: true
  },
  rounds: [{
    type: ObjectId,
    ref: 'Round'
  }],
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  }
});

ActivitySchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text'
}, {
  name: 'Activities Text Indexing',
  weights: {
    name: 10,
    shortDescription: 4,
    description: 2
  }
});

/**
 * Find rounds by given Activity Id
 * @param {ObjectId} id - Activity Id
 * @param {object} [options] - Query options
 * @param {string} [options.name] - Get matched round's name.
 * @param {Date | RangeQuery<Date>} [options.start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [options.end] - Get by end time.
 * @param {number | RangeQuery<number>} [options.avaliableSeats] - Get by avaliable seats.
 * @param {string} [options.sort] - Sort fields (ex. "-start,+createAt").
 * @param {string} [options.fields] - Fields selected (ex. "name,fullCapacity").
 * @param {number} [options.limit] - Number of limit per query.
 * @param {number} [options.skip=0] - Offset documents.
 *
 * @return {Promise<Results>} - Promise of results
 * @return {Result.rounds} - Matched rounds.
 * @return {Result.count} - Total rounds.
 * @return {Result.limit} - Number of limit that used.
 * @return {Result.skip} - Number of offset that used.
 */

ActivitySchema.static.findRoundByActivityId = (id, options) => {
  const filter = _.pick(options, ['name', 'start', 'end', 'avaliableSeats'])
  .merge({ activityId: id });

  return new Promise((resolve, reject) => {
    Round.find(filter).count().exec((err, count) => {
      if (err) {
        reject(err);
      }
      Round
        .find(filter)
        .select(options.fields)
        .sort(options.sort)
        .limit(options.limit)
        .skip(options.skip || 0)
        .exec()
        .then((rounds) => {
          resolve({
            rounds,
            count,
            limit: options.limit,
            skip: options.skip || 0,
          });
        })
        .catch(reject);
    });
  });
};

/**
 * Find Activity by Id and add rounds to the activity.
 * @param {ObjectId} id - Target Activity Id
 * @param {Round | Round[]} rounds - Added rounds information
 *
 * @return {Promise<Activity>} - Promise of adding rounds totarget activity
 */
ActivitySchema.static.findAndAddRound = (id, rounds) => (
  new Promise((resolve, reject) => {
    this.findById(id, (err, activity) => {
      if (err) {
        return reject(err);
      } else if (!activity) {
        return reject({ code: 26 });
      }
      let promise;
      if (Array.isArray(rounds)) {
        promise = Promise.all(rounds.map(round => new Round({
          name: round.name,
          activityId: activity.id,
          start: round.start,
          end: round.end,
          seats: {
            reserved: round.reservedSeats,
            fullCapacity: round.fullCapacity,
          }
        }).save()));
      } else {
        promise = Promise.all([new Round({
          name: rounds.name,
          activityId: activity.id,
          start: rounds.start,
          end: rounds.end,
          seats: {
            reserved: rounds.reservedSeats,
            fullCapacity: rounds.fullCapacity,
          }
        }).save()]);
      }
      promise
        .then((results) => {
          activity.reservable = activity.reservable.concat(results.map(result => result._id));
          activity.save((err, _activity) => {
            if (err) {
              return reject(err);
            }
            resolve(_activity);
          });
        })
        .catch(err => reject(err));
    });
  })
);

const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;
