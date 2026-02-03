const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const walletSchema = new mongoose.Schema({
  wallet_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Amount: {
    type: Number,
    required: true,
    default: 0
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

// Auto-increment for wallet_id
walletSchema.plugin(AutoIncrement, { inc_field: 'wallet_id' });

module.exports = mongoose.model('wallet', walletSchema);
