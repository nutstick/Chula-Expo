const express = require('express');
const { Activity, Round } = require('../../../models');
const { isAuthenticatedByToken } = require('../../../config/authenticate');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router({ mergeParams: true });

/**
 * Get Rounds list of specific activity
 * Access at GET https://localhost:8080/api/activities/:id/rounds
 * @param {string} [name] - Get by name.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {number | RangeQuery<number>} [seatsAvaliable] - Get by avaliable seats.
 * @param {string} [sort] - Sort fields (ex. "-start,+createAt").
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * Accessible fields { name, activityId, start, end, fullCapacity, seatsAvaliable, reservedSeats }
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round[]} results - Result rounds for the query.
 * @return {Object} queryInfo - Metadata query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that match the query.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 * @return {ObjectId} queryInfo.activity - Owning activity ID.
 */
router.get('/', (req, res) => {
  const filter = {};

  // Sorting query
  if (req.query.sort) {
    filter.sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery.substr(1);
      if (sortFields === 'nameEN') {
        sortFields = 'name.en';
      }
      if (sortFields === 'nameTH') {
        sortFields = 'name.th';
      }
      if (sortFields === 'seatsFullCapacity') {
        sortFields = 'seats.fullCapacity';
      }
      if (sortFields === 'seatsReserved') {
        sortFields = 'seats.reserved';
      }
      if (sortFields === 'seatsAvaliable') {
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

  // Fields selecting query
  if (req.query.fields) {
    filter.fields = req.query.fields.split(',').map((field) => {
      if (field === 'nameTH') {
        return 'name.th';
      }
      if (field === 'nameEN') {
        return 'name.en';
      }
      if (field === 'seatsFullCapacity') {
        return 'seats.fullCapacity';
      }
      if (field === 'seatsReserved') {
        return 'seats.reserved';
      }
      if (field === 'seatsAvaliable') {
        return 'seats.avaliable';
      }
      return field;
    }).join(' ');
  }

  filter.find = {};
  filter.find.activityId = req.params.id;
  Round.find(filter.find).select(filter.fields).exec((err, rounds) => {
    if (err) {
      // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    return res.status(200).json({
      success: true,
      results: rounds
    });
  });
});

/**
 * Create Round
 * Access at POST http://localhost:8080/api/activities/:id/rounds
 * @param {string} name - Round name.
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
  if (req.body.nameEN &&
    req.body.start && req.body.end && req.body.seatsFullCapacity) {
    // Check exist target activity input
    Activity.findById(req.params.id, (err, activitiy) => {
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
      round.activityId = req.params.id;
      round.name.th = req.body.nameTH;
      round.name.en = req.body.nameEN;
      round.start = new Date(req.body.start);
      round.end = new Date(req.body.end);
      // round.tickets = [];
      round.seats.fullCapacity = req.body.seatsFullCapacity;
      if (req.body.seatsReserved) {
        round.seats.reserved = req.body.seatsReserved;
      }

      // Save Round and check for error
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
 * Access at GET http://localhost:8080/api/activities/:id/rounds/:rid
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round} results - The Matched Round by id.
 */
router.get('/:rid', (req, res) => {
  let fields;
  // Fields selecting query
  if (req.query.fields) {
    fields = req.query.fields.split(',').map((field) => {
      if (field === 'seatsFullCapacity') {
        return 'seats.capacity';
      }
      if (field === 'reservedSeats') {
        return 'seats.reserved';
      }
      if (field === 'seatsAvaliable') {
        return 'seats.avaliable';
      }
      return field;
    }).join(' ');
  }
  // Get round from instance round model by ID
  Round.findById(req.params.rid, fields, (err, round) => {
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
    // Round is not belong to Activity
    if (round.activityId !== req.param.id) {
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
 * Access at PUT http://localhost:8080/api/activities/:id/rounds/:rid
 * @param {string} [name] - Round name.
 * @param {Date} [start] - Start time of round.
 * @param {Date} [end] - End time of round.
 * @param {number} [reservedSeats] - Number of reserved seats.
 * @param {number} [fullCapacity] - Number of full capacity seats.
 *
 * @return {boolean} success - Successful updating flag.
 * @return {Round} results - Updated Round.
 */
router.put('/:rid', (req, res) => {
  Round.findById(req.params.id, (err, round) => {
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
    // Round is not belong to Activity
    if (round.activityId !== req.param.id) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }

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
        message: 'Update round successfull',
        results: _round,
      });
    });
  });
});

/**
 * DELETE Remove round by specific ID
 * Access at DELETE http://localhost:8080/api/activities/:id/rounds/:rid
 *
 * @return {boolean} success - Successful removing flag.
 * @return {string} message - Remove message.
 */
router.delete('/:rid', (req, res) => {
  Round.findByIdA(req.params.rid, (err, round) => {
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
    // Round is not belong to Activity
    if (round.activityId !== req.param.id) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }
    // Remove the round
    round.remove((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      res.status(202).json({
        success: true,
        message: `Round id ${req.params.rid} was removed.`,
      });
    });
  });
});

/**
 * Reserve round
 * Access at POST http://localhost:8080/api/activities/:id/rounds/:rid/reserve
 * Authenticate: JWT token
 *
 * @return {boolean} success - Successful querying flag.
 * @return {string} message - Creating ticket message.
 * @return {Round} results - Ticket.
 */
router.post('/:rid/reserve', isAuthenticatedByToken, (req, res) => {
  // Get round from instance round model by ID
  Round.findById(req.params.rid, (err, round) => {
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
    // Round is not belong to Activity
    if (round.activityId !== req.param.id) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }

    round.reserve(req.user.id)
      .then(results => (
        res.status(201).json({
          success: true,
          message: 'Created Ticket Successful',
          results,
        })
      ))
      .catch(err => (err.code ? res.status(retrieveError(err.code)).json({
        success: false,
        errors: retrieveError(err.code),
      }) : res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      })));
  });
});

module.exports = router;
