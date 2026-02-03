const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const employeeFeedbackSchema = new mongoose.Schema({
  Employee_Feedback_id: {
    type: Number,
    unique: true,
    auto: true
  },
  employee_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  order_id: {
    type: Number,
    required: true
  },
  feedback: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    default: 0
  },
  ratings: {
    type: Number,
    min: 1,
    max: 5
  },
  willRecommendothers: {
    type: Boolean,
    default: false
  },
  OveralFeedback: {
    type: String,
    enum: ['lovedit', 'good', 'averoge', 'bad', 'warst'],
    default: 'averoge'
  },
  staffBehavier: {
    type: String,
    trim: true
  },
  waitingTime: {
    type: Number,
    default: 0 // in minutes
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User',
    required: true
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

// Auto-increment for Employee_Feedback_id
employeeFeedbackSchema.plugin(AutoIncrement, { inc_field: 'Employee_Feedback_id' });

module.exports = mongoose.model('Employee_Feedback', employeeFeedbackSchema);

