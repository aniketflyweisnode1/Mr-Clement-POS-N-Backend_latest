const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const menuMapItemsSchema = new mongoose.Schema({
  Menu_map_Items_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Menu_id: {
    type: Number,
    ref: 'Store_menu',
    required: true
  },
  item_id: {
    type: Number,
    ref: 'Items',
    required: true
  },
  store_id: {
    type: Number,
    ref: 'Store_details',
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

// Auto-increment for Menu_map_Items_id
menuMapItemsSchema.plugin(AutoIncrement, { inc_field: 'Menu_map_Items_id' });

module.exports = mongoose.model('Menu_map_Items', menuMapItemsSchema);
