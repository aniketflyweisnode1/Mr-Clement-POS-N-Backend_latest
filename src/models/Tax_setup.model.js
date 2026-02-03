const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const taxSetupSchema = new mongoose.Schema({
  Tax_setup_id: {
    type: Number,
    unique: true,
    auto: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  servicecharge: {
    type: Number,
    default: 10.0,
    min: 0
  },
  type: {
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

// Auto-increment for Tax_setup_id
taxSetupSchema.plugin(AutoIncrement, { inc_field: 'Tax_setup_id' });

module.exports = mongoose.model('Tax_setup', taxSetupSchema);
