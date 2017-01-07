const express = require('express');
const { Activity, Round, Ticket } = require('../../../models');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router();

/**
 * Get Rounds list
 * Access at GET https://localhost:8080/api/rounds
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
 * @return {ObjectId} queryInfo.activity - Owning activity ID.
 */
router.get('/', (req, res) => {
  const filter = {
    activityId: req.params.id,
  };
  let sort = {};
  let limit;
  let skip = 0;
  let fields;
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
          activity: req.params.id,
        }
      });
    });
});
