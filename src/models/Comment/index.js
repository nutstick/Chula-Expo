const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Comment Schema
 */
const CommentSchema = new mongoose.Schema({
  message: {
    type: String
  },
  activity: {
    type: ObjectId,
    ref: 'Activity'
  },
  createAt: { type: Date, default: new Date() },
  createBxy: {
    type: ObjectId,
    ref: 'User'
  },

});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
