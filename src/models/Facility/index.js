const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * Place Schema
 */
const FacilitySchema = new mongoose.Schema({
  name: {
    th: { type: String, required: true, index: true },
    en: { type: String, required: true, index: true }
  },
  description: {
    th: { type: String },
    en: { type: String }
  },
  type: {
    type: String,
    required: true
  },
  place: {
    type: ObjectId,
    ref: 'Place'
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

const Facility = mongoose.model('Facility', FacilitySchema);

module.exports = Facility;
