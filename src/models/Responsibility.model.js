const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const responsibilitySchema = new mongoose.Schema({
  Responsibility_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Responsibility_name: {
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

// Auto-increment for Responsibility_id
responsibilitySchema.plugin(AutoIncrement, { inc_field: 'Responsibility_id' });

module.exports = mongoose.model('Responsibility', responsibilitySchema);
