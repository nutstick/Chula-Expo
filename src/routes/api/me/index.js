const express = require('express');
const { User, Ticket } = require('../../../models');
const { retrieveError, RangeQuery } = require('../../../tools/retrieveError');
const { isAuthenticatedByToken } = require('../../../config/authenticate');

const router = express.Router();

const avaliableFields = ['name', 'email', 'age', 'gender', 'pictureUrl', 'type', 'academic', 'worker'];

router.use(isAuthenticatedByToken);
/**
 * Get user by token
 * Access at GET http://localhost:8080/api/me
 * @param {string} fields
 *
 * @return {boolean} success - Successful querying flag.
 * @return {User} results - Token owner results.
 */
router.get('/', (req, res) => {
  let fields = [];
  // Fields selecting query
  if (req.query.fields) {
    fields = req.query.fields.split(',')
      .reduec((prev, field) => (avaliableFields.find(f => f === field)), []);
  }
  if (fields.length === 0) {
    fields = avaliableFields;
  }
  // Create query from filter
  User.findById(req.user.id)
    .select(fields.join(' '))
    .exec((err, me) => {
      if (err) {
        return res.json({
          success: false,
          errors: retrieveError(5, err)
        });
      }
      res.json({
        success: true,
        results: me,
      });
    });
});

/**
 * Update token owner user infomation
 * Access at GET http://localhost:8080/api/me
 * @param {string} [name]
 * @param {string} [email]
 * @param {number} [age]
 * @param {string} [gender]
 * @param {string} [pictureUrl]
 * @param {string} [type]
 * @param {number} [ัyear]
 * @param {string} [ัschool]
 * @param {string} [ัcompony]
 *
 * @return {boolean} success - Successful request.
 * @return {string} message - Successful message.
 * @return {User} results - Updated user.
 */
router.put('/', (req, res) => {
  if (req.body.name) {
    req.user.name = req.body.name;
  }
  if (req.body.email) {
    req.user.email = req.body.email;
  }
  if (req.body.age) {
    req.user.age = Number.parseInt(req.body.age, 10);
  }
  if (req.body.gender) {
    req.user.gender = req.body.gender;
  }
  if (req.body.pictureUrl) {
    req.user.pictureUrl = req.body.pictureUrl;
  }
  if (req.body.type) {
    req.user.type = req.body.type;
  }
  if (req.user.type === 'Academic') {
    if (req.body.year) {
      req.user.academic.year = Number.parseInt(req.body.year, 10);
    }
    if (req.body.school) {
      req.user.academic.school = req.body.school;
    }
    if (!req.user.academic.school || !req.user.academic.year) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(27, 'Missing Academic infomation (year, school) of tager user.'),
      });
    }
  } else if (req.user.type === 'Worker') {
    if (req.body.company) {
      req.user.worker.company = req.body.company;
    }
    if (!req.user.worker.company) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(27, 'Missing Work infomation (company) of target user.'),
      });
    }
  }

  // Save User and check for error
  req.user.save((err, _user) => {
    // Handle error from save
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }

    res.status(202).json({
      success: true,
      message: 'Update user infomation successfull',
      results: _user,
    });
  });
});

/**
 * Get account infomation
 * Access at GET http://localhost:8080/api/me/account
 * @return {boolean} success - Successful request flag.
 * @return {Object} results - Results.
 * @return {string} results.admin - Admin type.
 * @return {string} results.email - User's email.
 * @return {string} results.facebook - User's facebook accessId.
 */
router.get('/account', (req, res) => {
  res.json({
    success: true,
    results: {
      admin: req.user.admin,
      email: req.user.email,
      facebook: req.user.facebook,
    },
  });
});

/**
 * Get games that user played
 * Access at GET http://localhost:8080/api/me/games
 * @return {boolean} success - Successful request flag.
 * @return {Object} results - Results.
 * @return {number} results.totalScore - Total score of all games that user played.
 * @return {Game[]} results.pending - Pending paay games.
 * @return {Game[]} results.passed - Passed games.
 */
router.get('/games', (req, res) => {
  res.json({
    success: true,
    results: req.user.game,
  });
});

/**
 * Get all bookmark activities
 * Access at GET http://localhost:8080/api/me/activities
 */
router.get('/activities', (req, res) => {});

/**
 * Get all reserved reservable activities's rounds
 * Access at GET http://localhost:8080/api/me/rounds
 * @param {string} [name] - Get matched round's name.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
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
router.get('/rounds', (req, res) => {
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
});

module.exports = router;
