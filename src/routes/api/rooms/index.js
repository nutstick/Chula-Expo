const express = require('express');
const Room = require('../../../models/Room');
const Place = require('../../../models/Place');
const retrieveError = require('../../../tools/retrieveError');
const { RangeQuery } = require('../../../tools');
var ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const router = express.Router();

/**
 * Get Room list
 * Access at GET https://localhost:8080/api/en/rooms
 * @param {string} [name] - Get by name.
 * @param {string} [sort] - Sort fields (ex. "+name").
 * @param {string} [fields] - Fields selected (ex. "name").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {rooms[]} results - Result rooms from the query.
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
  }
//----------------------------------------------------------------
// initial filter : name query
  const filter = {};

  if (req.query.nameEN) {
    filter['name.en'] = { $regex: req.query.nameEN };
  }

  if (req.query.placeid) {
    filter.place = req.query.placeid;
  }

  // Rooms's updateAt range query
  if (req.query.update) {
    try {
      req.query.update = JSON.parse(req.query.update);
    } catch (err) {
      // return res.sendError(5, err);
    }
    filter.updateAt = RangeQuery(req.query.update, 'Date');
  }

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

//-----------------------------
  Room.find(filter)
    .select(fields).sort(sort).skip(skip)
    .limit(limit)
    .exec(
    (err, rooms) => {
      if (err) {
        return res.status(500).send({
          success: false,
          errors: retrieveError(5, err)
        });
      }

      return res.status(200).json({
        success: true,
        results: rooms
      });
    });
});

/**
 * Get Rooms by Id
 */
router.get('/:id', (req, res) => {
 //----------------------------------------------------------------
 // initial the fieldwant from request
  let fields = '';
  if (req.query.fields) {
    fields = req.query.fields.replace(/,/g, ' ');
    fields = fields.replace(/nameTH/g, 'name.th');
    fields = fields.replace(/nameEN/g, 'name.en');
  }

  Room.findById(req.params.id).select(fields).exec((err, room) => {
    if (err) {
       // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }

    if (!room) {
      return res.status(403).json({
        success: false,
        results: retrieveError(33)
      });
    }
/*
   Place.findById(place.zone).exec((err, place) => {
      if (err) {
         // Handle error from User.findById
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      }

       room.place = place;
*/
      return res.status(200).json({
        success: true,
        results: room
      });
//    });
  });
});

 //----------------------------------------------------------------

/**
* Create a new Room
* Access at POST http://localhost:8080/api/en/rooms
*/

router.post('/', (req, res) => {
   // Create object

  const room = new Room();

   // Set field value (comes from the request)
  room.name.en = req.body.nameEN;
  room.name.th = req.body.nameTH;

  room.floor = req.body.floor;


 room.place = mongoose.Types.ObjectId(req.body.place);
  // Save room and check for error
  room.save((err, _room) => {
    if (err) {
      // Handle error from save
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    return res.status(201).json({
      success: true,
      results: _room
    });
    /*
        Place.findOneAndUpdate(
     {
       _id:req.body.place
     },{
       $addToSet:{rooms: mongoose.Types.ObjectId(_room._id)}
     },function(err,rooms){
                         if(err){
                             return res.status(400).send({
                                 message:"Error add  room to place"
                             });
                         } else{
                        }
      });

    });
*/
});

// Update an existing room via PUT(JSON format)
// ex. { "name","EditName"}
// Access at PUT http://localhost:3000/api/en/rooms/:id
router.put('/:id', (req, res) => {
  Room.findById(req.params.id, (err, room) => {
    // check error first
    if (err) {
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }
    // check room
    if (!room) {
      return res.status(403).json({
        success: false,
        errors: retrieveError(33)
      });
    }


    if (req.body.nameEN) {
      room.name.en = req.body.nameEN;
    }
    if (req.body.nameTH) {
      room.name.th = req.body.nameTH;
    }

    if (req.body.floor) {
      room.location.floor = req.body.floor;
    }
    if (req.body.place) {
      room.place = mongoose.Types.ObjectId(req.body.place);
    }
    room.updateAt = new Date();

    room.save((err, _room) => {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: retrieveError(5, err)
        });
      }
      return res.status(202).json({
        success: true,
        message: 'Update room successful',
        results: _room
      });
    });
  });
});

// Delete an existing room via DEL.
// Access at DEL http://localhost:3000/api/en/rooms/:id
router.delete('/:id', (req, res) => {
  Room.findByIdAndRemove(req.params.id).exec((err, room) => {
    if (err) {
       // Handle error from User.findById
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err)
      });
    }

    if (!room) {
      return res.status(403).json({
        success: false,
        results: retrieveError(33)
      });
    }

    return res.status(202).json({
      success: true,
      message: `An Room with id ${req.params.id} was removed.`
    });

    Place.update(
        { _id: new ObjectId(room.place) },
        { '$pull': { rooms: new ObjectId(req.params.id) } }, (err, obj) => {
          // do something smart
          if (err) {
             // Handle error from User.findById
            return res.status(500).json({
              success: false,
              errors: retrieveError(5, err)
            });
          }
        }
     );
  });
});

module.exports = router;
