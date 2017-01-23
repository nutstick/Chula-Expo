const express = require('express');
const Place = require('../../../models/Place');
const _ = require('lodash');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router();

/**
 * Get Place list
 * Access at GET https://localhost:8080/api/en/places
 * @param {string} [name] - Get by name.
 * @param {string} [sort] - Sort fields (ex. "+name").
 * @param {string} [fields] - Fields selected (ex. "name").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {places[]} results - Result places from the query.
 * @return {Object} queryInfo - Metadata query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that match the query.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 */
router.get('/', (req, res) => {
//----------------------------------------------------------------
  // initial the fieldwant from request
  let fields = '';
  if (req.query.fields) {
    fields = req.query.fields.replace(',', ' ');
    fields = fields.replace('nameTH', 'name.th');
    fields = fields.replace('nameEN', 'name.en');
    fields = fields.replace('descTH', 'desc.th');
    fields = fields.replace('descEN', 'desc.en');
    fields = fields.replace('locationLat', 'location.latitute');
    fields = fields.replace('locationLong', 'location.longtitute');
  }
//----------------------------------------------------------------
  //initial filter : name query
  const filter = {};
  if (req.query.name) {
    filter.name.en = req.query.name;
  }

   //initial search
   if (req.query.search) {
    filter.search = req.query.search;
  }
//----------------------------------------------------------------
  // initial limit
  if (req.query.limit) {
    const limit = Number.parseInt(req.query.limit, 10);
  }
  // initital skip
  if (req.query.skip) {
    const skip = Number.parseInt(req.query.skip, 10);
  }
  //----------------------------------------------------------------
  // initial sort : sort query
  let sort = {};
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery[0] === '-' ? sortQuery.substr(1) : sortQuery;
      if (sortFields === 'name') sortFields = 'name.en';
      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else {
        prev[sortFields] = 1;
      }
      return prev;
    }, {});
  }
//----------------------------------------------------------------
  Place.find({
    'name.en': { $regex: filter.search } })
  .select(fields).sort(sort).skip(skip)
  .limit(limit)
.exec(
  (err, places) => {
    if (err) {
      return res.status(400).send({
        message: 'Place error'
      });
    }
    res.json({
      success: true,
      results: places
    });
  });
});
 //----------------------------------------------------------------

/**
* Create a new Place
* Access at POST http://localhost:8080/api/en/places
*/
router.post('/', (req, res, next) => {
 // Create object
  const place = new Place();

 // Set field value (comes from the request)
  place.name = req.body.name;
  place.code = req.body.code;
  place.location.latitude = req.body.location.latitude;
  place.location.longtitude = req.body.location.longtitude;


 // Save User and check for error
  place.save((err, _place) => {
    if (err) {
     // Handle error from save
      next(err);
    }

    res.status(300).json(_place);
  });
});
// Update an existing place via PUT(JSON format)
// ex. { "name","EditName"}
// Access at PUT http://localhost:3000/api/en/places/:id
router.put('/:id', (req, res) => {
  Place.findById(req.params.id, (err, place) => {
  // check error first
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
  // check place
    if (!place) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26)
      });
    }
    if (req.body.name)place.name = req.body.name;
    if (req.body.code) place.code = req.body.code;
    if (req.body.location.latitude) place.location.latitude = req.body.location.latitude;


    place.save((err, _place) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      }
      res.status(202).json({
        success: true,
        message: 'Update round successfull',
        results: _place
      });
    });
  });
});

// Delete an existing place via DEL.
// Access at DEL http://localhost:3000/api/en/places/:id
router.delete('/:id', (req, res) => {
  Place.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    res.status(202).json({
      success: true,
      message: 'An Place with id ${req.params.id} was removed.'
    });
  });
});

module.exports = router;
