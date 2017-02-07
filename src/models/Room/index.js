const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * Place Schema
 */
const RoomSchema = new mongoose.Schema({
  name: {
    th: { type: String, required: true, index: true },
    en: { type: String, required: true, index: true }
  },
  floor: {
    type: String,
    required: true
  },
  place: {
    type: ObjectId,
    required : true,
    ref: 'Place'
  }


});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
