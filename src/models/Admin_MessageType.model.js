const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminMessageTypeSchema = new mongoose.Schema({
  Admin_MassageType_id: {
    type: Number,
    unique: true,
    auto: true
  },
  MessageType: {
    type: String,
    required: true,
    trim: true
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

// Auto-increment for Admin_MassageType_id
adminMessageTypeSchema.plugin(AutoIncrement, { inc_field: 'Admin_MassageType_id' });

module.exports = mongoose.model('Admin_MessageType', adminMessageTypeSchema);

