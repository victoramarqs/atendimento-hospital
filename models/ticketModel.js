const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      required: true,
      enum: ['Normal', 'Preferencial', 'Preferencial Especial'],
    },
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    roomID: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    skipTimes: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ticketSchema.virtual('ticket').get(function () {
  if (this.priority === 'Normal') return `N${this.number}`;
  if (this.priority === 'Preferencial') return `P${this.number}`;
  if (this.priority === 'Preferencial Especial') return `PE${this.number}`;
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
