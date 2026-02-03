const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemsTypesSchema = new mongoose.Schema({
  Items_types_id: {
    type: Number,
    unique: true,
    auto: true
  },
  emozi: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  details: {
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

// Auto-increment for Items_types_id
itemsTypesSchema.plugin(AutoIncrement, { inc_field: 'Items_types_id' });

module.exports = mongoose.model('Items_types', itemsTypesSchema);
