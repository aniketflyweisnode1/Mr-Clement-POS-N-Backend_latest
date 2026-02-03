const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemMapVariantsSchema = new mongoose.Schema({
  item_map_Variants_id: {
    type: Number,
    unique: true,
    auto: true
  },
  item_Variants_id: {
    type: Number,
    ref: 'item_Variants',
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

// Auto-increment for item_map_Variants_id
itemMapVariantsSchema.plugin(AutoIncrement, { inc_field: 'item_map_Variants_id' });

module.exports = mongoose.model('item_map_Variants', itemMapVariantsSchema);
