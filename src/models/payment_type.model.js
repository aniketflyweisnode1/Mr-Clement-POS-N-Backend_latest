const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const paymentTypeSchema = new mongoose.Schema({
  payment_type_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  nodes: {
    type: String,
    default: null,
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

// Auto-increment for payment_type_id
paymentTypeSchema.plugin(AutoIncrement, { inc_field: 'payment_type_id' });

module.exports = mongoose.model('payment_type', paymentTypeSchema);
