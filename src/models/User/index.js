const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Bookmark activity schema
 */
const BookmarkActivitySchema = new mongoose.Schema({
  activityId: {
    type: ObjectId,
    ref: 'Activity'
  },
  notification: Date
});

/**
 * Reserved activity schema
 */
const ReservedActivitySchema = new mongoose.Schema({
  roundId: {
    type: ObjectId,
    ref: 'Round'
  },
  ticket: {
    type: ObjectId,
    ref: 'Ticket'
  },
  reservedAt: Date,
  checkedIn: Date,
  notification: Date
});

/**
 * Activity log Schema
 */
const ActivityLogSchema = new mongoose.Schema({
  type: String,
  game: {
    gameId: {
      type: ObjectId,
      ref: 'Game'
    },
    score: Number,
    totalScore: Number,
  },
  activity: {
    activityId: {
      type: ObjectId,
      ref: 'Activity'
    }
  },
  createAt: Date
});

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, select: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  admin: {
    type: String,
    enum: ['Admin', 'Staff'],
  },

  facebook: { type: String },
  google: { type: String },
  tokens: Array,

  name: { type: String, required: true },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  age: { type: Number, required: true },
  pictureUrl: String,
  type: {
    type: String,
    required: true,
    enum: ['Academic', 'Worker']
  },
  academic: {
    year: Number,
    school: String
  },
  worker: {
    company: String
  },
  bookmarkActivity: [BookmarkActivitySchema],
  reservedActivity: [ReservedActivitySchema],
  qrcodeUrl: String,
  game: {
    totalScore: Number,
    pending: [{
      type: ObjectId,
      ref: 'Game'
    }],
    passed: [{
      type: ObjectId,
      ref: 'Game'
    }]
  },
  activityLog: [ActivityLogSchema]
}, { timestamps: true });
/**
 * Password hash middleware.
 */
UserSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
UserSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

/**
 * User generate token
 */
UserSchema.methods.generateToken = function generateToken() {
  return jwt.sign({
    id: this.id,
  }, process.env.SESSION_SECRET, {
    expiresIn: 8 * 60 * 60 /* expires in 8 hrs */,
  });
};


const User = mongoose.model('User', UserSchema);

module.exports = User;
