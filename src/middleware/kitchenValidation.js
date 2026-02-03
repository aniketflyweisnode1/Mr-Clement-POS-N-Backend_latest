const { body, validationResult } = require('express-validator');

// Validation rules for creating kitchen
const validateCreateKitchen = [
  body('Kitchen_type_id')
    .notEmpty()
    .withMessage('Kitchen type ID is required')
    .isNumeric()
    .withMessage('Kitchen type ID must be a number'),
  body('emozi')
    .notEmpty()
    .withMessage('Emozi is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Emozi must be between 1 and 255 characters'),
  body('Name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('token')
    .optional()
    .isString()
    .withMessage('Token must be a string'),
  body('working_user_id')
    .notEmpty()
    .withMessage('Working user ID is required')
    .isNumeric()
    .withMessage('Working user ID must be a number'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating kitchen
const validateUpdateKitchen = [
  body('id')
    .notEmpty()
    .withMessage('Kitchen ID is required')
    .isNumeric()
    .withMessage('Kitchen ID must be a number'),
  body('Kitchen_type_id')
    .optional()
    .isNumeric()
    .withMessage('Kitchen type ID must be a number'),
  body('emozi')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Emozi must be between 1 and 255 characters'),
  body('Name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('token')
    .optional()
    .isString()
    .withMessage('Token must be a string'),
  body('working_user_id')
    .optional()
    .isNumeric()
    .withMessage('Working user ID must be a number'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateCreateKitchen,
  validateUpdateKitchen,
  handleValidationErrors
};
