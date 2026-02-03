const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemsSchema = new mongoose.Schema({
  Items_id: {
    type: Number,
    unique: true,
    auto: true
  },
  // New fields as per UI
  Title: {
    type: String,
    required: true,
    trim: true
  },
  Description: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  Net_Price: {
    type: Number,
    default: 0,
    min: 0
  },
  Price: {
    type: Number,
    required: true,
    min: 0
  },
  Items_types_id: {
    type: Number,
    ref: 'Items_types',
    required: true
  },
  Tax_id: {
    type: Number,
    ref: 'Tax_setup',
    default: null
  },
  Variants: [{
    type: Number,
    ref: 'item_Variants'
  }],
  Addons: [{
    type: Number,
    ref: 'item_Addons'
  }],
  // Legacy fields (kept for backward compatibility)
  Emozi: {
    type: String,
    default: '🍽️',
    trim: true
  },
  'item-name': {
    type: String,
    default: null,
    trim: true
  },
  'item-code': {
    type: String,
    default: null,
    trim: true
  },
  'item-size': {
    type: String,
    default: null
  },
  'item-price': {
    type: Number,
    default: null,
    min: 0
  },
  'item-quantity': {
    type: Number,
    default: 1,
    min: 0
  },
  'item-stock-quantity': {
    type: Number,
    default: 0,
    min: 0
  },
  Details: {
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

// Auto-increment for Items_id
itemsSchema.plugin(AutoIncrement, { inc_field: 'Items_id' });

module.exports = mongoose.model('Items', itemsSchema);
