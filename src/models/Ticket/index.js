const mongoose = require('mongoose');
const { User, Round } = require('../');

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
  checked: {
    type: Boolean,
    default: false,
  },
});

TicketSchema.index({ user: 1, round: 1 });

TicketSchema.static.cancelReserved = (ticketId) => new Promise((resolve, reject) => {
  TicketSchema.findbyId(ticketId, (err, ticket) => {
    if (err) {
      return reject(err);
    }
    // Ticket isn't exist
    if (!ticket) {
      return reject({ code: 27 });
    }
    User.findById(ticket.user, (err, user) => {
      if (err) {
        return reject(err);
      }
      Round.findById(ticket.round, (err, round) => {
        if (err) {
          return reject(err);
        }
        // Decease reseaved seats by 1 and bound by zero
        round.seats.reserved = Math.max(this.seats.reserved - 1, 0);
        // Filter out User's reseved activity
        user.reservedActivity.filter(activity => activity.ticket !== ticket.id);

        Promise.all([
          round.save(),
          user.save(),
          ticket.remove(),
        ]).then(() => resolve())
          .catch(reject);
      });
    });
  });
});

TicketSchema.methods.checkIn = () => {
  this.checked = true;
};

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
