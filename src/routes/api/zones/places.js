const express = require('express');
const Place = require('../../../models/Place');
const Zone = require('../../../models/Zone');
const retrieveError = require('../../../tools/retrieveError');

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
router.get('/:id/place/', (req, res) => {
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
// initial filter : name query
  const filter = {};

  if (req.query.nameEN) {
    filter['name.en'] = { $regex: req.query.nameEN };
  }

  filter.zone = req.params.zoneid;

//----------------------------------------------------------------
// initial limit
  let limit;
  if (req.query.limit) {
    limit = Number.parseInt(req.query.limit, 10);
  }
  // initital skip
  let skip;
  if (req.query.skip) {
    skip = Number.parseInt(req.query.skip, 10);
  }
  //----------------------------------------------------------------
  // initial sort : sort query
  let sort = {};
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery[0] === '-' ? sortQuery.substr(1) : sortQuery;
      if (sortFields === 'nameEN') sortFields = 'name.en';

      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else {
        prev[sortFields] = 1;
      }
      return prev;
    }, {});
  }
//----------------------------------------------------------------
  Place.find(filter)
  .select(fields).sort(sort).skip(skip)
  .limit(limit)
  .exec(
  (err, places) => {
    if (err) {
      return res.status(500).send({
        success: false,
        errors: retrieveError(5, err)
      });
    }

    return res.status(200).json({
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

router.post('/:id/place/', (req, res, next) => {
   // Create object

  const place = new Place();

   // Set field value (comes from the request)
  place.name.en = req.body.nameEN;
  place.name.th = req.body.nameTH;

  place.zone = req.params.id;

  if (req.body.code) {
    place.code = req.body.code;
  }
  place.location.latitute = req.body.locationLat;
  place.location.longtitute = req.body.locationLong;

  // Save place and check for error
  place.save((err, _place) => {
    if (err) {
      // Handle error from save
      next(err);
    }
    return res.status(201).json({
      success: true,
      results: _place
    });
    Zone.findOneAndUpdate({
      _id: req.body.zone
    }, {
      $addToSet: { places: _place._id }
    }, (err, places) => {
      if (err) {
        return res.status(400).send({
          message: 'Error add  place to zone'
        });
      } else {

      }
    });
  });
});

router.delete('/:id/place/', (req, res) => {
  Place.remove({ zone: req.params.id }, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    res.status(202).json({
      success: true,
      message: `An Place with id ${req.params.id} was removed.`
    });
  });
});

module.exports = router;
