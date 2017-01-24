const mongoose = require('mongoose');

/**
 * Place Schema
 */
const PlaceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    th: { type: String, required: true },
    en: { type: String, required: true }
  },
  location: {
    latitute: { type: Number, required: true },
    longtitute: { type: Number, required: true }
  }
});

const Place = mongoose.model('Place', PlaceSchema);

module.exports = Place;
