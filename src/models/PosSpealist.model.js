const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const posSpealistSchema = new mongoose.Schema({
  PosSpealist_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Business_Name: {
    type: String,
    required: true,
    trim: true
  },
  Email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  PhoneNo: {
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
    ref: 'User',
    required: false
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

// Auto-increment for PosSpealist_id
posSpealistSchema.plugin(AutoIncrement, { inc_field: 'PosSpealist_id' });

module.exports = mongoose.model('PosSpealist', posSpealistSchema);

