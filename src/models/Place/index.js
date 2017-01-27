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
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }
});

const Place = mongoose.model('Place', PlaceSchema);

module.exports = Place;
