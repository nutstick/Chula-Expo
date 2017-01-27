/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const casual = require('casual');
const mongoose = require('mongoose');

const expect = chai.expect;

const Place = require('./');

describe('Place Model', () => {
  beforeEach((done) => {
    mongoose.createConnection(process.env.TEST_MONGODB_URI, done);
  });

  it('should create a new Place', (done) => {
    const place = new Place({
      code: casual.letter,
      name: {
        th: casual.title,
        en: casual.title
      },
      location: {
        latitude: casual.double(from = -10, to = 10),
        longitude: casual.double(from = -10, to = 10)
      },
    });

    place.save((err) => {
      expect(err).to.be.null;
      done();
    });
  });
});
