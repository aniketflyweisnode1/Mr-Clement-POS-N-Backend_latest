const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const currencySchema = new mongoose.Schema({
  currency_id: {
    type: Number,
    unique: true,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
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

// Auto-increment for currency_id
currencySchema.plugin(AutoIncrement, { inc_field: 'currency_id' });

module.exports = mongoose.model('currency', currencySchema);
