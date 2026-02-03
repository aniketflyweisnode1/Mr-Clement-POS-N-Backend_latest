const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const deliveryTypeSchema = new mongoose.Schema({
  Delivery_type_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Type_name: {
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

// Auto-increment for Delivery_type_id
deliveryTypeSchema.plugin(AutoIncrement, { inc_field: 'Delivery_type_id' });

module.exports = mongoose.model('Delivery_type', deliveryTypeSchema);
