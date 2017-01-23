const express = require('express');
const { Room} = require('../../../models');
const { isAuthenticatedByToken } = require('../../../config/authenticate');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router();

/**
 * Get Rooms list of specific place
 * Access at GET https://localhost:8080/api/activities/:id/rooms
 * @param {string} [name] - Get by name.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {number | RangeQuery<number>} [avaliableSeats] - Get by avaliable seats.
 * @param {string} [sort] - Sort fields (ex. "-start,+createAt").
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * Accessible fields { name, placeId, start, end, fullCapacity, avaliableSeats, reservedSeats }
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Room[]} results - Result rooms for the query.
 * @return {Object} queryInfo - Metadata query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that match the query.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 * @return {ObjectId} queryInfo.place - Owning place ID.
 */
router.get('/en/places', (req, res) => {
  const filter = {};
  // Room's start time range query
  if (req.query.name) {
    filter.name.en = req.query.name;
  }
  // Sorting query
  if (req.query.sort) {
    filter.sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery.substr(1);
      if (sortFields === 'floor') {
        sortFields = 'floor';
      }
      if (sortFields === 'roomName') {
        sortFields = 'roomName.en';
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
    filter.limit = Number.parseInt(req.query.limit, 10);
  }
  // Skip query
  if (req.query.skip) {
    filter.skip = Number.parseInt(req.query.skip, 10);
  }
  // Fields selecting query
  if (req.query.fields) {
    filter.fields = req.query.fields.split(',').map((field) => {
      if (field === 'roomName') {
        return 'roomName.en';
      }
      return field;
    }).join(' ');
  }
  Place
    .findRoomByPlaceId(req.params.id, filter)
    .then((results) => {
      res.json({
        success: true,
        results: results.rooms,
        queryInfo: {
          limit: results.limit,
          skip: results.skip,
          place: req.params.id,
        }
      });
    })
    .catch((err) => {
      if (err.code) {
        return res.status(retrieveError(err.code).status).json({
          success: false,
          errors: retrieveError(err.code),
        });
      }
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    });
});

/**
 * Create Room
 * Access at POST http://localhost:8080/api/activities/:id/rooms
 * @param {string} name - Room name.
 * @param {Date} start - Start time of room.
 * @param {Date} end - End time of room.
 * @param {number} [reservedSeats] - Number of reserved seats.f
 * @param {number} fullCapacity - Number of full capacity seats.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Room} results - Created Room.
 */
router.post('/', (req, res) => {
  // Create a new instance of the User model
  const room = new Room();
  // Validate required field from body
  if (req.body.name &&
    req.body.start && req.body.end && req.body.fullCapacity) {
    // Check exist target place input
    Place.findById(req.param.id, (err, activitiy) => {
      // Handle error from Place.findById
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      // Related place not found
      if (!activitiy) {
        return res.status(403).json({
          success: false,
          errors: retrieveError(25),
        });
      }

      // Set field value (comes from the request)
      room.placeId = req.param.id;
      room.name = req.body.name;
      room.start = new Date(req.body.start);
      room.end = new Date(req.body.end);
      // room.tickets = [];
      room.seats.fullCapacity = req.body.fullCapacity;
      if (req.body.reservedSeats) {
        room.seats.reserved = req.body.reservedSeats;
      }

      // Save Room and check for error
      room.save((err, _room) => {
        // Handle error from save
        if (err) {
          return res.status(500).json({
            success: false,
            errors: retrieveError(5, err),
          });
        }

        res.status(201).json({
          success: true,
          message: 'Create Room successfull',
          results: _room,
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
 * Get Room by specific ID
 * Access at GET http://localhost:8080/api/activities/:id/rooms/:rid
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Room} results - The Matched Room by id.
 */
router.get('/:rid', (req, res) => {
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
  // Get room from instance room model by ID
  Room.findById(req.params.rid, fields, (err, room) => {
    // Handle error from Room.findById
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    // Room isn't exist.
    if (!room) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }
    // Room is not belong to Place
    if (room.placeId !== req.param.id) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }

    res.json({
      success: true,
      results: room,
    });
  });
});

/**
 * PUT Edit room of specific ID
 * Access at PUT http://localhost:8080/api/activities/:id/rooms/:rid
 * @param {string} [name] - Room name.
 * @param {Date} [start] - Start time of room.
 * @param {Date} [end] - End time of room.
 * @param {number} [reservedSeats] - Number of reserved seats.
 * @param {number} [fullCapacity] - Number of full capacity seats.
 *
 * @return {boolean} success - Successful updating flag.
 * @return {Room} results - Updated Room.
 */
router.put('/:rid', (req, res) => {
  Room.findById(req.params.id, (err, room) => {
    // Handle error from Room.findById
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    // Room isn't exist.
    if (!room) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }
    // Room is not belong to Place
    if (room.placeId !== req.param.id) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }

    if (req.body.name) {
      room.name = req.body.name;
    }
    if (req.body.start) {
      room.start = new Date(req.body.start);
    }
    if (req.body.end) {
      room.end = new Date(req.body.end);
    }
    if (req.body.fullCapacity) {
      room.seats.fullCapacity = req.body.fullCapacity;
    }

    room.save((err, _room) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      res.status(202).json({
        success: true,
        message: 'Update room successfull',
        results: _room,
      });
    });
  });
});

/**
 * DELETE Remove room by specific ID
 * Access at DELETE http://localhost:8080/api/activities/:id/rooms/:rid
 *
 * @return {boolean} success - Successful removing flag.
 * @return {string} message - Remove message.
 */
router.delete('/:rid', (req, res) => {
  Room.findByIdA(req.params.rid, (err, room) => {
    // Handle error from Room.findById
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    // Room isn't exist.
    if (!room) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }
    // Room is not belong to Place
    if (room.placeId !== req.param.id) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }
    // Remove the room
    room.remove((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      res.status(202).json({
        success: true,
        message: `Room id ${req.params.rid} was removed.`,
      });
    });
  });
});

/**
 * Reserve room
 * Access at POST http://localhost:8080/api/activities/:id/rooms/:rid/reserve
 * Authenticate: JWT token
 *
 * @return {boolean} success - Successful querying flag.
 * @return {string} message - Creating ticket message.
 * @return {Room} results - Ticket.
 */
router.post('/:rid/reserve', isAuthenticatedByToken, (req, res) => {
  // Get room from instance room model by ID
  Room.findById(req.params.rid, (err, room) => {
    // Handle error from Room.findById
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    // Room isn't exist.
    if (!room) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }
    // Room is not belong to Place
    if (room.placeId !== req.param.id) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26),
      });
    }

    room.reserve(req.user.id)
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
