const express = require('express');
const Activity = require('../../../models/Activity');
const _ = require('lodash');
const retrieveError = require('../../../tools/retrieveError');
const RangeQuery = require('../../../tools/RangeQuery');

const router = express.Router();

/**
 * Get Activity list
 * Access at GET https://localhost:8080/api/activities
 * @param {string} [name] - Get by name.
 * @param {string} [tags] - Get by Tags.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {string} [location] - Get by Location name.
 * @param {string} [sort] - Sort fields (ex. "-startTime,+createAt").
 * @param {string} [fields] - Fields selected (ex. "name,location").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Activities[]} results - Result activities from the query.
 * @return {Object} queryInfo - Metadata query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that match the query.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 */
router.get('/', (req, res) => {
  // filtering tag with a tags query.
  // http://localhost:3000/?tags=prize,rewards
  const filter = {};
  if (req.query.tags) {
    filter.tags = { $in: req.query.tags.split(',') };
  }

  //  http://localhost:3000/?sort=createAt,-startDate
  let sort = {};
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery[0] === '-' ? sortQuery.substr(1) : sortQuery;

      if (sortFields === 'nameEN') {
        sortFields = 'name.en';
      } else if (sortFields === 'shortDescriptionEN') {
        sortFields = 'shortDescription.en';
      } else if (sortFields === 'descriptionEN') {
        sortFields = 'description.en';
      } else if (sortFields === 'locationLat') {
        sortFields = 'location.latitute';
      } else if (sortFields === 'locationLong') {
        sortFields = 'location.longtitute';
      }

      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else {
        prev[sortFields] = 1;
      }
      return prev;
    }, {});
  }

  // RangeQuery of startTime and endTime
  // Activities's start time range query
  if (req.query.startTime) {
    filter.startTime = RangeQuery(JSON.parse(req.query.startTime), 'Date');
  }
  // Activities's end time range query
  if (req.query.endTime) {
    filter.endTime = RangeQuery(JSON.parse(req.query.endTime), 'Date');
  }

  // Name Query
  // http://localhost:3000/?name=John
  if (req.query.nameEN) {
    filter['name.en'] = { $regex: req.query.nameEN };
  }

  // Location description query
  // http://localhost:3000/?location=Larngear
  if (req.query.location) {
    filter.location = { desc: req.query.location };
  }

  // field selector
  // http://localhost:3000/?fields=name,faculty
  let fields;
  if (req.query.fields) {
    fields = req.query.fields.replace(',', ' ');
    fields = fields.replace('nameEN', 'name.en');
    fields = fields.replace('shortDescriptionEN', 'shortDescription.en');
    fields = fields.replace('descriptionEN', 'description.en');
    fields = fields.replace('locationPlace', 'location.place');
    fields = fields.replace('locationFloor', 'location.floor');
    fields = fields.replace('locationRoom', 'location.room');
    fields = fields.replace('locationLat', 'location.latitute');
    fields = fields.replace('locationLong', 'location.longtitute');
  }

  // Text search engine
  // http://localhost:3000/?search=searchString
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  let query = Activity.find(filter);

  if (sort) {
    query.sort(sort);
  }
  if (fields) {
    query.select(fields);
  }
  // limiter on each query
  // http://localhost:3000/?limit=10
  if (req.query.limit) {
    query = query.limit(Number.parseInt(req.query.limit, 10));
  }
  // Offset of a query data
  // http://localhost:3000/?skip=10
  if (req.query.skip) {
    query = query.skip(Number.parseInt(req.query.skip, 10));
  }

  query.exec((err, _act) => {
    if (err) {
      res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    res.status(200).json({
      success: true,
      results: _act
    });
  });
});

/**
 * Get Activities by Id
 * Access at GET http://localhost:8080/api/activities/:id
 * @param {string} [fields] - Fields selected (ex. "name,location").
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round} results - The Matched Activity by id.
 */
router.get('/:id', (req, res) => {
  // Get User from instance User model by ID
  let fields = '';
  if (req.query.fields) {
    fields = req.query.fields.replace(',', ' ');
    fields = fields.replace('nameEN', 'name.en');
    fields = fields.replace('shortDescriptionEN', 'shortDescription.en');
    fields = fields.replace('descriptionEN', 'description.en');
    fields = fields.replace('locationPlace', 'location.place');
    fields = fields.replace('locationFloor', 'location.floor');
    fields = fields.replace('locationRoom', 'location.room');
    fields = fields.replace('locationLat', 'location.latitute');
    fields = fields.replace('locationLong', 'location.longtitute');
  }

  Activity.findById(req.params.id).select(fields).exec((err, act) => {
    if (err) {
      // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    if (!act) {
      return res.status(403).json({
        success: false,
        results: retrieveError(25)
      });
    }
    return res.status(200).json({
      success: true,
      results: act
    });
  });
});

/**
 * Create a new activity
 * Access at POST http://localhost:8080/api/activities
 */
router.post('/', (req, res, next) => {
  // Create a new instance of the User model
  const activity = new Activity();

  // Set field value (comes from the request)
  activity.name.en = req.body.nameEN;
  activity.name.th = req.body.nameTH;
  activity.thumbnailUrl = req.body.thumbnailUrl;
  activity.bannerUrl = req.body.bannerUrl;
  activity.shortDescription.en = req.body.shortDescriptionEN;
  activity.shortDescription.th = req.body.shortDescriptionTH;
  activity.description.en = req.body.descriptionEN;
  activity.description.th = req.body.descriptionTH;
  activity.contact = req.body.contact;
  activity.imageUrl = req.body.imageUrl;
  activity.videoUrl = req.body.videoUrl;
  activity.pdfUrl = req.body.pdfUrl;
  activity.link = req.body.link;
  activity.isHighlight = req.body.isHighlight;
  activity.tags = req.body.tags;
  activity.location.place = req.body.locationPlace;
  activity.location.floor = req.body.locationFloor;
  activity.location.room = req.body.locationRoom;
  activity.location.latitute = req.body.locationLat;
  activity.location.longtitute = req.body.locationLong;
  activity.zone = req.body.zone;
  activity.startTime = req.body.startTime;
  activity.endTime = req.body.endTime;

  // Save User and check for error
  activity.save((err, _act) => {
    if (err) {
      // Handle error from
      next(err);
    }

    res.status(200).json({
      success: true,
      results: _act
    });
  });
});
// Update an existing activity via PUT(JSON format)
// ex. { "name","EditName"}
// Access at PUT http://localhost:3000/api/activities/:id
router.put('/:id', (req, res) => {
  const updateFields = _.pick(req.body, ['thumbnailUrl', 'bannerUrl', 'contact', 'imageUrl', 'videoUrl', 'pdfUrl', 'link', 'isHighlight', 'tags', 'zone', 'startTime', 'endTime']);

  if (updateFields.startTime) {
    updateFields.startTime = new Date(updateFields.startTime);
  }
  if (updateFields.endTime) {
    updateFields.endTime = new Date(updateFields.endTime);
  }
  Activity.findById(req.params.id, (err, act) => {
    if (err) {
      // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    if (!act) {
      res.status(403).json({
        success: false,
        results: retrieveError(25)
      });
    }
    _.assignIn(act, updateFields);
    act.name.en = req.body.nameEN;
    act.name.th = req.body.nameTH;
    act.shortDescription.en = req.body.shortDescriptionEN;
    act.shortDescription.th = req.body.shortDescriptionTH;
    act.description.en = req.body.descriptionEN;
    act.description.th = req.body.descriptionTH;
    act.location.place = req.body.locationPlace;
    act.location.floor = req.body.locationFloor;
    act.location.room = req.body.locationRoom;
    act.location.latitute = req.body.locationLat;
    act.location.longtitute = req.body.locationLong;

    act.save((err, updatedAct) => {
      if (err) {
        // Handle error from save
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      }
      res.status(200).json({
        success: true,
        results: updatedAct
      });
    });
  });
});

// Delete an existing activity via DEL.
// Access at DEL http://localhost:3000/api/activities/:id
router.delete('/:id', (req, res) => {
  Activity.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    return res.status(202).json({
      success: true,
      message: `An Activity with id ${req.params.id} was removed.`,
    });
  });
});

module.exports = router;
