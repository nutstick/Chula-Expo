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

RoundSchema.index({ start: 1, end: 1, activityId: 1 });

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

RoundSchema.methods.reserve = userId => (
  new Promise((resolve, reject) => {
    if (this.reservedSeats + 1 > this.avaliableSeats) {
      return reject({
        error: 'Can\'t reserve. Seating\'s fully booked'
      });
    }

    User.findById(userId, (err, res) => {
      if (err) {
        return reject({
          error: err,
        });
      } else if (!res) {
        return reject({
          error: 'User dosen\'t exist',
        });
      }
      this.reservedSeats = this.reservedSeats + 1;
      this.reservedUsers.push(userId);

      new Ticket({ userId, roundId: this.id, })
        .save((err, ticket) => {
          if (err) {
            return reject(err);
          }
          this.save((err) => {
            if (err) {
              return reject(err);
            }
            resolve(ticket);
          });
        });
    });
  })
);

const Round = mongoose.model('Round', RoundSchema);

module.exports = Round;
