const express = require('express');
const Place = require('../../../models/Place');
const Room = require('../../../models/Room');
const Zone = require('../../../models/Zone');
const retrieveError = require('../../../tools/retrieveError');
  var ObjectId = require('mongoose').Types.ObjectId;
  const mongoose = require('mongoose');
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
    fields = req.query.fields.replace(/,/g, ' ');
    fields = fields.replace(/nameTH/g, 'name.th');
    fields = fields.replace(/nameEN/g, 'name.en');
    fields = fields.replace(/locationLat/g, 'location.latitude');
    fields = fields.replace(/locationLong/g, 'location.longitude');
  }
//----------------------------------------------------------------
// initial filter : name query
  const filter = {};

  if (req.query.nameEN) {
    filter['name.en'] = { $regex: req.query.nameEN };
  }

  if(req.query.zoneid)filter.zone = req.query.zoneid;
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
  //----
  let populate='';
  if(req.query.populate)populate= req.query.populate;
//----------------------------------------------------------------
  Place.find(filter).populate(populate,'name')
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

      res.status(200).json({
        success: true,
        results: places
      });
    });
});

/**
 * Get Places by Id
 */
router.get('/:id', (req, res) => {
 //----------------------------------------------------------------
 // initial the fieldwant from request
  let fields = '';
  if (req.query.fields) {
    fields = req.query.fields.replace(/,/g, ' ');
    fields = fields.replace(/nameTH/g, 'name.th');
    fields = fields.replace(/nameEN/g, 'name.en');
    fields = fields.replace(/locationLat/g, 'location.latitude');
    fields = fields.replace(/locationLong/g, 'location.longitude');
  }

  Place.findById(req.params.id).select(fields).exec((err, place) => {
    if (err) {
       // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }

    if (!place) {
      return res.status(403).json({
        success: false,
        results: retrieveError(33)
      });
    }
/*    Zone.findById(place.zone).exec((err, zone) => {
      if (err) {
         // Handle error from User.findById
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      }

       place.zone = zone;
  */
      return res.status(200).json({
        success: true,
        results: place
      });
    //});

  });
});

 //----------------------------------------------------------------

/**
* Create a new Place
* Access at POST http://localhost:8080/api/en/places
*/

router.post('/', (req, res) => {
   // Create object

  const place = new Place();

   // Set field value (comes from the request)
  place.name.en = req.body.nameEN;
  place.name.th = req.body.nameTH;

  if (req.body.code) {
    place.code = req.body.code;
  }
  place.location.latitude = req.body.locationLat;
  place.location.longitude = req.body.locationLong;

  if(req.body.zone){
 place.zone = mongoose.Types.ObjectId(req.body.zone);
}
  // Save place and check for error
  place.save((err, _place) => {
    if (err) {
      // Handle error from save
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    res.status(201).json({
      success: true,
      results: _place
    });

    if(req.body.zone){
        Zone.findOneAndUpdate(
     {
       _id:req.body.zone
     },{
       $addToSet:{places:mongoose.Types.ObjectId(_place._id)}
     },function(err,places){
                         if(err){
                             return res.status(400).send({
                                 message:"Error add  place to zone"
                             });
                         } else{

                             }
      });
    }


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
        errors: retrieveError(33)
      });
    }


    if (req.body.nameEN) {
      place.name.en = req.body.nameEN;
    }
    if (req.body.nameTH) {
      place.name.th = req.body.nameTH;
    }
    if (req.body.code) {
      place.code = req.body.code;
    }
    if (req.body.locationLat) {
      place.location.latitude = req.body.locationLat;
    }
    if (req.body.locationLong) {
      place.location.longitude = req.body.locationLong;
    }
    if (req.body.zone) {
       place.zone = mongoose.Types.ObjectId(req.body.zone);
    }


      place.save((err, _place) => {
        if (err) {
          return res.status(500).json({
            success: false,
            errors: retrieveError(5, err)
          });
        }
        res.status(202).json({
          success: true,
          message: 'Update place successful',
          results: _place
        });
      });

  });
});

// Delete an existing place via DEL.
// Access at DEL http://localhost:3000/api/en/places/:id
router.delete('/:id', (req, res) => {

  Place.findByIdAndRemove(req.params.id).exec((err, place) => {
    if (err) {
       // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }

    if (!place) {
      return res.status(403).json({
        success: false,
        results: retrieveError(33)
      });
    }

    res.status(202).json({
      success: true,
      message: `An Place with id ${req.params.id} was removed.`
    });

    Zone.update(
        { _id :  new ObjectId(place.zone) },
        { '$pull': { places: new ObjectId(req.params.id) } },function(err, obj) {
          //do something smart
          if (err) {
             // Handle error from User.findById
            return res.status(500).json({
              success: false,
              errors: retrieveError(5, err)
            });
          }
}
     );

     Room.remove({ _id: { $in: place.rooms }}, function(err, numberRemoved) {
     // The identified comments are now removed.
    });


  });
});

module.exports = router;
