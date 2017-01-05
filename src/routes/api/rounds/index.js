const express = require('express');
const { Activity, Round } = require('../../../models');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router();

/**
 * Get Rounds list
 * Access at GET https://localhost:8080/api/rounds
 * @param {string} [name] - Get matched round's name.
 * @param {ObjectId} [activityId] - Get by matches activity ID.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {string} [sort] - Sort fields (ex. "-start,+createAt").
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip] - Offset documents.
 */
router.get('/', (req, res) => {
  const filter = {};

  // Round's name
  if (req.query.name) {
    filter.name = req.query.name;
  }
  // Activity ID
  if (req.query.activityId) {
    filter.activityId = req.query.activityId;
  }
  // Round's start time range query
  if (req.query.start) {
    filter.start = RangeQuery(JSON.parse(req.query.start), 'Date');
  }
  // Round's end time range query
  if (req.query.end) {
    filter.end = RangeQuery(JSON.parse(req.query.end), 'Date');
  }
  // Create query from filter
  let query = Round.find(filter);
  // Sorting query
  if (req.query.sort) {
    const sort = req.query.sort.split(',').reduce((res, sortQuery) => {
      if (sortQuery[0] === '-') {
        res[sortQuery.substr(1)] = -1;
      } else {
        res[sortQuery.substr(1)] = 1;
      }
      return res;
    });
    query = query.sort(sort);
  }
  // Fields selecting query
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }
  // Limit query
  if (req.query.limit) {
    query = query.limit(Number.parseInt(req.query.limit, 10));
  }
  // Skip query
  if (req.query.skip) {
    query = query.limit(Number.parseInt(req.query.skip, 10));
  }

  const rounds = query.exec();

  res.json({
    success: true,
    rounds,
    pageInfo: {

    }
  })
});

/**
 * Create Round
 * Access at POST http://localhost:8080/api/rounds
 * @param {string} name - Round name.
 * @param {ObjectId} activityId - Related activity id.
 * @param {Date} start - Start time of round.
 * @param {Date} end - End time of round.
 * @param {number} [reserved] - Number of reserved seats.
 * @param {number} fullCapacity - Number of full capacity seats.
 */
router.post('/', (req, res) => {
  // Create a new instance of the User model
  const round = new Round();
  // Validate required field from body
  if (req.body.activityId && req.body.name &&
    req.body.start && req.body.end && req.body.fullCapacity) {
    // Check exist target activity input
    Activity.findById(req.body.activityId, (err, activitiy) => {
      // Handle error from Activity.findById
      if (err) {
        res.json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      // Related activity not found
      if (!activitiy) {
        res.json({
          success: false,
          errors: retrieveError(25),
        });
      }

      // Set field value (comes from the request)
      round.activityId = req.body.activityId;
      round.name = req.body.name;
      round.start = new Date(req.body.start);
      round.end = new Date(req.body.end);
      round.tickets = [];
      round.seats.fullCapacity = req.body.fullCapacity;
      if (req.body.reserved) {
        round.seats.reserved = req.body.reserved;
      }

      // Save User and check for error
      round.save((err, _round) => {
        // Handle error from save
        if (err) {
          return res.send(err);
        }

        res.status(201).json({
          message: 'Create Round successfull',
          round: _round
        });
      });
    });
  }
});

/**
 * Get Round by specific ID
 * Access at GET http://localhost:8080/api/rounds/:id
 */
router.get('/:id', (req, res) => {
  // Get round from instance round model by ID
  Round.findById(req.params.id, (err, round) => {
    if (err) {
      // Handle error from Round.findById
      return res.send(err);
    }

    res.json({
      success: true,
      data: {
        round,
      }
    });
  });
});

module.exports = router;
