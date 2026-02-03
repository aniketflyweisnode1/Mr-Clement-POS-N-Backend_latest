const { body, validationResult } = require('express-validator');

// Validation rules for creating feedback type
const validateCreateFeedbackType = [
  body('feedback_type')
    .trim()
    .notEmpty()
    .withMessage('Feedback type is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Feedback type must be between 2 and 100 characters')
];

// Validation rules for updating feedback type
const validateUpdateFeedbackType = [
  body('feedback_type_id')
    .notEmpty()
    .withMessage('Feedback type ID is required')
    .isNumeric()
    .withMessage('Feedback type ID must be a number'),
  body('feedback_type')
    .trim()
    .notEmpty()
    .withMessage('Feedback type is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Feedback type must be between 2 and 100 characters')
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
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateCreateFeedbackType,
  validateUpdateFeedbackType,
  handleValidationErrors
};
