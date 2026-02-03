const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const languageSchema = new mongoose.Schema({
  Language_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Language_name: {
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

// Auto-increment for Language_id
languageSchema.plugin(AutoIncrement, { inc_field: 'Language_id' });

module.exports = mongoose.model('Language', languageSchema);
