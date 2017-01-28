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
  password: { type: String },
  passwordResetToken: String,
  passwordResetExpires: Date,

  facebook: { type: String },
  google: { type: String },
  tokens: Array,

  name: { type: String, required: true },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Etc']
  },
  age: { type: Number, required: true },
  profile: String,
  type: {
    type: String,
    required: true,
    enum: ['Academic', 'Worker', 'Staff']
  },
  academic: {
    level: {
      type: String
    },
    year: {
      type: String
    },
    school: {
      type: String
    },
  },
  worker: {
    job: String,
    company: String
  },
  staff: {
    staffType: {
      type: String,
    },
    zone: {
      type: ObjectId,
      ref: 'Zone'
    }
  },
  bookmarkActivity: [BookmarkActivitySchema],
  reservedActivity: [ReservedActivitySchema],
  qrcode: String,
  game: {
    totalScore: { type: Number, default: 0 },
    pending: [{
      type: ObjectId,
      ref: 'Game'
    }],
    passed: [{
      type: ObjectId,
      ref: 'Game'
    }]
  },
  activityLog: [ActivityLogSchema],
  loveTags: [{
    type: ObjectId,
    ref: 'Tag'
  }],
  loveFaculties: [{
    type: ObjectId,
    ref: 'Zone'
  }],
  createAt: { type: Date, default: new Date() },
  updateAt: { type: Date, default: new Date() },
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
  console.log(candidatePassword, this.password);
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
    sub: this.id,
  }, process.env.JWT_SECRET, {
    expiresIn: 8 * 60 * 60 /* expires in 8 hrs */,
  });
};


const User = mongoose.model('User', UserSchema);

module.exports = User;
