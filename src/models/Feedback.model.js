const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const feedbackSchema = new mongoose.Schema({
  feedback_id: {
    type: Number,
    unique: true,
    auto: true
  },
  feedback_Type_id: {
    type: Number,
    ref: 'Feedback_Type',
    required: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  Remarks: {
    type: String,
    trim: true
  },
  order_id: {
    type: Number,
    ref: 'Quick_Order',
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
feedbackSchema.plugin(AutoIncrement, { inc_field: 'feedback_id' });
// Update UpdatedAt timestamp before saving
feedbackSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Update UpdatedAt timestamp before updating
feedbackSchema.pre('findOneAndUpdate', function() {
  this.set({ UpdatedAt: new Date() });
});

module.exports = mongoose.model('Feedback', feedbackSchema);
