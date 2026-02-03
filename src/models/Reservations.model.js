const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reservationsSchema = new mongoose.Schema({
  Reservations_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Reservations_online: {
    type: Boolean,
    enum: [true, false],
    default: true
  },
  Customer_id: {
    type: Number,
    ref: 'Customer',
    required: true
  },
  slots: {
    type: String,
    enum: ['Morning', 'Lunch', 'Dinner'],
    default: 'Morning'
  },
  slots_time: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  Floor: {
    type: Number,
    ref: 'Floor'
  },
  Capacity_count: {
    type: Number,
    required: true,
    min: 1
  },
  people_count: {
    type: Number,
    required: true,
    min: 1
  },
  PaymentStatus: {
    type: String,
    enum: ['UnPaid', 'Paid'],
    default: 'UnPaid'
  },
  Table_id: {
    type: Number,
    ref: 'Table'
  },
  Addone_Table_id: {
    type: Number,
    ref: 'Table'
  },
  Date_time: {
    type: Date,
    required: true
  },
  Notes: {
    type: String,
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

// Auto-increment for Reservations_id
reservationsSchema.plugin(AutoIncrement, { inc_field: 'Reservations_id' });

module.exports = mongoose.model('Reservations', reservationsSchema);
