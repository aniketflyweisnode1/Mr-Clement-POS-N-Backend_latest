const { body, validationResult } = require('express-validator');

// Validation rules for creating review
const validateCreateReview = [
  body('Review_Type_id')
    .notEmpty()
    .withMessage('Review type ID is required')
    .isNumeric()
    .withMessage('Review type ID must be a number'),
  body('Review_type')
    .trim()
    .notEmpty()
    .withMessage('Review content is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review content must be between 10 and 1000 characters'),
  body('for_Review_id')
    .notEmpty()
    .withMessage('For review ID is required')
    .isNumeric()
    .withMessage('For review ID must be a number'),
  body('ReviewStarCount')
    .notEmpty()
    .withMessage('Star count is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Star count must be between 1 and 5')
];

// Validation rules for updating review
const validateUpdateReview = [
  body('Review_id')
    .notEmpty()
    .withMessage('Review ID is required')
    .isNumeric()
    .withMessage('Review ID must be a number'),
  body('Review_Type_id')
    .notEmpty()
    .withMessage('Review type ID is required')
    .isNumeric()
    .withMessage('Review type ID must be a number'),
  body('Review_type')
    .trim()
    .notEmpty()
    .withMessage('Review content is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review content must be between 10 and 1000 characters'),
  body('ReviewStarCount')
    .notEmpty()
    .withMessage('Star count is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Star count must be between 1 and 5')
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
  validateCreateReview,
  validateUpdateReview,
  handleValidationErrors
};
