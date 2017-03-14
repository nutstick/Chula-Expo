const express = require('express');
const { Ticket } = require('../../../models');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');

const router = express.Router();

router.use(isAuthenticatedByToken, isStaff);

router.get('/:tid', (req, res) => {
  Ticket.findById(req.params.tid, (err, ticket) => {
    if (err) {
      return res.sendError(5, err);
    }
    if (!ticket) {
      return res.sendError(27);
    }
    res.json({
      success: true,
      results: {
        ticket: req.params.tid,
        user: ticket.user,
        round: ticket.round,
        checked: ticket.checked,
      }
    });
  });
});

router.delete('/:tid', (req, res) => {
  Ticket.cancelReserved(req.params.tid)
    .then(() => {
      res.json({
        success: true,
        message: `Successfully removed ticket ${req.params.tid}.`,
      });
    })
      .catch(err => (err.code ? res.sendError(err.code) : res.sendError(5, err)));
});

router.post('/:tid/check', (req, res) => {
  Ticket.findById(req.params.tid, (err, ticket) => {
    if (err) {
      return res.sendError(5, err);
    }
    if (!ticket) {
      return res.sendError(27);
    }
    if (ticket.checked) {
      return res.sendError(35);
    }
    ticket.checked = true;
    ticket.save(err => (err ? res.sendError(5, err) : res.status(201).json({
      success: true,
      message: `Successfully check in ticket ${ticket._id} to ${req.params.rid}.`,
    })));
  });
});

module.exports = router;
