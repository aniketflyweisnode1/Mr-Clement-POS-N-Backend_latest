const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewTypeSchema = new mongoose.Schema({
  Review_type_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Review_type: {
    type: String,
    required: true,
    trim: true
  },
  ReviewFor: {
    type: String,
    enum: ['order', 'user', 'table', 'Restorent'],
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
});
reviewTypeSchema.plugin(AutoIncrement, { inc_field: 'Review_type_id' });
// Update UpdatedAt timestamp before saving
reviewTypeSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Update UpdatedAt timestamp before updating
reviewTypeSchema.pre('findOneAndUpdate', function() {
  this.set({ UpdatedAt: new Date() });
});

module.exports = mongoose.model('Review_Type', reviewTypeSchema);
