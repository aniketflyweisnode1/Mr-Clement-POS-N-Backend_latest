const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const planSchema = new mongoose.Schema({
  Plan_id: {
    type: Number,
    unique: true,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  plan_duration: {
    type: String,
    required: true,
    trim: true
  },
  plan_facility: {
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

// Auto-increment for Plan_id
planSchema.plugin(AutoIncrement, { inc_field: 'Plan_id' });

module.exports = mongoose.model('Plan', planSchema);
