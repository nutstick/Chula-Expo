const express = require('express');
const Activity = require('../../../models/Activity');
const Round = require('../../../models/Round');
const Ticket = require('../../../models/Ticket');
const _ = require('lodash');
const mongoose = require('mongoose');
const { RangeQuery } = require('../../../tools');
const { isAuthenticatedByToken, isStaff, deserializeToken } = require('../../../config/authenticate');
const request = require('request');

const router = express.Router();

/**
 * Get Activity list
 * Access at GET https://localhost:8080/api/activities
 * @param {string} [name] - Get by name.
 * @param {string} [tags] - Get by Tags.
 * @param {ObjectId} [zone] - Get by Zone.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {string} [location] - Get by Location name.
 * @param {string} [sort] - Sort fields (ex. "-start,createAt").
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
     try {
       req.query.start = JSON.parse(req.query.start);
     } catch (err) {
       // return res.sendError(5, err);
     }
     filter.start = RangeQuery(req.query.start, 'Date');
   }
   // Activities's end time range query
   if (req.query.end) {
     try {
       req.query.end = JSON.parse(req.query.end);
     } catch (err) {
       // return res.sendError(5, err);
     }
     filter.end = RangeQuery(req.query.end, 'Date');
   }
   // Activities's updateAt range query
   if (req.query.update) {
     try {
       req.query.update = JSON.parse(req.query.update);
     } catch (err) {
       // return res.sendError(5, err);
     }
     filter.updateAt = RangeQuery(req.query.update, 'Date');
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

   if (req.query.zone) {
     filter.zone = req.query.zone;
   }

   if (req.query.highlight) {
     filter.isHighlight = req.query.highlight;
   }

   if (req.query.createBy) {
     filter.createBy = req.query.createBy;
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
   let limit;
   if (req.query.limit) {
     limit = Number.parseInt(req.query.limit, 10);
     query = query.limit(limit);
   }
   // Offset of a query data
   // http://localhost:3000/?skip=10
   let skip;
   if (req.query.skip) {
     skip = Number.parseInt(req.query.skip, 0);
     query = query.skip(skip);
   }


   Activity.find(filter).count((err, total) => {
     if (err) {
       return res.sendError(5, err);
     }
     query.exec((err, _act) => {
       if (err) {
         return res.sendError(5, err);
       }
       return res.status(200).json({
         success: true,
         results: _act,
         queryInfo: {
           total,
           limit,
           skip,
         }
       });
     });
   });
 });

// recommend from aj.nuttawut
router.get('/recommend', isAuthenticatedByToken, (req, res) => {
  request.get({
    uri: 'http://104.199.143.190/recommend/' + req.user.id,
  },
  (err, r, ans) => {
    if (err) {
      return res.sendError(5, err);
    }

    const answer = JSON.parse(ans);
    return res.json({
      success: true,
      results: answer.activities
    });
  });
});

// nearby from aj.nuttawut
router.get('/nearby', deserializeToken, (req, res) => {
  const qs = {};
  qs.lat = req.query.latitude;
  qs.lng = req.query.longitude;
  qs.cutoff = 100;
  if (req.user) {
    qs.u = req.user;
  }
  request.get({
    uri: 'http://104.199.143.190/search',
    qs
  },
  (err, r, ans) => {
    if (err) {
      return res.sendError(5, err);
    }

    const answer = JSON.parse(ans);
    return res.json({
      success: true,
      results: answer.activities
    });
  });
});


// search from aj.nuttawut
router.get('/search', deserializeToken, (req, res) => {
  const qs = {};
  if (req.query.latitude) {
    qs.lat = req.query.latitude;
  }
  if (req.query.longitude) {
    qs.lng = req.query.longitude;
  }
  qs.q = req.query.text;
  qs.cutoff = 200;
  if (req.user) {
    qs.u = req.user;
  }
  request.get({
    uri: 'http://104.199.143.190/search',
    qs
  },
  (err, r, ans) => {
    if (err) {
      return res.sendError(5, err);
    }

    const answer = JSON.parse(ans);
    return res.json({
      success: true,
      results: answer.activities
    });
  });
});

// TODO - highlight from aj.nuttawut
router.get('/highlight', (req, res) => {
  const filter = {};

  //  http://localhost:3000/?sort=createAt,-startDate
  filter.start = { $gt: new Date(new Date().getTime() + (7 * 60000)).toUTCString() };
  filter.isHighlight = true;
  filter.banner = { $exists: true };
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

  const query = Activity.find(filter).select(fields);

  Activity.find(filter).count((err, total) => {
    if (err) {
      return res.sendError(5, err);
    }

    let skip = Math.floor(Math.random() * total);
    if (skip >= 15) {
      skip -= 15;
    }

    query.skip(skip).limit(15).exec((err, _act) => {
      if (err) {
        return res.sendError(5, err);
      }
      return res.status(200).json({
        success: true,
        results: _act,
        queryInfo: {
          total,
        }
      });
    });
  });
});

/**
 * Create a new activity
 * Access at POST http://localhost:8080/api/activities
 */
// router.post('/', (req, res) => {
router.post('/', isAuthenticatedByToken, isStaff, (req, res) => {
  // Check match zone with User
  /*
  if (req.user.staff.type === 'Staff' && req.user.staff.staffType !== 'Admin'
    && req.user.staff.zone !== req.body.zone) {
    return res.sendError(4, 'No permission on creating activity outside your own zone');
  }*/

  try {
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
    if (req.body.pictures) {
      activity.pictures = req.body.pictures.split(',');
    }
    activity.video = req.body.video;
    activity.pdf = req.body.pdf;
    activity.link = req.body.link;
    activity.isHighlight = req.body.isHighlight;
    if (req.body.tags) {
      activity.tags = req.body.tags.split(',');
    }
    activity.location.place = mongoose.Types.ObjectId(req.body.locationPlace);
    if (req.body.locationRoom) {
      activity.location.room = mongoose.Types.ObjectId(req.body.locationRoom);
    }
    activity.location.latitude = req.body.locationLat;
    activity.location.longitude = req.body.locationLong;
    activity.zone = mongoose.Types.ObjectId(req.body.zone);

    activity.start = req.body.start;
    activity.end = req.body.end;

    activity.createBy = req.user.id;
    activity.createAt = new Date();
    activity.updateAt = new Date();


    // Save User and check for error
    activity.save((err, _act) => {
      // Handle error from
      if (err) {
        return res.sendError(5, err);
      }

      return res.status(200).json({
        success: true,
        results: _act
      });
    });
  } catch (err) {
    console.log(err);  // eslint-disable-line no-console
  }
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

// pdf redirect
router.get('/:id/qrcode', (req, res) => {
  Activity.findById(req.params.id, (err, act) => {
    if (err) {
      return res.sendError(5, err);
    } else if (!act) {
      return res.sendError(5, err);
    } else if (!act.pdf) {
      return res.sendError(5, err);
    }

    res.writeHead(301, {
      Location: encodeURI(act.pdf)
    });
    res.end();
  });
});

// video redirect
router.get('/:id/qrvideo', (req, res) => {
  Activity.findById(req.params.id, (err, act) => {
    if (err) {
      return res.sendError(5, err);
    } else if (!act) {
      return res.sendError(5, err);
    } else if (!act.video) {
      return res.sendError(5, err);
    }
    res.writeHead(301, {
      Location: encodeURI(act.video)
    });
    res.end();
  });
});

// Update an existing activity via PUT(JSON format)
// ex. { "name","EditName"}
// Access at PUT http://localhost:3000/api/activities/:id
// router.put('/:id', (req, res) => {
router.put('/:id', isAuthenticatedByToken, isStaff, (req, res) => {
  const updateFields = _.pick(req.body, ['thumbnail', 'banner', 'contact', 'video', 'pdf', 'link', 'isHighlight', 'zone', 'start', 'end']);

  if (updateFields.start) {
    updateFields.start = new Date(updateFields.start);
  }
  if (updateFields.end) {
    updateFields.end = new Date(updateFields.end);
  }
  Activity.findById(req.params.id, (err, activity) => {
    // Handle error from User.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Check for exist activity
    if (!activity) {
      res.sendError(25);
    }

    // Check activity match with User
    if (req.user.type !== 'Staff' || (req.user.type === 'Staff' && req.user.staff.staffType !== 'Admin'
      && req.user.id !== String(activity.createBy))) {
      return res.sendError(4, 'No permission on editing activity outside your own activity');
    }

    _.assignIn(activity, updateFields);
    activity.name.en = req.body.nameEN;
    activity.name.th = req.body.nameTH;
    if (req.body.pictures) {
      activity.pictures = req.body.pictures.split(',');
    }

    activity.shortDescription.en = req.body.shortDescriptionEN;
    activity.shortDescription.th = req.body.shortDescriptionTH;
    activity.description.en = req.body.descriptionEN;
    activity.description.th = req.body.descriptionTH;
    activity.location.place = mongoose.Types.ObjectId(req.body.locationPlace);
    if (req.body.locationRoom) {
      activity.location.room = mongoose.Types.ObjectId(req.body.locationRoom);
    }
    activity.location.latitude = req.body.locationLat;
    activity.location.longitude = req.body.locationLong;
    activity.zone = mongoose.Types.ObjectId(req.body.zone);
    if (req.body.tags) {
      activity.tags = req.body.tags.split(',');
    }

    activity.updateAt = new Date();


    activity.save((err, updatedAct) => {
      // Handle error from save
      if (err) {
        return res.sendError(5, err);
      }
      return res.status(200).json({
        success: true,
        results: updatedAct
      });
    });
  });
});
// Delete an existing activity via DEL.
// Access at DEL http://localhost:3000/api/activities/:id
// router.delete('/:id', (req, res) => {
router.delete('/:id', isAuthenticatedByToken, isStaff, (req, res) => {
  Activity.findById(req.params.id, (err, activity) => {
    // Handle error from User.findById
    if (err) {
      return res.sendError(5, err);
    }
    // Check for exist activity
    if (!activity) {
      return res.sendError(25);
    }

    // Check activity match with User
    if (req.user.type !== 'Staff' || (req.user.type === 'Staff' && req.user.staff.staffType !== 'Admin'
      && req.user.id !== String(activity.createBy))) {
      return res.sendError(4, 'No permission on deleting activity outside your own activity');
    }
    // Find corresponding rounds and remove corresponding tickets
    const promise = Round.find({ activityId: req.params.id }).exec((err, _rounds) => {
      if (err) {
        return res.sendError(5, err);
      }
      if (_rounds) {
        _rounds.forEach((_round) => {
          // Remove corresponding tickets
          Ticket.remove({ round: _round._id }, (err) => {
            if (err) {
              return res.sendError(5, err);
            }
          });
        });
      }
    });
    // Remove corresponding rounds
    promise.then(() => {
      Round.remove({ activityId: req.params.id }, (err) => {
        if (err) {
          return res.sendError(5, err);
        }
      });
    });
    activity.remove((err) => {
      // Handle error remove
      if (err) {
        return res.sendError(5, err);
      }
      return res.status(202).json({
        success: true,
        message: `An Activity with id ${req.params.id} was removed.`,
      });
    });
  });
});

router.use('/:id/rounds', require('./rounds'));
router.use('/:id/checkin', require('./checkin'));


module.exports = router;
