const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const ticketRouter = require('./routes/ticketRoutes');
const patientRouter = require('./routes/patientRoutes');
const clientRouter = require('./routes/clientRoutes');
const doctorRouter = require('./routes/doctorRoutes');

const app = express();

// MIDDLEWARES
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

// ROUTES
app.use('/api/tickets', ticketRouter);
// app.use('/api/patients', patientRouter);
// app.use('/api/clients', clientRouter);
// app.use('/api/doctors', doctorRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on the server!`,
  // }); V1

  // const err = new Error(`Can't find ${req.originalUrl} on the server!`);
  // err.status = 'fail';
  // err.statusCode = 404; V2

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
