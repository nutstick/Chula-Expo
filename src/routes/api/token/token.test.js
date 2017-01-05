/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const casual = require('casual');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;
require('sinon-mongoose');

const expect = chai.expect;

const User = require('../../../models/User');

chai.use(chaiHttp);

describe('API Token', () => {
  beforeEach((done) => {
    User.remove({}, (err) => {
      if (err) {
        done();
      }
      done();
    });
  });

  // Test GET /api/token
  describe('GET /api/token', () => {
    it('should refresh token', (done) => {
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
        type: 'Worker',
        worker: {
          company: casual.company_name
        }
      });

      user.save((err, user) => {
        expect(err).to.be.null;
        const token = jwt.sign({
          id: user.id,
        }, process.env.SESSION_SECRET, {
          expiresIn: 8 * 60 * 60 /* expires in 8 hrs */,
        });

        chai.request(server)
          .get('/api/token')
          .send({ token })
          .end((err, res) => {
            expect(err).to.be.null;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success').eql(true);
            expect(res.body).to.have.property('data');
            expect(res.body.data).have.property('token');
            expect(res.body.data.token).to.be.a('string');

            jwt.verify(res.body.data.token, process.env.SESSION_SECRET, (err, { id }) => {
              expect(err).to.be.null;
              expect(id).to.eql(user.id);
            });
            done();
          });
      });
    });

    it('should return error if use randon ObjectId', (done) => {
      const id = ObjectId();
      const token = jwt.sign({
        id,
      }, process.env.SESSION_SECRET, {
        expiresIn: 8 * 60 * 60 /* expires in 8 hrs */,
      });

      chai.request(server)
        .get('/api/token')
        .send({ token })
        .end((err, res) => {
          expect(err).to.be.not.null;

          expect(res).to.have.status(403);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('code').eq('24');
          done();
        });
    });

    it('should return error if not provide token', (done) => {
      chai.request(server)
        .get('/api/token')
        .end((err, res) => {
          expect(err).to.be.not.null;

          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('code').eq('22');
          done();
        });
    });
  });
});
