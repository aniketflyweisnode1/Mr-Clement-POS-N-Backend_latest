const { body, validationResult } = require('express-validator');

// Validation rules for creating feedback
const validateCreateFeedback = [
  body('feedback_Type_id')
    .notEmpty()
    .withMessage('Feedback type ID is required')
    .isNumeric()
    .withMessage('Feedback type ID must be a number'),
  body('feedback')
    .trim()
    .notEmpty()
    .withMessage('Feedback content is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Feedback content must be between 10 and 1000 characters'),
  body('Remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters'),
  body('order_id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isNumeric()
    .withMessage('Order ID must be a number')
];

// Validation rules for updating feedback
const validateUpdateFeedback = [
  body('feedback_id')
    .notEmpty()
    .withMessage('Feedback ID is required')
    .isNumeric()
    .withMessage('Feedback ID must be a number'),
  body('feedback_Type_id')
    .notEmpty()
    .withMessage('Feedback type ID is required')
    .isNumeric()
    .withMessage('Feedback type ID must be a number'),
  body('feedback')
    .trim()
    .notEmpty()
    .withMessage('Feedback content is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Feedback content must be between 10 and 1000 characters'),
  body('Remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters')
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
  validateCreateFeedback,
  validateUpdateFeedback,
  handleValidationErrors
};
