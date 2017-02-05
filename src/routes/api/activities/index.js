const express = require('express');
const Activity = require('../../../models/Activity');
const _ = require('lodash');
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
 * @param {string} [sort] - Sort fields (ex. "-start,+createAt").
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
        sortFields = 'location.latitude';
      } else if (sortFields === 'locationLong') {
        sortFields = 'location.longitude';
      }

      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else {
        prev[sortFields] = 1;
      }
      return prev;
    }, {});
  }

  // RangeQuery of start and end
  // Activities's start time range query
  if (req.query.start) {
    filter.start = RangeQuery(JSON.parse(req.query.start), 'Date');
  }
  // Activities's end time range query
  if (req.query.end) {
    filter.end = RangeQuery(JSON.parse(req.query.end), 'Date');
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
    fields = req.query.fields.replace(/,/g, ' ');
    fields = fields.replace(/nameEN/g, 'name.en');
    fields = fields.replace(/shortDescriptionEN/g, 'shortDescription.en');
    fields = fields.replace(/descriptionEN/g, 'description.en');
    fields = fields.replace(/locationPlace/g, 'location.place');
    fields = fields.replace(/locationFloor/g, 'location.floor');
    fields = fields.replace(/locationRoom/g, 'location.room');
    fields = fields.replace(/locationLat/g, 'location.latitude');
    fields = fields.replace(/locationLong/g, 'location.longitude');
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
      res.sendError(5, err);
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
    fields = req.query.fields.replace(/,/g, ' ');
    fields = fields.replace(/nameEN/g, 'name.en');
    fields = fields.replace(/shortDescriptionEN/g, 'shortDescription.en');
    fields = fields.replace(/descriptionEN/g, 'description.en');
    fields = fields.replace(/locationPlace/g, 'location.place');
    fields = fields.replace(/locationFloor/g, 'location.floor');
    fields = fields.replace(/locationRoom/g, 'location.room');
    fields = fields.replace(/locationLat/g, 'location.latitude');
    fields = fields.replace(/locationLong/g, 'location.longitude');
  }

  Activity.findById(req.params.id).select(fields).exec((err, act) => {
    if (err) {
      // Handle error from User.findById
      return res.sendError(5, err);
    }
    if (!act) {
      return res.sendError(25);
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
router.post('/', (req, res) => {
  // Create a new instance of the User model
  const activity = new Activity();

  // Set field value (comes from the request)
  activity.name.en = req.body.nameEN;
  activity.name.th = req.body.nameTH;
  activity.thumbnail = req.body.thumbnail;
  activity.banner = req.body.banner;
  activity.shortDescription.en = req.body.shortDescriptionEN;
  activity.shortDescription.th = req.body.shortDescriptionTH;
  activity.description.en = req.body.descriptionEN;
  activity.description.th = req.body.descriptionTH;
  activity.contact = req.body.contact;
  activity.pictures = req.body.pictures.split(',');
  activity.video = req.body.video;
  activity.pdf = req.body.pdf;
  activity.link = req.body.link;
  activity.isHighlight = req.body.isHighlight;
  activity.tags = req.body.tags;
  activity.location.place = req.body.locationPlace;
  activity.location.floor = req.body.locationFloor;
  activity.location.room = req.body.locationRoom;
  activity.location.latitude = req.body.locationLat;
  activity.location.longitude = req.body.locationLong;
  activity.zone = req.body.zone;
  activity.start = req.body.start;
  activity.end = req.body.end;

  // Save User and check for error
  activity.save((err, _act) => {
    if (err) {
      // Handle error from
      return res.sendError(5, err);
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
  const updateFields = _.pick(req.body, ['thumbnail', 'banner', 'contact', 'video', 'pdf', 'link', 'isHighlight', 'tags', 'zone', 'start', 'end']);

  if (updateFields.start) {
    updateFields.start = new Date(updateFields.start);
  }
  if (updateFields.end) {
    updateFields.end = new Date(updateFields.end);
  }
  Activity.findById(req.params.id, (err, act) => {
    if (err) {
      // Handle error from User.findById
      return res.sendError(5, err);
    }
    if (!act) {
      res.sendError(25);
    }
    _.assignIn(act, updateFields);
    act.name.en = req.body.nameEN;
    act.name.th = req.body.nameTH;
    if (req.body.pictures) {
      act.pictures = req.body.pictures.split(',');
    }
    act.shortDescription.en = req.body.shortDescriptionEN;
    act.shortDescription.th = req.body.shortDescriptionTH;
    act.description.en = req.body.descriptionEN;
    act.description.th = req.body.descriptionTH;
    act.location.place = req.body.locationPlace;
    act.location.floor = req.body.locationFloor;
    act.location.room = req.body.locationRoom;
    act.location.latitude = req.body.locationLat;
    act.location.longitude = req.body.locationLong;

    act.save((err, updatedAct) => {
      if (err) {
        // Handle error from save
        return res.sendError(5, err);
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
      return res.sendError(5, err);
    }
    return res.status(202).json({
      success: true,
      message: `An Activity with id ${req.params.id} was removed.`,
    });
  });
});

router.use('/:id/rounds', require('./rounds'));

// pdf redirect
router.pdfRedirect('/:id', (req, res) => {
  Activity.findById(req.params.id, (err, act) => {
    if(err) {
      return res.sendError(5, err);
    }
    window.location = 'https://www.google.co.th';
  });
});

module.exports = router;
