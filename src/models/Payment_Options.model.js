const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const paymentOptionsSchema = new mongoose.Schema({
  Payment_Options_id: {
    type: Number,
    unique: true,
    auto: true
  },
  PaymentOption: [{
    option: {
      type: String,
      required: true,
      trim: true
    },
    Details: {
      type: String,
      default: '',
      trim: true
    }
  }],
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
    ref: 'User',
    default: null
  },
  UpdatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for Payment_Options_id
paymentOptionsSchema.plugin(AutoIncrement, { inc_field: 'Payment_Options_id' });

module.exports = mongoose.model('Payment_Options', paymentOptionsSchema);

