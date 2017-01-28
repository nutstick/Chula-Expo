/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const casual = require('casual');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const expect = chai.expect;

const Facility = require('./');

describe('Facility Model', () => {
  beforeEach((done) => {
    mongoose.createConnection(process.env.TEST_MONGODB_URI, done);
  });


  it('should create a new Facility', (done) => {
    const typeNumber = casual.integer(from = 0, to = 4);
    let typeName = '';
    switch(typeNumber) {
      case 0:
        typeName = 'toilet';
        break;
      case 1:
        typeName = 'prayer';
        break;
      case 2:
        typeName = 'carpark';
        break;
      case 3:
        typeName = 'canteen';
        break;
      default:
        typeName = 'toilet';
    }

    const facility = new Facility({
      name: {
        th: casual.title,
        en: casual.title
      },
      description: {
        th: casual.description,
        en: casual.description
      },
      type: typeName,
      place: ObjectId(),
      location: {
        latitude: casual.double(from = -10, to = 10),
        longitude: casual.double(from = -10, to = 10)
      },
    });

    facility.save((err) => {
      expect(err).to.be.null;
      done();
    });
  });
});
