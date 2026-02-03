const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewSchema = new mongoose.Schema({
  Review_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Review_Type_id: {
    type: Number,
    ref: 'Review_Type',
    required: true
  },
  Review_type: {
    type: String,
    required: true,
    trim: true
  },
  for_Review_id: {
    type: Number,
    required: true
  },
  ReviewStarCount: {
    type: Number,
    required: true,
    min: 1,
    max: 5
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
reviewSchema.plugin(AutoIncrement, { inc_field: 'Review_id' });
// Update UpdatedAt timestamp before saving
reviewSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Update UpdatedAt timestamp before updating
reviewSchema.pre('findOneAndUpdate', function() {
  this.set({ UpdatedAt: new Date() });
});

module.exports = mongoose.model('Review', reviewSchema);
