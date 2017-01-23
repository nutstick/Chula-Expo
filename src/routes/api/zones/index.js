const express = require('express');
const Zone = require('../../../models/Zone');
const _ = require('lodash');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router();

/**
 * Get Zone list
 * Access at GET https://localhost:8080/api/en/zones
 * @param {string} [name] - Get by name.
 * @param {string} [sort] - Sort fields (ex. "+name").
 * @param {string} [fields] - Fields selected (ex. "name").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {zones[]} results - Result zones from the query.
 * @return {Object} queryInfo - Metadata query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that match the query.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 */
router.get('/', (req, res) => {
//----------------------------------------------------------------
  // initial the fieldwant from request
  let fieldwant = '';
  if (req.query.fields) {
     req.query.fields.split(',').forEach(function(element){

        if(element==='nameEN') element='name.en';
        fieldwant = fieldwant + element + ' ';

    });
  }
//----------------------------------------------------------------
  //initial filter : name query
  const filter = {};
   

  if (req.query.nameEN) {
        filter['name.en'] = { $regex: req.query.nameEN };
  }

  /* //initial search
   if (req.query.search) {
    filter.search = req.query.search;
  }*/
//----------------------------------------------------------------
  // initial limit
    var limit;
  if (req.query.limit) {
    limit = Number.parseInt(req.query.limit, 10);
  }
  // initital skip
   var skip;
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
    Zone.find(filter)
    .select(fieldwant).sort(sort).skip(skip)
    .limit(limit)
  .exec(
    (err, zones) => {
      if (err) {
        return res.status(400).send({
          message: 'Zone error'
        });
      }
      res.json({
        success: true,
        results: zones
      });
    });
  });
 //----------------------------------------------------------------

/**
* Create a new Zone
* Access at POST http://localhost:8080/api/en/zones
*/
router.post('/', (req, res,next) => {
 // Create object

  const zone = new Zone();
 
 // Set field value (comes from the request)
      zone.name.en = req.body.nameEN;
      zone.name.th = req.body.nameTH;
      zone.places = req.body.places;
      if (req.body.thumbnailUrl)zone.thumbnailUrl = req.body.thumbnailUrl;
      if (req.body.bannerUrl)zone.bannerUrl = req.body.bannerUrl;
      zone.welcomeMessage.en = req.body.welcomeMessageEN;
      zone.shortName.en = req.body.shortNameEN;
      zone.description.en = req.body.descriptionEN;
      zone.welcomeMessage.th = req.body.welcomeMessageTH;
      zone.shortName.th = req.body.shortNameTH;
      zone.description.th = req.body.descriptionTH;
      if (req.body.websiteUrl) zone.websiteUrl = req.body.websiteUrl;
      zone.type = req.body.type;
      if (req.body.webpage) zone.webpage=req.body.webpage;



 // Save zone and check for error
    zone.save((err, _zone) => {
      if (err) {
       // Handle error from save
       return res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      }

      res.status(300).json(_zone);
    });
  });
// Update an existing zone via PUT(JSON format)
// ex. { "name","EditName"}
// Access at PUT http://localhost:3000/api/en/zones/:id
router.put('/:id', (req, res) => {
  Zone.findById(req.params.id, (err, zone) => {
  // check error first

    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
  // check zone
    if (!zone) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(26)
      });
    }

    if (req.body.nameEN)zone.name.en = req.body.nameEN;
    if (req.body.nameTH)zone.name.th = req.body.nameTH;
    if (req.body.places) zone.places = req.body.places;
    if (req.body.thumbnailUrl)zone.thumbnailUrl = req.body.thumbnailUrl;
    if (req.body.bannerUrl)zone.bannerUrl = req.body.bannerUrl;
    if (req.body.welcomeMessage) zone.welcomeMessage = req.body.welcomeMessage;
    if (req.body.shortName) zone.shortName = req.body.shortName;
    if (req.body.description) zone.description = req.body.description;
    if (req.body.welcomeMessageEN)zone.welcomeMessage.en = req.body.welcomeMessageEN;
    if (req.body.shortNameEN)zone.shortName.en = req.body.shortNameEN;
    if (req.body.descriptionEN)zone.description.en = req.body.descriptionEN;
    if (req.body.welcomeMessageTH)zone.welcomeMessage.th = req.body.welcomeMessageTH;
    if (req.body.shortNameTH)zone.shortName.th = req.body.shortNameTH;
    if (req.body.descriptionTH)zone.description.th = req.body.descriptionTH;
    if (req.body.websiteUrl) zone.websiteUrl = req.body.websiteUrl;
    if (req.body.type) zone.type = req.body.type;
    if (req.body.webpage) zone.webpage=req.body.webpage;


    zone.save((err, _zone) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      }
      res.status(202).json({
        success: true,
        message: 'Update zone successfull',
        results: _zone
      });
    });
  });
});

// Delete an existing zone via DEL.
// Access at DEL http://localhost:3000/api/en/zones/:id
router.delete('/:id', (req, res) => {
  Zone.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    res.status(202).json({
      success: true,
      message: 'An Zone with id ${req.params.id} was removed.'
    });
  });
});

module.exports = router;