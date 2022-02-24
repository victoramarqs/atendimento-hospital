const Ticket = require('../models/ticketModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const randomTicket = (min, max) =>
  Math.round(Math.random() * (max - min)) + min;

exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findOne({
    _id: { $ne: req.body.skipTicket },
    guicheID: undefined,
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

  if (ticket.skipTimes === 5) {
    await Ticket.findByIdAndDelete(req.params.id);
  }
});

// exports.skipTicket = catchAsync(async (req, res, next) => {
//   const ticket = await Ticket.findByIdAndUpdate(
//     req.params.id,
//     { $unset: { guicheID: '' } },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res.status(200).json({
//     status: 'success',
//     data: {
//       ticket,
//     },
//   });
// });
