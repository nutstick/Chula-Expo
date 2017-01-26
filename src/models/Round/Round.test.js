/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const casual = require('casual');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const expect = chai.expect;

const Round = require('./');

describe('Round Model', () => {
  beforeEach((done) => {
    mongoose.createConnection(process.env.TEST_MONGODB_URI, done);
  });

  it('should create a new round', (done) => {
    const round = new Round({
      name: casual.safe_color_name,
      activityId: ObjectId(),
      startTime: new Date(casual.unix_time),
      endTime: new Date(casual.unix_time),
      seats: {
        fullCapacity: casual.integer(40, 400),
      },
    });

    round.save((err) => {
      expect(err).to.be.null;
      done();
    });
  });

  it('should not create a round if missing field', (done) => {
    const round = new Round({
      name: casual.safe_color_name,
      startTime: new Date(casual.unix_time),
      endTime: new Date(casual.unix_time),
    });

    round.save((error, result) => {
      expect(error.name).to.eq('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });
});
