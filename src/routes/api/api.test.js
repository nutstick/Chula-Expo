/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');

chai.use(chaiHttp);

const expect = chai.expect;

describe('API', () => {
  it('should GET a welcome message', (done) => {
    chai.request(server)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.string;
        expect(res.text).to.eq('Welcome to Official Chula Expo API.');
        done();
      });
  });
});
