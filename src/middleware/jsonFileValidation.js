const { body, param, query, validationResult } = require('express-validator');

// Validation rules for creating JSON file
const validateCreateJsonFile = [
  body('filename')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Filename must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Filename can only contain letters, numbers, underscores, and hyphens'),
  
  body('data')
    .isObject()
    .withMessage('Data must be a valid object')
    .notEmpty()
    .withMessage('Data cannot be empty'),
];

// Validation rules for updating JSON file
const validateUpdateJsonFile = [
  param('filename')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Filename must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Filename can only contain letters, numbers, underscores, and hyphens'),
  
  body('data')
    .isObject()
    .withMessage('Data must be a valid object')
    .notEmpty()
    .withMessage('Data cannot be empty'),
];

// Validation rules for filling all JSON files to database (POST)
const validateFillAllJsonFiles = [
  body('target_model')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Target model must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Target model can only contain letters, numbers, and underscores'),
  
  body('folder_path')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Folder path must be between 1 and 255 characters'),
  
  body('mapping_rules')
    .optional()
    .isObject()
    .withMessage('Mapping rules must be a valid object'),
  
  body('auto_delete')
    .optional()
    .isBoolean()
    .withMessage('Auto delete must be a boolean value'),
];

// Validation rules for filling all JSON files to database (GET)
const validateFillAllJsonFilesGet = [
  query('target_model')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Target model must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Target model can only contain letters, numbers, and underscores'),
  
  query('folder_path')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Folder path must be between 1 and 255 characters'),
  
  query('mapping_rules')
    .optional()
    .isString()
    .withMessage('Mapping rules must be a valid JSON string'),
  
  query('auto_delete')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Auto delete must be true or false'),
];

// Validation rules for filename parameter
const validateFilename = [
  param('filename')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Filename must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Filename can only contain letters, numbers, underscores, and hyphens'),
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  validateCreateJsonFile,
  validateUpdateJsonFile,
  validateFillAllJsonFiles,
  validateFillAllJsonFilesGet,
  validateFilename,
  handleValidationErrors
};
