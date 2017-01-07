const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Location Schema
 */
 const LocationSchema = new mongoose.Schema({
   desc: String,
   latitute: Number,
   longtitute: Number
 });

 /**
  * ReservableSchema Schema
  */
  const ReservableSchema = new mongoose.Schema({
    type: [ObjectId]// ,
    // ref: 'round'
  });

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
  tags: [String],
  location: LocationSchema,
  faculty: { type: String, required: true },
  reservable: ReservableSchema,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
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
