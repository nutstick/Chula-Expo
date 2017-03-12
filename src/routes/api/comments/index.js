const express = require('express');
const Comment = require('../../../models/Comment');
const retrieveError = require('../../../tools/retrieveError');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');

const router = express.Router();

router.get('/', (req, res) => {
  Comment.find().count((err, total) => {
    if (err) {
      return res.sendError(5, err);
    }
    Comment.find()
      .exec((err, comments) => {
        if (err) {
          return res.sendError(5, err);
        }

        return res.status(200).json({
          success: true,
          results: comments,
          queryInfo: {
            total,
          }
        });
      });
  });
});

router.post('/', isAuthenticatedByToken, (req, res) => {
   // Create object

  const comment = new Comment();

   // Set field value (comes from the request)
  comment.message = req.body.message;

  if (req.body.activity) {
    comment.activity = mongoose.Types.ObjectId(req.body.activity);
  }

  comment.createBy = req.user.id;
  comment.createAt = new Date();
  comment.updateAt = new Date();


  // Save Comment and check for error
  comment.save((err, _Comment) => {
    if (err) {
      // Handle error from save
      return res.status(500).json({
        success: false,
        errors: retrieveError(5, err),
      });
    }
    return res.status(201).json({
      success: true,
      results: _Comment
    });
  });
});


module.exports = router;
