const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const tableSchema = new mongoose.Schema({
  Table_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Title: {
    type: String,
    required: true,
    trim: true
  },
  Floor_id: {
    type: Number,
    ref: 'Floor',
    required: true
  },
  Capacity: {
    type: Number,
    required: true,
    min: 1
  },
  Table_types_id: {
    type: Number,
    ref: 'Table_types',
    default: null
  },
  Emozi: {
    type: String,
    default: '🪑',
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  'Table-name': {
    type: String,
    default: null,
    trim: true
  },
  'Table-code': {
    type: String,
    default: null,
    trim: true
  },
  'Table-booking-price': {
    type: Number,
    default: 0,
    min: 0
  },
  'Table-Booking-Status_id': {
    type: Number,
    ref: 'Table-Booking-Status',
    default: 1
  },
  'Seating-Persons_Count': {
    type: Number,
    default: null,
    min: 0
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

// Auto-increment for Table_id
tableSchema.plugin(AutoIncrement, { inc_field: 'Table_id' });

module.exports = mongoose.model('Table', tableSchema);
