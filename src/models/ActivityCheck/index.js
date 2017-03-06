const mongoose = require('mongoose');
// const _ = require('lodash');
// const { Round } = require('../');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * ActivityCheck Schema
 */
const ActivityCheckSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  createAt: { type: Date, default: new Date() },
  createBy: {
    type: ObjectId,
    ref: 'User'
  },
  activityId: {
    type: ObjectId,
    ref: 'Activity',
    required: true,
  },
});
const ActivityCheck = mongoose.model('ActivityCheck', ActivityCheckSchema);

module.exports = ActivityCheck;
