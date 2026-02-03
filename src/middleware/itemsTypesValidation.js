const { body, validationResult } = require('express-validator');

const validateCreateItemsTypes = [
  body('emozi')
    .trim()
    .notEmpty()
    .withMessage('Emoji is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('image')
    .optional()
    .trim()
    .isString()
    .withMessage('Image must be a string'),
  body('Name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Details must not exceed 500 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateItemsTypes = [
  body('id')
    .notEmpty()
    .withMessage('Items type ID is required')
    .isNumeric()
    .withMessage('Invalid Items type ID'),
  body('emozi')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Emoji cannot be empty')
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('image')
    .optional()
    .trim()
    .isString()
    .withMessage('Image must be a string'),
  body('Name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Details must not exceed 500 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

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
  validateCreateItemsTypes,
  validateUpdateItemsTypes,
  handleValidationErrors
};
