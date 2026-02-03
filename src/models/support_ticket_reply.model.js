const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const supportTicketReplySchema = new mongoose.Schema({
  support_ticket_reply_id: {
    type: Number,
    unique: true
  },
  support_ticket_id: {
    type: Number,
    ref: 'support_ticket',
    required: true
  },
  reply: {
    type: String,
    required: true,
    trim: true
  },
  employee_id: {
    type: Number,
    ref: 'User',
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

// Auto-increment for support_ticket_reply_id
supportTicketReplySchema.plugin(AutoIncrement, { inc_field: 'support_ticket_reply_id' });

module.exports = mongoose.model('support_ticket_reply', supportTicketReplySchema);
