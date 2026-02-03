const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const customerSchema = new mongoose.Schema({
  Customer_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Customer_type_id: {
    type: Number,
    ref: 'Customer_type'
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  DOB: {
    type: Date,
    required: true
  },
  Table_id: {
    type: Number,
    ref: 'Table'
  },
  Address: {
    type: String,
    trim: true
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

// Auto-increment for Customer_id
customerSchema.plugin(AutoIncrement, { inc_field: 'Customer_id' });

module.exports = mongoose.model('Customer', customerSchema);
