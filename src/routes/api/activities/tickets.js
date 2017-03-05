const express = require('express');
const { Ticket } = require('../../../models');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');

const router = express.Router();

router.use(isAuthenticatedByToken, isStaff);

router.get('/', (req, res) => {
  Ticket.find({ round: req.params.rid }, (err, tickets) => {
    if (err) {
      return res.sendError(5, err);
    }
    res.json({
      success: true,
      results: tickets
    });
  });
});

router.get('/:tid', (req, res) => {
  Ticket.findById(req.param.tid, (err, ticket) => {
    if (err) {
      return res.sendError(5, err);
    }
    if (!ticket) {
      return res.sendError(27);
    }
    res.json({
      success: true,
      results: {
        ticket: req.param.tid,
        user: ticket.user,
        round: ticket.round,
        checked: ticket.checked,
      }
    });
  });
});

router.delete('/:tid', (req, res) => {
  Ticket.cancelReserved(req.param.tid)
    .then(() => {
      res.json({
        success: true,
        message: `Successfully removed ticket ${req.params.tid}.`,
      });
    })
    .catch((err) => {
      if (err.code) {
        return res.sendError(err.code);
      }
      return res.sendError(5, err);
    });
});

module.exports = router;
