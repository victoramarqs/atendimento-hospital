const Ticket = require('../models/ticketModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

let preferencialTimes = 0;

const randomTicket = (min, max) =>
  Math.round(Math.random() * (max - min)) + min;

exports.callTicket = catchAsync(async (req, res, next) => {
  let skipPriority;
  if (preferencialTimes === 5) {
    const normalTicket = await Ticket.countDocuments(
      { priority: 'Normal' },
      { limit: 1 }
    );
    if (normalTicket) skipPriority = 'Preferencial';
  }

  const ticket = await Ticket.findOneAndUpdate(
    {
      _id: { $ne: req.params.skipID },
      roomID: undefined,
      priority: { $ne: skipPriority },
    },
    { roomID: req.user.roomID },
    { sort: { priority: -1 } }
  );

  if (!ticket) {
    return next(new AppError('All tickets were treated!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });

  if (ticket.priority === 'Preferencial') {
    preferencialTimes += 1;
  } else if (ticket.priority === 'Normal') {
    preferencialTimes = 0;
  }
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

exports.skipTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.skipID,
    { $unset: { roomID: '' }, $inc: { skipTimes: 1 } },
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
  }

  if (ticket.skipTimes === 5) {
    await Ticket.findByIdAndDelete(req.params.skipID);
  }
});
