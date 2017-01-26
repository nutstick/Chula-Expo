/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const casual = require('casual');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const expect = chai.expect;

const Activity = require('./');

describe('Activity Model', () => {
  beforeEach((done) => {
    mongoose.createConnection(process.env.TEST_MONGODB_URI, done);
  });


  it('should create a new activity', (done) => {
    const activity = new Activity({
      name: {
        th: casual.title,
        en: casual.title
      },
      zone: ObjectId(),
      startTime: new Date(casual.unix_time),
      endTime: new Date(casual.unix_time),
      thumbnail: casual.string,
      banner: casual.string,
      description: {
        th: casual.description,
        en: casual.description
      },
      shortDescription: {
        th: casual.short_description,
        en: casual.short_description
      },
      location: {
        place: ObjectId(),
        floor: casual.word,
        room: casual.word,
        latitute: casual.double(from = -10, to = 10),
        longtitute: casual.double(from = -10, to = 10)
      },
      contact: casual.first_name,
      image: [
        casual.string,
        casual.string
      ],
      video: casual.string,
      pdf: casual.string,
      link: [
        casual.string,
        casual.string
      ],
      isHighlight: true,
      tags: [
        casual.word,
        casual.word
      ]
    });

    activity.save((err) => {
      expect(err).to.be.null;
      done();
    });
  });
});
