const express = require('express');
const { Activity, Round, Ticket } = require('../../../models');
const RangeQuery = require('../../../tools/RangeQuery');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');

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
  const filter = { activityId: req.params.id };
  let sort = {};
  let limit;
  let skip = 0;
  let fields;
  // Round's name
  if (req.query.name) {
    filter.name = req.query.name;
  }
  // Activity ID
  // Round's start time range query
  if (req.query.start) {
    filter.start = RangeQuery(JSON.parse(req.query.start), 'Date');
  }
  // Round's end time range query
  if (req.query.end) {
    filter.end = RangeQuery(JSON.parse(req.query.end), 'Date');
  }
  // Avaliable seats range query
  if (req.query.seatsAvaliable) {
    filter['seats.avaliable'] = RangeQuery(JSON.parse(req.query.seatsAvaliable), 'number');
  }
  // Sorting query
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery[0] === '-' ? sortQuery.substr(1) : sortQuery;
      if (sortFields === 'seatsFullCapacity') {
        sortFields = 'seats.FullCapacity';
      }
      if (sortFields === 'seatsReserved') {
        sortFields = 'seats.reserved';
      }
      if (sortFields === 'seatsAvaliable') {
        sortFields = 'seats.avaliable';
      }

      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else {
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
      if (field === 'seatsFullCapacity') {
        return 'seats.FullCapacity';
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

  // Create query from filter
  let query = Round.find(filter);
  // Counting all results
  query.count().exec((err, count) => {
    if (err) {
      return res.sendError(5, err);
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
        return res.sendError(5, err);
      }

      return res.status(200).json({
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
router.post('/', isAuthenticatedByToken, isStaff, (req, res) => {
  // Create a new instance of the User model
  const round = new Round();
  // Validate required field from body
  if (req.body.nameEN &&
    req.body.start && req.body.end && req.body.seatsFullCapacity) {
    // Check exist target activity input
    Activity.findById(req.params.id, (err, activitiy) => {
      // Handle error from Activity.findById
      if (err) {
        return res.sendError(5, err);
      }
      // Related activity not found
      if (!activitiy) {
        return res.sendError(25, err);
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
          return res.sendError(5, err);
        }

        return res.status(201).json({
          success: true,
          message: 'Create Round successfull',
          results: _round,
        });
      });
    });
  } else {
    return res.sendError(5, 'Missing required field.');
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
      return res.sendError(5, err);
    }
    // Round isn't exist.
    if (!round) {
      return res.sendError(26);
    }
    // Round is not belong to Activity
    if (round.activityId.toString() !== req.params.id) {
      return res.sendError(26);
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
router.put('/:rid', isAuthenticatedByToken, isStaff, (req, res) => {
  Round.findById(req.params.id, (err, round) => {
    // Handle error from Round.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Round isn't exist.
    if (!round) {
      return res.sendError(26);
    }
    // Round is not belong to Activity
    if (round.activityId !== req.params.id) {
      return res.sendError(26);
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
        return res.sendError(5, err);
      }
      return res.status(202).json({
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
router.delete('/:rid', isAuthenticatedByToken, isStaff, (req, res) => {
  Round.findByIdA(req.params.rid, (err, round) => {
    // Handle error from Round.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Round isn't exist.
    if (!round) {
      return res.sendError(26);
    }
    // Round is not belong to Activity
    if (round.activityId.toString() !== req.params.id) {
      return res.sendError(26);
    }
    // Remove the round
    round.remove((err) => {
      if (err) {
        return res.sendError(5, err);
      }
      return res.status(202).json({
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
 * @param {seats} count - Number of reserving seats
 *
 * @return {boolean} success - Successful querying flag.
 * @return {string} message - Creating ticket message.
 * @return {Round} results - Ticket.
 */
router.post('/:rid/reserve', isAuthenticatedByToken, (req, res) => {
  let seats = 1;
  if (req.user.type === 'Staff') {
    seats = req.body.seats;
  }

  // Get round from instance round model by ID
  Round.findById(req.params.rid, (err, round) => {
    // Handle error from Round.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Round isn't exist.
    if (!round) {
      return res.sendError(26);
    }
    // Round is not belong to Activity
    if (round.activityId.toString() !== req.params.id) {
      return res.sendError(26);
    }

    round.reserve(req.user.id, round, seats)
      .then(results => (
        res.status(201).json({
          success: true,
          message: 'Created Ticket Successful',
          results,
        })
      ))
      .catch(err => (err.code ? res.sendError(err.code) : res.sendError(5, err)));
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
router.delete('/:rid/reserve', isAuthenticatedByToken, (req, res) => {
  // Get round from instance round model by ID
  Round.findById(req.params.rid, (err, round) => {
    // Handle error from Round.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Round isn't exist.
    if (!round) {
      return res.sendError(26);
    }
    // Round is not belong to Activity
    if (round.activityId.toString() !== req.params.id) {
      return res.sendError(26);
    }

    round.cancelReservedSeat(req.user.id, round)
      .then(() => (
        res.status(201).json({
          success: true,
          message: `Successfully cancel reserved round ${req.params.rid}.`,
        })
      ))
      .catch(err => (err.code ? res.sendError(err.code) : res.sendError(5, err)));
  });
});

router.post('/:rid/checkin', isAuthenticatedByToken, isStaff, (req, res) => {
  const rid = req.params.rid;
  const userId = req.query.user;
  if (req.user.staff.type !== 'Admin') {
    Activity.find({ zone: req.user.staff.zone }, (err) => {
      if (err) {
        res.status(4, err);
      }
    });
  }
  Ticket.find({ round: rid, user: userId }, (err, ticket) => {
    if (err) {
      res.status(5, err);
    }
    ticket.checkIn(ticket._id)
    .then(() => (
      res.status(201).json({
        success: true,
        message: `Successfully check in ticket ${ticket._id} to ${req.params.rid}.`,
      })
    ))
    .catch(err => (err.code ? res.sendError(err.code) : res.sendError(5, err)));
  });
});

router.use('/:rid/tickets', require('./tickets'));

module.exports = router;
