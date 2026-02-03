const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const newSletterSchema = new mongoose.Schema({
  NewSletter_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: false
  },
  Email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
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

// Auto-increment for NewSletter_id
newSletterSchema.plugin(AutoIncrement, { inc_field: 'NewSletter_id' });

module.exports = mongoose.model('NewSletter', newSletterSchema);

