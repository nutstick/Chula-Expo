/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const casual = require('casual');
const RangeQuery = require('./RangeQuery');

const expect = chai.expect;

describe('Range query', () => {
  it('should return correct range query result(1).', (done) => {
    const result = RangeQuery({
      lt: 1,
      eq: 'eq is comming',
      gt: 5,
    }, 'number');

    expect(result).to.eql({
      lt: 1,
      gt: 5,
    });
    done();
  });

  it('should return correct range query result(2).', (done) => {
    const result = RangeQuery({
      eq: 'abs',
      gt: 5,
      gte: 'Test string',
    }, 'string');

    expect(result).to.eql({
      eq: 'abs',
      gte: 'Test string',
    });
    done();
  });

  it('should return correct range query result(3).', (done) => {
    const eq = casual.date('YYYY-MM-DD');
    const lt = casual.date('YYYY-MM-DD');
    const lte = casual.date('YYYY-MM-DD');
    const ne = casual.date('YYYY-MM-DD');
    const gt = casual.name;

    const result = RangeQuery({
      eq, lt, lte, ne, gt
    }, 'Date');
    expect(result).to.eql({
      eq: new Date(eq),
      lt: new Date(lt),
      lte: new Date(lte),
      ne: new Date(ne),
    });
    done();
  });

  it('should return correct range query result(4).', (done) => {
    const eq = casual.card_number;
    const lt = casual.color_name;
    const lte = casual.sentence;
    const ne = casual.sentence;
    const gt = casual.name;
    const result = RangeQuery({
      eq, lt, lte, ne, gt
    }, 'Date');

    expect(result).to.be.null;
    done();
  });
});
