const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const storeMenuSchema = new mongoose.Schema({
  Store_menu_id: {
    type: Number,
    unique: true,
    auto: true
  },
  name: {
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

// Auto-increment for Store_menu_id
storeMenuSchema.plugin(AutoIncrement, { inc_field: 'Store_menu_id' });

module.exports = mongoose.model('Store_menu', storeMenuSchema);
