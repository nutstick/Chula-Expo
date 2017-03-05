/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const casual = require('casual');
require('sinon-mongoose');

const expect = chai.expect;

const User = require('../../../models/User');

chai.use(chaiHttp);

describe('API Signup', () => {
  beforeEach((done) => {
    User.remove({}, (err) => {
      if (err) {
        done();
      }
      done();
    });
  });

  describe('POST /api/signup', () => {
    it('should create new User(1)', (done) => {
      const user = {
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
      };

      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.null;

          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body.results.token).to.be.a('string');
          done();
        });
    });

    it('should create new User(2)', (done) => {
      const user = {
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
        type: 'Academic',
        worker: {
          school: casual.company,
          year: casual.integer(1, 6)
        }
      };

      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.null;

          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body.results.token).to.be.a('string');
          done();
        });
    });

    it('should fail on missing `gender` field', (done) => {
      const user = {
        email: casual.email,
        facebook: casual.card_number(),
        tokens: [{
          kind: 'facebook',
          accessToken: 'EAATpmh0ZCMDEBAEZAZA0m0f4wVw3tTQyZCqL2wXZALTiRn8rGBbs6wJlcIEyi5pXo69je3NgGtsCevM7P6jNeKjnKtE9lr9VZAiJbZCWySxARg1hPZC4MLqOvG8mEmbyNZAI1ZCIrgJkv9G88VTco2R6nyu5mRa94KI58ZD'
        }],
        name: casual.name,
        picture: `https://graph.facebook.com/${casual.card_number()}/picture?type=large`,
        age: casual.integer(15, 60),
        type: 'Worker',
        worker: {
          company: casual.company_name
        }
      };

      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.not.null;

          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('code').eq('23');
          done();
        });
    });

    it('should fail on incorrect match enum on `gender`', (done) => {
      const user = {
        email: casual.email,
        facebook: casual.card_number(),
        tokens: [{
          kind: 'facebook',
          accessToken: 'EAATpmh0ZCMDEBAEZAZA0m0f4wVw3tTQyZCqL2wXZALTiRn8rGBbs6wJlcIEyi5pXo69je3NgGtsCevM7P6jNeKjnKtE9lr9VZAiJbZCWySxARg1hPZC4MLqOvG8mEmbyNZAI1ZCIrgJkv9G88VTco2R6nyu5mRa94KI58ZD'
        }],
        name: casual.name,
        picture: `https://graph.facebook.com/${casual.card_number()}/picture?type=large`,
        age: casual.integer(15, 60),
        // Incorrect Match
        gender: 'men',

        type: 'Worker',
        worker: {
          company: casual.company_name
        }
      };

      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.not.null;

          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('code').eq('23');
          done();
        });
    });

    it('should fail on missing `type` field', (done) => {
      const user = {
        email: casual.email,
        facebook: casual.card_number(),
        tokens: [{
          kind: 'facebook',
          accessToken: 'EAATpmh0ZCMDEBAEZAZA0m0f4wVw3tTQyZCqL2wXZALTiRn8rGBbs6wJlcIEyi5pXo69je3NgGtsCevM7P6jNeKjnKtE9lr9VZAiJbZCWySxARg1hPZC4MLqOvG8mEmbyNZAI1ZCIrgJkv9G88VTco2R6nyu5mRa94KI58ZD'
        }],
        name: casual.name,
        picture: `https://graph.facebook.com/${casual.card_number()}/picture?type=large`,
        age: casual.integer(15, 60),
        gender: 'Female',
      };

      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          expect(err).to.be.not.null;

          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('code').eq('23');
          done();
        });
    });
  });
});
