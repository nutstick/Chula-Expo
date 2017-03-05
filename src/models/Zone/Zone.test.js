/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const casual = require('casual');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const expect = chai.expect;

const Zone = require('./');

describe('Zone Model', () => {
  beforeEach((done) => {
    mongoose.createConnection(process.env.TEST_MONGODB_URI, done);
  });


  it('should create a new Zone', (done) => {
    const typeNumber = casual.integer(from = 0, to = 2); // eslint-disable-line no-undef
    let typeName = '';
    switch (typeNumber) {
      case 0:
        typeName = 'city';
        break;
      case 1:
        typeName = 'faculty';
        break;
      default:
        typeName = 'city';
    }

    const zone = new Zone({
      name: {
        th: casual.title,
        en: casual.title
      },
      places: [
        ObjectId(),
        ObjectId(),
        ObjectId(),
        ObjectId()
      ],
      thumbnail: casual.string,
      banner: casual.string,
      welcomeMessage: {
        th: casual.sentence,
        en: casual.sentence
      },
      shortName: {
        th: casual.short_description,
        en: casual.short_description
      },
      description: {
        th: casual.description,
        en: casual.description
      },
      website: casual.string,
      type: typeName,
      location: {
        latitude: casual.double(from = -10, to = 10), // eslint-disable-line no-undef
        longitude: casual.double(from = -10, to = 10) // eslint-disable-line no-undef
      }
    });

    zone.save((err) => {
      expect(err).to.be.null;
      done();
    });
  });
});
