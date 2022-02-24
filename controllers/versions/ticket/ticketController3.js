const Ticket = require('../models/ticketModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

let preferencialTimes = 0;
let normalTickets = 0;

const randomTicket = (min, max) =>
  Math.round(Math.random() * (max - min)) + min;

exports.getTicket = catchAsync(async (req, res, next) => {
  let skipPriority;
  if (preferencialTimes === 5) {
    if (!normalTickets)
      normalTickets = await Ticket.countDocuments({ priority: 'Normal' });
    if (normalTickets) skipPriority = 'Preferencial';
  }

  const ticket = await Ticket.findOne({
    _id: { $ne: req.body.skipTicket },
    guicheID: undefined,
    priority: { $ne: skipPriority },
  }).sort({ priority: -1 });

  if (!ticket) {
    return next(new AppError('All tickets were treated!', 404));
  }

  req.ticket = ticket;
  next();
});

exports.createTicket = catchAsync(async (req, res, next) => {
  const ticketNumber = randomTicket(1, 999);

  const newTicket = await Ticket.create({
    priority: req.body.priority,
    number: ticketNumber,
  });

  res.status(201).json({
    status: 'success',
    data: {
      ticket: newTicket,
    },
  });

  if (newTicket.priority === 'Normal') {
    normalTickets += 1;
  }
});

exports.updateTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.ticket._id,
    { guicheID: req.body.guicheID },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });

  if (ticket.priority === 'Preferencial') {
    preferencialTimes += 1;
  } else if (ticket.priority === 'Normal') {
    normalTickets -= 1;
    preferencialTimes = 0;
  }
});

exports.skipTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { $unset: { guicheID: '' }, $inc: { skipTimes: 1 } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });

  if (ticket.priority === 'Preferencial') {
    preferencialTimes -= 1;
  } else if (ticket.priority === 'Normal') {
    normalTickets += 1;
  }

  if (ticket.skipTimes === 5) {
    await Ticket.findByIdAndDelete(req.params.id);
    if (ticket.priority === 'Normal') {
      normalTickets -= 1;
    }
  }
});
