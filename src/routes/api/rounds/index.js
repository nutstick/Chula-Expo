const express = require('express');
const { Activity, Round, Ticket } = require('../../../models');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router();

/**
 * Get Rounds list
 * Access at GET https://localhost:8080/api/rounds
 * @param {string} [name] - Get matched round's name.
 * @param {ObjectId} [activityId] - Get by matches activity ID.
 * @param {ObjectId} [userId] - Get rounds own by user.
 * @param {ObjectId} [ticketId] - Get round of ticket.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {number | RangeQuery<number>} [avaliableSeats] - Get by avaliable seats.
 * @param {string} [sort] - Sort fields (ex. "-start,+createAt").
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * Accessible fields { name, activityId, start, end, fullCapacity, avaliableSeats, reservedSeats }
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round[]} results - Result rounds for the query.
 * @return {Object} queryInfo - Metadat query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that match the query.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 */
router.get('/', (req, res) => {
  const filter = {};
  let sort = {};
  let limit;
  let skip = 0;
  let fields;
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
  // Avaliable seats range query
  if (req.query.avaliableSeats) {
    filter['seats.avaliable'] = RangeQuery(JSON.parse(req.query.avaliableSeats), 'number');
  }
  // Sorting query
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery.substr(1);
      if (sortFields === 'fullCapacity') {
        sortFields = 'seats.capacity';
      }
      if (sortFields === 'reservedSeats') {
        sortFields = 'seats.reserved';
      }
      if (sortFields === 'avaliableSeats') {
        sortFields = 'seats.avaliable';
      }

      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else if (sortQuery[0] === '+') {
        prev[sortFields] = 1;
      }
      return prev;
    }, {});
  }
  // Limit query
  if (req.query.limit) {
    limit = Number.parseInt(req.query.limit, 10);
  }
  // Skip query
  if (req.query.skip) {
    skip = Number.parseInt(req.query.skip, 10);
  }
  // Fields selecting query
  if (req.query.fields) {
    fields = req.query.fields.split(',').map((field) => {
      if (field === 'fullCapacity') {
        return 'seats.capacity';
      }
      if (field === 'reservedSeats') {
        return 'seats.reserved';
      }
      if (field === 'avaliableSeats') {
        return 'seats.avaliable';
      }
      return field;
    }).join(' ');
  }

  // User ID
  if (req.query.userId) {
    Ticket.find({ user: req.query.userId }).count().exec((err, count) => {
      if (err) {
        res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }

      Ticket.find({ user: req.query.userId })
        .populate('round', fields, filter, { sort, skip, limit })
        .exec((err, results) => {
          if (err) {
            return res.json({
              success: false,
              errors: retrieveError(5, err),
            });
          }

          res.json({
            success: true,
            results: results.map(res => res.round),
            queryInfo: {
              total: count,
              limit,
              skip,
              user: req.query.userId,
            }
          });
        });
    });
  } else if (req.query.ticketId) {
    Ticket.findById(req.query.ticketId)
      .populate('round', fields, filter, { sort, skip, limit })
      .exec((err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            errors: retrieveError(5, err),
          });
        } else if (!result) {
          return res.status(403).json({
            success: false,
            errors: retrieveError(26),
          });
        }

        res.json({
          success: true,
          results: result.round,
          queryInfo: {
            total: 1,
            limit,
            skip,
            user: req.query.userId,
          }
        });
      });
  } else {
    // Create query from filter
    let query = Round.find(filter);
    // Counting all results
    query.count().exec((err, count) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }

      // Custom query by input filter, fields, sort, skip ,limit
      query = Round.find(filter)
        .select(fields)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      // Execute query
      query.exec((err, rounds) => {
        if (err) {
          return res.status(500).json({
            success: false,
            errors: retrieveError(5, err),
          });
        }

        res.json({
          success: true,
          results: rounds,
          queryInfo: {
            total: count,
            limit,
            skip,
          }
        });
      });
    });
  }
});

/**
 * Create Round
 * Access at POST http://localhost:8080/api/rounds
 * @param {string} name - Round name.
 * @param {ObjectId} activityId - Related activity id.
 * @param {Date} start - Start time of round.
 * @param {Date} end - End time of round.
 * @param {number} [reservedSeats] - Number of reserved seats.
 * @param {number} fullCapacity - Number of full capacity seats.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round} results - Created Round.
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
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      // Related activity not found
      if (!activitiy) {
        return res.status(403).json({
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
      if (req.body.reservedSeats) {
        round.seats.reserved = req.body.reservedSeats;
      }

      // Save User and check for error
      round.save((err, _round) => {
        // Handle error from save
        if (err) {
          return res.status(500).json({
            success: false,
            errors: retrieveError(5, err),
          });
        }

        res.status(201).json({
          success: true,
          message: 'Create Round successfull',
          results: _round,
        });
      });
    });
  } else {
    res.status(500).json({
      success: false,
      errors: retrieveError(5, 'Missing required field.'),
    });
  }
});

/**
 * Get Round by specific ID
 * Access at GET http://localhost:8080/api/rounds/:id
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round} results - The Matched Round by id.
 */
router.get('/:id', (req, res) => {
  let fields;

  // Fields selecting query
  if (req.query.fields) {
    fields = req.query.fields.split(',').map((field) => {
      if (field === 'fullCapacity') {
        return 'seats.capacity';
      }
      if (field === 'reservedSeats') {
        return 'seats.reserved';
      }
      if (field === 'avaliableSeats') {
        return 'seats.avaliable';
      }
      return field;
    }).join(' ');
  }
  // Get round from instance round model by ID
  Round.findById(req.params.id, fields, (err, round) => {
    // Handle error from Round.findById
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    // Round isn't exist.
    if (!round) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }

    res.json({
      success: true,
      results: round,
    });
  });
});

/**
 * PUT Edit round of specific ID
 * Access at PUT http://localhost:8080/api/rounds/:id
 * @param {string} [name] - Round name.
 * @param {Date} [start] - Start time of round.
 * @param {Date} [end] - End time of round.
 * @param {number} [reservedSeats] - Number of reserved seats.
 * @param {number} [fullCapacity] - Number of full capacity seats.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round} results - Updated Round.
 */
router.put('/:id', (req, res) => {
  Round.findById(req.params.id, (err, round) => {
    if (req.body.name) {
      round.name = req.body.name;
    }
    if (req.body.start) {
      round.start = new Date(req.body.start);
    }
    if (req.body.end) {
      round.end = new Date(req.body.end);
    }
    if (req.body.fullCapacity) {
      round.seats.fullCapacity = req.body.fullCapacity;
    }

    round.save((err, _round) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      res.status(202).json({
        success: true,
        results: _round,
      });
    });
  });
});

/**
 * DELETE Remove round by specific ID
 * Access at DELETE http://localhost:8080/api/rounds/:id
 */
router.delete('/:id', (req, res) => {
  Round.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    res.status(202).json({
      success: true,
      message: `Round id ${req.params.id} was removed.`,
    });
  });
});

module.exports = router;
