const express = require('express');

const ticketController = require('../controllers/ticketController');

const router = express.Router();

router
  .route('/')
  .get(ticketController.callTicket)
  .post(ticketController.createTicket);
//   .patch(ticketController.getTicket, ticketController.updateTicket)

router
  .route('/:skipID')
  .get(ticketController.callTicket)
  .patch(ticketController.skipTicket);
// router.route('/:id').patch(ticketController.skipTicket);

module.exports = router;
