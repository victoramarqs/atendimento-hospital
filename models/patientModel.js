const mongoose = require('mongoose');

function addMinutes(date, minutes) {
  return new Date(date).getTime() + minutes * 60000;
}

const urgencyMaxTime = (color) => {
  if (color === 'ORANGE') {
    return 10;
  }
  if (color === 'YELLOW') {
    return 60;
  }
  if (color === 'GREEN') {
    return 120;
  }
  if (color === 'BLUE') {
    return 240;
  }
};

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    guicheID: {
      type: String,
    },
    urgency: {
      type: String,
      required: true,
      enum: ['BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'RED'],
    },
    clientID: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    medical: {
      room: {
        type: String,
      },
      doctorID: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

patientSchema.virtual('waitingMaxTime').get(function () {
  if (this.urgency === 'RED') {
    return this.createdAt;
  }
  return addMinutes(this.createdAt, urgencyMaxTime(this.urgency));
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
