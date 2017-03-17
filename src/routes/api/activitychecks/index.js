/*

const express = require('express');
const ActivityCheck = require('../../../models/ActivityCheck');
const { RangeQuery } = require('../../../tools');
const { isAuthenticatedByToken, isStaff, deserializeToken } = require('../../../config/authenticate');

const router = express.Router();

router.get('/summary', (req, res) => {
  ActivityCheck.find({}).populate('activityId', 'name zone _id').exec((err, checks) => {
    console.log(checks);
    const zone = [];
    for (var i = 0; i < checks.length; i++) {
      zone[checks[i].activity.zone]++;
    }

    return res.status(200).json({
      success: true,
      results: zone
    });

  });
});


module.exports = router;

*/
