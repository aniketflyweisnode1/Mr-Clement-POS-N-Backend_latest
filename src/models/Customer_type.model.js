const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const customerTypeSchema = new mongoose.Schema({
  Customer_type_id: {
    type: Number,
    unique: true,
    auto: true
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

// Auto-increment for Customer_type_id
customerTypeSchema.plugin(AutoIncrement, { inc_field: 'Customer_type_id' });

module.exports = mongoose.model('Customer_type', customerTypeSchema);
