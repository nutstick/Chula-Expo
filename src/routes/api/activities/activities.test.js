/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const casual = require('casual');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const expect = chai.expect;

const { User } = require('../../../models');

chai.use(chaiHttp);

describe('API Activities', () => {
  beforeEach((done) => {
    mongoose.createConnection(process.env.TEST_MONGODB_URI, done);
  });

  describe('POST /api/activities', () => {
    describe('[As Admin User]', () => {
      let token = '';
      before((done) => {
        const user = new User({
          email: casual.email,
          facebook: casual.card_number(),
          tokens: [{
            kind: 'facebook',
            accessToken: 'EAATpmh0ZCMDEBAEZAZA0m0f4wVw3tTQyZCqL2wXZALTiRn8rGBbs6wJlcIEyi5pXo69je3NgGtsCevM7P6jNeKjnKtE9lr9VZAiJbZCWySxARg1hPZC4MLqOvG8mEmbyNZAI1ZCIrgJkv9G88VTco2R6nyu5mRa94KI58ZD'
          }],
          name: casual.name,
          picture: `https://graph.facebook.com/${casual.card_number()}/picture?type=large`,
          gender: 'Male',
          age: casual.integer(15, 60),
          type: 'Staff',
          staff: {
            staffType: 'Admin'
          }
        });

        user.save((err, user) => {
          if (user) {
            token = user.generateToken();
          }
          done(err);
        });
      });

      it('create new activity', (done) => {
        const activity = {
          nameEN: casual.safe_color_name,
          nameTH: casual.safe_color_name,
          thumbnail: `/img/activity/${casual.name}`,
          banner: `/img/activity/${casual.name}`,
          shortDescriptionEN: casual.sentence,
          shortDescriptionTH: casual.sentence,
          descriptionEN: casual.sentences(40),
          descriptionTH: casual.sentences(40),
          contact: casual.name,
          pictures: `/img/activity/${casual.name}`,
          video: `www.youtube.com/${casual.name}`,
          pdf: `www.pdf.com/${casual.rgb_hex}`,
          link: `www.link.com/${casual._rgb_hex}`,
          isHighlight: casual.coin_flip,
          tags: casual.sentence.replace(' ', ','),
          locationPlace: ObjectId(),
          locationFloor: ObjectId(),
          locationRoom: ObjectId(),
          locationLat: casual.latitude,
          locationLong: casual.longitude,
          zone: ObjectId(),
          start: new Date(casual.unix_time).toISOString(),
          end: new Date(casual.unix_time).toISOString()
        };

        chai.request(server)
          .post('/api/activities')
          .set('Authorization', `JWT ${token}`)
          .send(activity)
          .end((err, res) => {
            expect(err).to.be.null;
            console.log(err)
            expect(res.body).to.have.property('success').eq(true);
            expect(res.body).to.have.property('results');
            done();
          });
      });
    });
  });
});
