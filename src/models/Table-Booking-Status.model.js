const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const tableBookingStatusSchema = new mongoose.Schema({
  'Table-Booking-Status_id': {
    type: Number,
    unique: true,
    auto: true
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Details: {
    type: String,
    default: null
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

// Auto-increment for Table-Booking-Status_id
tableBookingStatusSchema.plugin(AutoIncrement, { inc_field: 'Table-Booking-Status_id' });

module.exports = mongoose.model('Table-Booking-Status', tableBookingStatusSchema);
