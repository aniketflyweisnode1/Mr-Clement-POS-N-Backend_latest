const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const floorTypeSchema = new mongoose.Schema({
  Floor_Type_id: {
    type: Number,
    unique: true,
    auto: true
  },
  emozi: {
    type: String,
    required: true,
    trim: true
  },
  Floor_image: {
    type: String,
    default: null
  },
  Floor_Type_Name: {
    type: String,
    required: true,
    trim: true
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

// Auto-increment for Floor_Type_id
floorTypeSchema.plugin(AutoIncrement, { inc_field: 'Floor_Type_id' });

module.exports = mongoose.model('Floor_Type', floorTypeSchema);
