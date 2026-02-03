const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemVariantsSchema = new mongoose.Schema({
  item_Variants_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Variants: {
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

// Auto-increment for item_Variants_id
itemVariantsSchema.plugin(AutoIncrement, { inc_field: 'item_Variants_id' });

module.exports = mongoose.model('item_Variants', itemVariantsSchema);
