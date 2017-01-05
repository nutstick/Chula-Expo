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

describe('API Users', () => {
  beforeEach((done) => {
    User.remove({}, (err) => {
      if (err) {
        done();
      }
      done();
    });
  });

  // Test GET /users/:id
  describe('GET /api/users/:id', () => {
    it('it should GET a user by the given id', (done) => {
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
        chai.request(server)
          .get(`/api/users/${user.id}`)
          .send(user)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.property('name');
            expect(res.body).to.have.property('email');
            expect(res.body).to.have.property('gender');
            expect(res.body).to.have.property('age');
            expect(res.body).to.have.property('_id').eql(user.id);
            done();
          });
      });
    });
  });

  // Test POST /users
  describe('POST /api/users', () => {
    it('it should POST new user', (done) => {
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
        .post('/api/users')
        .send(user)
        .end((err, res) => {
          expect(res).to.be.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('name').eql(user.name);
          expect(res.body.user).to.have.property('email').eql(user.email);
          expect(res.body.user).to.have.property('gender').eql(user.gender);
          expect(res.body.user).to.have.property('age').eql(user.age);
          done();
        });
    });
  });
});
