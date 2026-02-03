const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const supportTicketSchema = new mongoose.Schema({
  support_ticket_id: {
    type: Number,
    unique: true
  },
  support_ticket_type_id: {
    type: Number,
    ref: 'support_ticket_type',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  customer_id: {
    type: Number,
    ref: 'Customer',
    required: true
  },
  Ticket_status: {
    type: String,
    enum: ['Pending', 'Open', 'Process', 'Solve', 'Close'],
    default: 'Pending'
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User',
    required: true
  },
  CreateAt: {
    type: Date,
    default: Date.now
  },
  UpdatedBy: {
    type: Number,
    ref: 'User'
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for support_ticket_id
supportTicketSchema.plugin(AutoIncrement, { inc_field: 'support_ticket_id' });

module.exports = mongoose.model('support_ticket', supportTicketSchema);
