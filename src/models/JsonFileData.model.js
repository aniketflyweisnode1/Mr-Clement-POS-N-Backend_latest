const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const jsonFileDataSchema = new mongoose.Schema({
  json_file_id: {
    type: Number,
    unique: true,
    auto: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  original_filename: {
    type: String,
    required: true,
    trim: true
  },
  file_path: {
    type: String,
    required: true,
    trim: true
  },
  data_content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  file_size: {
    type: Number,
    default: 0
  },
  data_type: {
    type: String,
    enum: ['user_data', 'config', 'backup', 'export', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  is_processed: {
    type: Boolean,
    default: false
  },
  processed_at: {
    type: Date,
    default: null
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

// Auto-increment for json_file_id
jsonFileDataSchema.plugin(AutoIncrement, { inc_field: 'json_file_id' });

// Index for better query performance
jsonFileDataSchema.index({ filename: 1 });
jsonFileDataSchema.index({ data_type: 1 });
jsonFileDataSchema.index({ status: 1 });
jsonFileDataSchema.index({ CreateBy: 1 });

module.exports = mongoose.model('JsonFileData', jsonFileDataSchema);
