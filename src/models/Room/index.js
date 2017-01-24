const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * Place Schema
 */
const RoomSchema = new mongoose.Schema({
  floor: {
    type: String
  },
  roomName: {
    th: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },
  Place: {
    type: ObjectId,
    ref: 'Place'
  },
  isUsed: {
    type: Boolean
  }

});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
