const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemMapAddonsSchema = new mongoose.Schema({
  item_map_Addons_id: {
    type: Number,
    unique: true,
    auto: true
  },
  item_Addons_id: {
    type: Number,
    ref: 'item_Addons',
    required: true
  },
  item_id: {
    type: Number,
    ref: 'Items',
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

// Auto-increment for item_map_Addons_id
itemMapAddonsSchema.plugin(AutoIncrement, { inc_field: 'item_map_Addons_id' });

module.exports = mongoose.model('item_map_Addons', itemMapAddonsSchema);
