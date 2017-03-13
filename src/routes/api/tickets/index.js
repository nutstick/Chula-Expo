const express = require('express');
const { Ticket } = require('../../../models');
const { isAuthenticatedByToken, isStaff } = require('../../../config/authenticate');

const router = express.Router();

router.use(isAuthenticatedByToken, isStaff);

router.get('/:tid', (req, res) => {
  Ticket.findById(req.params.tid)
  .populate('user')
  .exec((err, ticket) => {
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
  Ticket.findById(req.params.tid)
  .populate('user')
  .exec((err, ticket) => {
    ticket.checkIn(ticket._id)
      .then(() => (
        res.status(201).json({
          success: true,
          message: `Successfully check ticket id ${req.params.tid}.`,
          results: {
            ticket: req.params.tid,
            user: ticket.user
          }
        })
      ))
      .catch(err => (err.code ? res.sendError(err.code) : res.sendError(5, err)));
  });
});

module.exports = router;
