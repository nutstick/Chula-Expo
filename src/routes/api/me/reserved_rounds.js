const express = require('express');
const _ = require('lodash');
const { Ticket, Round } = require('../../../models');
const { retrieveError, RangeQuery } = require('../../../tools/retrieveError');

const router = express.Router();

const accessibleFields = ['checked', 'size', 'name', 'activityId', 'start', 'end', 'seatsFullCapacity', 'seats.avaliable', 'seats.reserved'];
/**
 * Get all reserved reservable activities's rounds
 * Access at GET http://localhost:8080/api/me/reserved_rounds
 * @param {string} [name] - Get matched round's name.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {string} [sort] - Sort fields (ex. "-start,+createAt").
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * Accessible fields { name, activityId, start, end, fullCapacity, seatsAvaliable, seatsReserved }
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round[] + check} results - Result rounds for the query.
 * @return {Object} queryInfo - Metadata query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that match the query.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 * @return {number} queryInfo.user - User's used to query.
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
  // Round's start time range query
  if (req.query.start) {
    filter.start = RangeQuery(JSON.parse(req.query.start), 'Date');
  }
  // Round's end time range query
  if (req.query.end) {
    filter.end = RangeQuery(JSON.parse(req.query.end), 'Date');
  }
  // Sorting query
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery.substr(1);
      if (sortFields === 'seatsFullCapacity') {
        sortFields = 'seats.capacity';
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
    fields = _.intersection(req.query.fields.split(',').map((field) => {
      if (field === 'seatsFullCapacity') {
        return 'seats.capacity';
      }
      if (field === 'seatsReserved') {
        return 'seats.reserved';
      }
      if (field === 'seatsAvaliable') {
        return 'seats.avaliable';
      }
      return field;
    }), accessibleFields).join(' ');
  }

  Ticket.find({ user: req.user.id }).count().exec((err, count) => {
    if (err) {
      res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }

    Ticket.find({ user: req.user.id }, fields)
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
          results: results.map(result =>
            Object.assign({ checked: result.checked, size: result.size },
            (result.round && result.round._doc) || {})),
          queryInfo: {
            total: count,
            limit,
            skip,
            user: req.user.id,
          }
        });
      });
  });
});

/**
 * Get reserved reservable activities's rounds by specific Id
 * Access at GET http://localhost:8080/api/me/reserved_rounds/:rid
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 *
 * Accessible fields { name, activityId, start, end, fullCapacity, seatsAvaliable, seatsReserved }
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round[] + check} results - Result rounds for the query.
 * @return {Object} queryInfo - Metadata query information.
 * @return {ObjectId} queryInfo.user - User's used to query.
 * @return {ObjectId} queryInfo.round - Round's used to query.
 */
router.get('/:rid', (req, res) => {
  let fields;
  // Fields selecting query
  if (req.query.fields) {
    fields = _.intersection(req.query.fields.split(',').map((field) => {
      if (field === 'seatsFullCapacity') {
        return 'seats.capacity';
      }
      if (field === 'seatsReserved') {
        return 'seats.reserved';
      }
      if (field === 'seatsAvaliable') {
        return 'seats.avaliable';
      }
      return field;
    }), accessibleFields).join(' ');
  }
  // Find one match user and round
  Ticket.findOne({ user: req.user.id, round: req.param.rid })
    .populate('round', fields)
    .exec((err, results) => {
      // Handle error from Ticket.findOne
      if (err) {
        res.status(500).json({
          success: false,
          errors: retrieveError(5, err),
        });
      }
      // Ticket isn't exist
      if (!results) {
        return res.status(403).json({
          success: false,
          errors: retrieveError(27, 'You not reserve that round yet.'),
        });
      }
      res.json({
        success: true,
        results: Object.assign({ check: results.check }, results.round),
        queryInfo: {
          user: req.user.id,
          round: req.param.rid,
        }
      });
    });
});

/**
 * Cancel reserving ticket from Specific round
 * Access at DELETE http://localhost:8080/api/me/reserved_rounds/:rid
 *
 * @return {boolean} success - Successful removing flag.
 * @return {string} message - Remove message.
 */
router.delete('/:rid', (req, res) => {
    // Handle error from Ticket.findOne
  Round.findById(req.param.rid, (err, round) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    // Round isn't exist
    if (!round) {
      return res.sendError(26);
    }
    round.cancelReservedSeat(req.user.id)
      .then(() => (
        res.status(201).json({
          success: true,
          message: `Successfully cancel reserved round ${req.params.id}.`,
        })
      ))
      .catch(err => (err.code ? res.sendError(err.code) : res.sendError(5, err)));
  });
});

module.exports = router;
