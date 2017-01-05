const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Ticket Schema
 */
const TicketSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  roundId: {
    type: ObjectId,
    ref: 'Round',
    required: true,
  },
});

TicketSchema.index({ userId: 1, roundId: 1 });

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
