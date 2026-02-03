const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const supportTicketTypeSchema = new mongoose.Schema({
  support_ticket_type_id: {
    type: Number,
    unique: true
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  nodes: {
    type: String,
    default: null,
    trim: true
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User'
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

// Auto-increment for support_ticket_type_id
supportTicketTypeSchema.plugin(AutoIncrement, { inc_field: 'support_ticket_type_id' });

module.exports = mongoose.model('support_ticket_type', supportTicketTypeSchema);
