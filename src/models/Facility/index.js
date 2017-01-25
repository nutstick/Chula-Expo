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
    latitute: { type: Number, required: true },
    longtitute: { type: Number, required: true }
  }

});

const Facility = mongoose.model('Facility', FacilitySchema);

module.exports = Facility;
