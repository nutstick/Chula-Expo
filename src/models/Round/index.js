const mongoose = require('mongoose');
const User = require('../User');
const Ticket = require('../Ticket');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Round Schema
 */
const RoundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  activityId: {
    type: ObjectId,
    ref: 'Activity',
    required: true,
  },
  start: { type: Date, required: true },
  end: { type: Date, required: true },

  seats: {
    avaliable: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    fullCapacity: { type: Number, required: true },
  },

  tickets: [{
    type: ObjectId,
    ref: 'Ticket',
  }],

  createAt: { type: Date, default: new Date() },
  updateAt: { type: Date, default: new Date() },
});

RoundSchema.index({ avaliable: -1, start: 1, end: 1, activityId: 1 });

/**
 * Pre-save method
 */
RoundSchema.pre('save', function save(next) {
  const round = this;
  if (!round.isModified('password')) {
    // Correcting Avaliable Seats
    this.seats.avaliable = this.seats.fullCapacity - this.seats.reserved;
  }
  // Update at updated
  this.updateAt = new Date();
  next();
});

/**
 * Find and reserve method
 */
RoundSchema.method.reserve = userId => new Promise((resolve, reject) => {
  User.findById(userId, (err, user) => {
    if (err) {
      return reject({
        error: err,
      });
    } else if (!user) {
      return reject({
        error: 'User dosen\'t exist',
      });
    }
    if (this.reservedSeats + 1 > this.avaliableSeats) {
      return reject({
        error: 'Can\'t reserve. Seating\'s fully booked'
      });
    }

    const ticket = new Ticket({ userId, roundId: user.id, })

    this.seats.reserved++;
    this.tickets.push(ticket);

    user.reservedActivity.push({
      roundId: this.id,
      ticket: ticket.id,
      reservedAt: new Date(),
    });

    Promise.all([
      this.save(),
      user.save(),
      ticket.save(),
    ]).then((results) => {
      resolve(results[2]);
    }).catch(reject);
  });
});

const Round = mongoose.model('Round', RoundSchema);

module.exports = Round;
