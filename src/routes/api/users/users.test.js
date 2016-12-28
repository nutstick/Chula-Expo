/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
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
        name: casual.name,
        email: casual.email,
        password: casual.password,
        gender: 'man',
        age: casual.integer(18, 30)
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
            expect(res.body).to.have.property('password');
            expect(res.body).to.have.property('gender');
            expect(res.body).to.have.property('age');
            expect(res.body).to.have.property('_id').eql(user.id);
            done();
          });
      });
    });
  });
});
