const { body, validationResult } = require('express-validator');

// Validation rules for creating review type
const validateCreateReviewType = [
  body('Review_type')
    .trim()
    .notEmpty()
    .withMessage('Review type is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Review type must be between 2 and 100 characters'),
  body('ReviewFor')
    .trim()
    .notEmpty()
    .withMessage('ReviewFor is required')
    .isIn(['order', 'user', 'table', 'Restorent'])
    .withMessage('ReviewFor must be one of: order, user, table, Restorent')
];

// Validation rules for updating review type
const validateUpdateReviewType = [
  body('Review_type_id')
    .notEmpty()
    .withMessage('Review type ID is required')
    .isNumeric()
    .withMessage('Review type ID must be a number'),
  body('Review_type')
    .trim()
    .notEmpty()
    .withMessage('Review type is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Review type must be between 2 and 100 characters'),
  body('ReviewFor')
    .trim()
    .notEmpty()
    .withMessage('ReviewFor is required')
    .isIn(['order', 'user', 'table', 'Restorent'])
    .withMessage('ReviewFor must be one of: order, user, table, Restorent')
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
  validateCreateReviewType,
  validateUpdateReviewType,
  handleValidationErrors
};
