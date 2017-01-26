const mongoose = require('mongoose');

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
  }
});

const Zone = mongoose.model('Zone', ZoneSchema);

module.exports = Zone;
