const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const feedbackTypeSchema = new mongoose.Schema({
  feedback_type_id: {
    type: Number,
    unique: true,
    auto: true
  },
  feedback_type: {
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
});
feedbackTypeSchema.plugin(AutoIncrement, { inc_field: 'feedback_type_id' });
// Update UpdatedAt timestamp before saving
feedbackTypeSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Update UpdatedAt timestamp before updating
feedbackTypeSchema.pre('findOneAndUpdate', function() {
  this.set({ UpdatedAt: new Date() });
});

module.exports = mongoose.model('Feedback_Type', feedbackTypeSchema);
