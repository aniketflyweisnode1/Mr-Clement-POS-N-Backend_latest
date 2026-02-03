const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const auditsSchema = new mongoose.Schema({
  Audits_id: {
    type: Number,
    unique: true,
    auto: true
  },
  environment: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true
  },
  Reservations: {
    type: String,
    default: null,
    trim: true
  },
  file: {
    type: String,
    default: null,
    trim: true
  },
  ChineseRamen: {
    type: String,
    default: null,
    trim: true
  },
  Employee_id: {
    type: Number,
    ref: 'User'
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

// Auto-increment for Audits_id
auditsSchema.plugin(AutoIncrement, { inc_field: 'Audits_id' });

module.exports = mongoose.model('Audits', auditsSchema);
