const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * Activity Schema
 */
const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  thumbnialsUrl: String,
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  imgUrl: [String],
  videoUrl: [String],
  tags: [{ type: String, index: true }],
  location: {
    desc: { type: String, index: true },
    latitute: Number,
    longtitute: Number
  },
  // faculty: { type: String, required: true, index: true },
  reservable: [{
    type: ObjectId,
    ref: 'Round'
  }],
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date, required: true, index: true }
});

ActivitySchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text'
}, {
  name: 'Activities Text Indexing',
  weights: { name: 10, shortDescription: 4, description: 2 }
});

const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;
