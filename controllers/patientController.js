const Patient = require('../models/patientModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllPatients = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Patient.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const patients = await features.query;

  res.status(200).json({
    status: 'success',
    results: patients.length,
    data: {
      patients,
    },
  });
});

exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.aggregate([
    { $match: { medical: { doctorID: undefined } } },
    {
      $project: {
        customField: {
          $switch: {
            branches: [
              { case: { $eq: ['$priority', 'RED'] }, then: 0 },
              { case: { $eq: ['$priority', 'ORANGE'] }, then: 1 },
              { case: { $gte: ['$waitingMaxTime', Date.now()] }, then: 2 },
              { case: { $eq: ['$priority', 'YELLOW'] }, then: 3 },
              { case: { $eq: ['$priority', 'GREEN'] }, then: 4 },
              { case: { $eq: ['$priority', 'BLUE'] }, then: 5 },
            ],
          },
        },
      },
    },
    { $sort: { customField: 1, waitingMaxTime: 1 } },
    { $limit: 1 },
  ]);

  if (!patient) {
    return next(new AppError('No more patients to call', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

exports.subscribePatient = catchAsync(async (req, res, next) => {
  const newPatient = await Patient.create({
    name: req.body.name,
    urgency: req.body.urgency,
  });

  res.status(201).json({
    status: 'success',
    data: {
      patient: newPatient,
    },
  });
});

exports.updatePatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOneAndUpdate(
    {
      clientID: undefined,
      guicheID: undefined,
      $or: [
        { medical: { doctorID: undefined } },
        { medical: { description: { $ne: undefined } } },
      ],
    },
    { guicheID: req.user.deskID }
  );

  res.status(200).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

// exports.deleteUser = catchAsync(async (req, res, next) => {
//   await User.findByIdAndDelete(req.params.id);

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// exports.getUserStats = catchAsync(async (req, res, next) => {
//   const stats = User.aggregate();
//   res.status(204).json({
//     status: 'success',
//     data: stats,
//   });
// });

// const patient = await Patient.aggregate([
//   {
//     $project: {
//       customField: {
//         $switch: {
//           branches: [
//             { case: { $eq: ['$priority', 'RED'] }, then: 1 },
//             { case: { $eq: ['$priority', 'ORANGE'] }, then: 2 },
//           ],
//         },
//       },
//     },
//   },
// ]);
