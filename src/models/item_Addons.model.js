const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemAddonsSchema = new mongoose.Schema({
  item_Addons_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Addons: {
    type: String,
    required: true,
    trim: true
  },
  prices: {
    type: Number,
    required: true,
    min: 0,
    default: 1
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

// Auto-increment for item_Addons_id
itemAddonsSchema.plugin(AutoIncrement, { inc_field: 'item_Addons_id' });

module.exports = mongoose.model('item_Addons', itemAddonsSchema);
