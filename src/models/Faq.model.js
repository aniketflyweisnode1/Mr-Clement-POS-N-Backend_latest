const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const faqSchema = new mongoose.Schema({
  faq_in_id: {
    type: Number,
    unique: true,
    auto: true
  },
  faq_question: {
    type: String,
    required: true,
    trim: true
  },
  faq_answer: {
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
    default: null
  }
}, {
  timestamps: false,
  versionKey: false
});

faqSchema.plugin(AutoIncrement, { inc_field: 'faq_in_id' });

module.exports = mongoose.model('Faq', faqSchema);
