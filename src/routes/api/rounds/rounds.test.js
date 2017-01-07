/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const casual = require('casual');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

chai.use(chaiHttp);

const { Activity, Round, Ticket } = require('../../../models');

const expect = chai.expect;

describe('API Rounds', () => {
  beforeEach((done) => {
    // Changing connection to TEST_URI
    mongoose.createConnection(process.env.TEST_MONGODB_URI, done);
  });

  describe('GET /api/rounds', () => {
    const userId = ObjectId().toString();
    let ticketsPromise;
    before((done) => {
      // Clear round database
      Round.remove({}, (err) => {
        if (err) {
          done();
        }
        // Create Promise for 20 mock data
        const roundsPromise = new Array(20).fill(1).map(() => {
          const round = new Round({
            name: casual.safe_color_name,
            activityId: ObjectId(),
            start: new Date(casual.unix_time),
            end: new Date(casual.unix_time),
            seats: {
              fullCapacity: casual.integer(40, 400),
            },
          });

          return round.save();
        });
        // Create 20 rounds
        Promise.all(roundsPromise)
          .then((rounds) => {
            // Create Ticket promise from rounds with random chance
            ticketsPromise = rounds.reduce((prev, round) => {
              // Random rounds
              if (casual.integer(1, 3) <= 1) {
                prev.push(round);
              }
              return prev;
            }, [])
            .map(roundId => new Ticket({ user: userId, round: roundId }).save());
            // Create Ticket
            Promise.all(ticketsPromise)
              .then(() => done());
          });
      });
    });

    it('should receive all rounds', (done) => {
      chai.request(server)
        .get('/api/rounds')
        .query({
          sort: '+start',
          fields: '_id'
        })
        .send()
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.be.a('Array').length(20);
          expect(res.body).to.have.property('queryInfo');
          expect(res.body.queryInfo).to.be.a('object');
          expect(res.body.queryInfo).to.have.property('total').eql(20);
          expect(res.body.queryInfo).to.have.property('skip').eql(0);
          done();
        });
    });

    it('should receive a list of rounds that skip 1 documents', (done) => {
      chai.request(server)
        .get('/api/rounds')
        .query({
          sort: '+start',
          skip: 1,
          limit: 5,
          fields: 'name,start,end'
        })
        .send()
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.be.a('Array').length(5);
          expect(res.body).to.have.property('queryInfo');
          expect(res.body.queryInfo).to.be.a('object');
          expect(res.body.queryInfo).to.have.property('total').eql(20);
          expect(res.body.queryInfo).to.have.property('skip').eql(1);
          expect(res.body.queryInfo).to.have.property('limit').eql(5);
          done();
        });
    });

    it('should receive a list of rounds that skip 3 documents', (done) => {
      chai.request(server)
        .get('/api/rounds')
        .query({
          sort: '+start',
          skip: 3,
          limit: 5,
          fields: 'name,start,end'
        })
        .send()
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.be.a('Array').length(5);
          expect(res.body).to.have.property('queryInfo');
          expect(res.body.queryInfo).to.be.a('object');
          expect(res.body.queryInfo).to.have.property('total').eql(20);
          expect(res.body.queryInfo).to.have.property('skip').eql(3);
          expect(res.body.queryInfo).to.have.property('limit').eql(5);
          done();
        });
    });

    it('should sort by 2 argument', (done) => {
      chai.request(server)
        .get('/api/rounds')
        .query({
          sort: '+start,-end',
          skip: 7,
          limit: 12,
          fields: 'name,start,end'
        })
        .send()
        .end((err, res) => {
          // TODO checking sorting
          expect(err).to.be.null;
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.be.a('Array').length(12);
          expect(res.body).to.have.property('queryInfo');
          expect(res.body.queryInfo).to.be.a('object');
          expect(res.body.queryInfo).to.have.property('total').eql(20);
          expect(res.body.queryInfo).to.have.property('skip').eql(7);
          expect(res.body.queryInfo).to.have.property('limit').eql(12);
          done();
        });
    });

    it('should get all user\'s match rounds', (done) => {
      chai.request(server)
        .get('/api/rounds')
        .query({
          sort: '+start',
          userId,
          skip: 0,
          fields: 'name,start,end'
        })
        .send()
        .end((err, res) => {
          // TODO checking sorting
          expect(err).to.be.null;
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.be.a('Array').length(ticketsPromise.length);
          expect(res.body).to.have.property('queryInfo');
          expect(res.body.queryInfo).to.be.a('object');
          expect(res.body.queryInfo).to.have.property('total').eql(ticketsPromise.length);
          expect(res.body.queryInfo).to.have.property('skip').eql(0);
          done();
        });
    });

    // TODO tickedId query, userId select ,sort and limit, start as RangeQuery
  });

  describe('POST /api/rounds', () => {
    it('should create new round', (done) => {
      const activity = new Activity({
        name: casual.name,
        shortDescription: casual.name,
        description: casual.name,
        faculty: casual.name,
        startTime: new Date(casual.unix_time),
        endTime: new Date(casual.unix_time),
      });

      activity.save((err) => {
        expect(err).to.be.null;
        const round = {
          name: casual.safe_color_name,
          activityId: activity.id,
          start: new Date(casual.unix_time).toISOString(),
          end: new Date(casual.unix_time).toISOString(),
          reservedSeats: casual.integer(10, 40),
          fullCapacity: casual.integer(100, 400),
        };

        chai.request(server)
          .post('/api/rounds')
          .send(round)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.body).to.have.property('success').eq(true);
            expect(res.body).to.have.property('message').eq('Create Round successfull');
            expect(res.body).to.have.property('results');
            expect(res.body.results).to.have.property('name').eql(round.name);
            expect(res.body.results).to.have.property('activityId').eql(round.activityId);
            expect(res.body.results).to.have.property('start').eql(round.start);
            expect(res.body.results).to.have.property('end').eql(round.end);
            expect(res.body.results).to.have.property('seats');
            expect(res.body.results.seats).to.have.property('reserved').eql(round.reservedSeats);
            expect(res.body.results.seats).to.have.property('fullCapacity').eql(round.fullCapacity);
            expect(res.body.results.seats).to.have.property('avaliable').eql(round.fullCapacity - round.reservedSeats);
            done();
          });
      });
    });

    it('should return error on not matched activity found (random ObjectId of activity)', (done) => {
      const round = {
        name: casual.safe_color_name,
        activityId: ObjectId(),
        start: new Date(casual.unix_time).toISOString(),
        end: new Date(casual.unix_time).toISOString(),
        reservedSeats: casual.integer(10, 40),
        fullCapacity: casual.integer(100, 400),
      };

      chai.request(server)
        .post('/api/rounds')
        .send(round)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('status').eq('403');
          done();
        });
    });

    it('should return error on missing required field', (done) => {
      const round = {
        name: casual.safe_color_name,
        start: new Date(casual.unix_time).toISOString(),
        reservedSeats: casual.integer(10, 40),
        fullCapacity: casual.integer(100, 400),
      };

      chai.request(server)
        .post('/api/rounds')
        .send(round)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('additionMessage').eq('Missing required field.');
          done();
        });
    });
  });

  describe('GET /api/rounds/:id', () => {
    let round;
    before((done) => {
      const activity = new Activity({
        name: casual.name,
        shortDescription: casual.name,
        description: casual.name,
        faculty: casual.name,
        startTime: new Date(casual.unix_time),
        endTime: new Date(casual.unix_time),
      });
      activity.save((err) => {
        if (err) {
          done(err);
        }
        round = new Round({
          name: casual.safe_color_name,
          activityId: activity.id,
          start: new Date(casual.unix_time),
          end: new Date(casual.unix_time),
          seats: {
            reserved: casual.integer(10, 40),
            fullCapacity: casual.integer(100, 400),
          }
        });
        round.save(done);
      });
    });

    it('should receive correct round', (done) => {
      chai.request(server)
        .get(`/api/rounds/${round.id}`)
        .send()
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('results').to.be.a('object');
          expect(res.body.results).to.have.property('_id').eq(round.id);
          done();
        });
    });

    it('should return error on No Exist Round', (done) => {
      chai.request(server)
        .get(`/api/rounds/${ObjectId()}`)
        .send()
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property('success').eq(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('status').eq('403');
          done();
        });
    });
  });

  describe('PUT /api/rounds/:id', () => {
    let round;
    before((done) => {
      const activity = new Activity({
        name: casual.name,
        shortDescription: casual.name,
        description: casual.name,
        faculty: casual.name,
        startTime: new Date(casual.unix_time),
        endTime: new Date(casual.unix_time),
      });
      activity.save((err) => {
        if (err) {
          done(err);
        }
        round = new Round({
          name: casual.safe_color_name,
          activityId: activity.id,
          start: new Date(casual.unix_time),
          end: new Date(casual.unix_time),
          seats: {
            reserved: casual.integer(10, 40),
            fullCapacity: casual.integer(100, 400),
          }
        });
        round.save(done);
      });
    });

    it('should change rounds documents data', (done) => {
      const change = {
        name: casual.company_name,
        fullCapacity: 500,
      };

      chai.request(server)
        .put(`/api/rounds/${round.id}`)
        .send(change)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.have.property('name').eq(change.name);
          expect(res.body.results).to.have.property('seats');
          expect(res.body.results.seats).to.have.property('fullCapacity').eq(change.fullCapacity);
          expect(res.body.results.seats).to.have.property('avaliable').eq(change.fullCapacity - round.seats.reserved);
          done();
        });
    });
  });

  describe('DELETE /api/rounds/:id', () => {
    let round;
    before((done) => {
      const activity = new Activity({
        name: casual.name,
        shortDescription: casual.name,
        description: casual.name,
        faculty: casual.name,
        startTime: new Date(casual.unix_time),
        endTime: new Date(casual.unix_time),
      });
      activity.save((err) => {
        if (err) {
          done(err);
        }
        round = new Round({
          name: casual.safe_color_name,
          activityId: activity.id,
          start: new Date(casual.unix_time),
          end: new Date(casual.unix_time),
          seats: {
            reserved: casual.integer(10, 40),
            fullCapacity: casual.integer(100, 400),
          }
        });
        round.save(done);
      });
    });

    it('should remove target round', (done) => {
      chai.request(server)
        .delete(`/api/rounds/${round.id}`)
        .send()
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body).to.have.property('success').eq(true);
          expect(res.body).to.have.property('message').eq(`Round id ${round.id} was removed.`);
          done();
        });
    });
  });
});
