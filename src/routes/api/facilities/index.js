const express = require('express');
const Facility = require('../../../models/Facility');
const retrieveError = require('../../../tools/retrieveError');

const router = express.Router();

router.get('/', (req, res) => {
  const filter = {};
  if (req.query.nameEN) {
    filter['name.en'] = { $regex: req.query.nameEN };
  }
  //  http://localhost:3000/?sort=createAt,-startDate
  let sort = {};
  if (req.query.sort) {
    sort = req.query.sort.split(',').reduce((prev, sortQuery) => {
      let sortFields = sortQuery[0] === '-' ? sortQuery.substr(1) : sortQuery;
      sortFields = sortFields.replace('nameTH', 'name.th');
      sortFields = sortFields.replace('nameEN', 'name.en');
      sortFields = sortFields.replace('descTH', 'desc.th');
      sortFields = sortFields.replace('descEN', 'desc.en');
      sortFields = sortFields.replace('locationLat', 'location.latitute');
      sortFields = sortFields.replace('locationLong', 'location.longtitute');
      if (sortQuery[0] === '-') {
        prev[sortFields] = -1;
      } else {
        prev[sortFields] = 1;
      }
      return prev;
    }, {});
  }
  // field selector
  // http://localhost:3000/?fields=name,faculty
  let fields;
  if (req.query.fields) {
    fields = req.query.fields.replace(',', ' ');
    fields = fields.replace('nameTH', 'name.th');
    fields = fields.replace('nameEN', 'name.en');
    fields = fields.replace('descTH', 'desc.th');
    fields = fields.replace('descEN', 'desc.en');
    fields = fields.replace('locationLat', 'location.latitute');
    fields = fields.replace('locationLong', 'location.longtitute');
  }
  let query = Facility.find(filter);

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

  query.exec((err, _fac) => {
    res.json({
      successful: true,
      data: _fac
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
    fields = fields.replace('nameTH', 'name.th');
    fields = fields.replace('nameEN', 'name.en');
    fields = fields.replace('descTH', 'desc.th');
    fields = fields.replace('descEN', 'desc.en');
    fields = fields.replace('locationLat', 'location.latitute');
    fields = fields.replace('locationLong', 'location.longtitute');
  }
  Facility.findById(req.params.id).select(fields).exec((err, fac) => {
    if (err) {
      // Handle error from User.findById
      return res.status(404).json({
        successful: false,
        error: 'Facility with the given ID is not found.'
      });
    }
    res.json({
      successful: true,
      data: fac
    });
  });
});
  /**
  * Create a new activity
  * Access at POST http://localhost:8080/api/activities
  */
router.post('/', (req, res, next) => {
     // Create a new instance of the User model
  const facility = new Facility();
     // Set field value (comes from the request)
  facility.name.th = req.body.nameTH;
  facility.name.en = req.body.nameEN;
  facility.desc.th = req.body.descTH;
  facility.desc.en = req.body.descEN;
  facility.type = req.body.type;
  facility.place = req.body.place;
  facility.location.latitute = req.body.locationLat;
  facility.location.longtitute = req.body.locationLong;
   // Save User and check for error
  facility.save((err, _act) => {
    if (err) {
     // Handle error from save
      next(err);
    }
    res.status(300).json({
      successful: true,
      data: _act
    });
  });
});
 // Update an existing activity via PUT(JSON format)
 // ex. { "name","EditName"}
 // Access at PUT http://localhost:3000/api/activities/:id
router.put('/:id', (req, res) => {
  Facility.findById(req.params.id, (err, fac) => {
    if (err) {
      // Handle error from User.findById
      return res.status(404).json({
        successful: false,
        error: 'Facility with the given ID is not corrected.'
      });
    }
    if (!fac) {
      return res.status(404).json({
        successful: false,
        error: 'Facility with the given ID is not found.'
      });
    }
    if (req.body.nameTH) {
      fac.name.th = req.body.nameTH;
    }
    if (req.body.nameEN) {
      fac.name.en = req.body.nameEN;
    }
    if (req.body.descTH) {
      fac.desc.th = req.body.descTH;
    }
    if (req.body.descEN) {
      fac.desc.en = req.body.descEN;
    }
    if (req.body.place) {
      fac.place = req.body.place;
    }
    if (req.body.locationLat) {
      fac.location.latitute = req.body.locationLat;
    }
    if (req.body.locationLong) {
      fac.location.longtitute = req.body.locationLong;
    }
    fac.save((err, updatedFac) => {
      if (err) {
      // Handle error from save
        res.status(400).send();
      }
      res.json(updatedFac);
    });
  });
});

 // Delete an existing activity via DEL.
 // Access at DEL http://localhost:3000/api/activities/:id
router.delete('/:id', (req, res) => {
  Facility.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    res.status(202).json({
      success: true,
      message: `An Facility with id ${req.params.id} was removed.`,
    });
  });
});
module.exports = router;
