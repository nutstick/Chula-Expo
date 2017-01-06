const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Ticket Schema
 */
const TicketSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  round: {
    type: ObjectId,
    ref: 'Round',
    required: true,
  },
});

TicketSchema.index({ user: 1, round: 1 });

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
