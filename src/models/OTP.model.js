const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const otpSchema = new mongoose.Schema({
  OTP_id: {
    type: Number,
    unique: true,
    auto: true
  },
  OTP_type: {
    type: String,
    enum: ['ForgetPassword', 'Login'],
    required: true
  },
  OTP: {
    type: String,
    required: true,
    length: 8
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
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for OTP_id
otpSchema.plugin(AutoIncrement, { inc_field: 'OTP_id' });

// Index for faster queries
otpSchema.index({ user_id: 1, OTP_type: 1, Status: 1 });
otpSchema.index({ OTP: 1, user_id: 1 });

module.exports = mongoose.model('OTP', otpSchema);
