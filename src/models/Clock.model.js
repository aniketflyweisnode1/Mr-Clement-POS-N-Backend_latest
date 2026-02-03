const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const clockSchema = new mongoose.Schema({
  Clock_in_id: {
    type: Number,
    unique: true,
    auto: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  in_time: {
    type: Date,
    required: true
  },
  out_time: {
    type: Date,
    default: null
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
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
    default: null
  }
}, {
  timestamps: false,
  versionKey: false
});

clockSchema.plugin(AutoIncrement, { inc_field: 'Clock_in_id' });

module.exports = mongoose.model('Clock', clockSchema);
