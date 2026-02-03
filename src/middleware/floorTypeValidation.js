const { body, validationResult } = require('express-validator');

const validateCreateFloorType = [
  body('emozi')
    .trim()
    .notEmpty()
    .withMessage('Emoji is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('Floor_image')
    .optional()
    .trim()
    .isString()
    .withMessage('Floor image must be a string'),
  body('Floor_Type_Name')
    .trim()
    .notEmpty()
    .withMessage('Floor type name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Floor type name must be between 2 and 100 characters'),
  body('Details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Details must not exceed 500 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateFloorType = [
  body('id')
    .notEmpty()
    .withMessage('Floor type ID is required')
    .isNumeric()
    .withMessage('Invalid Floor type ID'),
  body('emozi')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Emoji cannot be empty')
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('Floor_image')
    .optional()
    .trim()
    .isString()
    .withMessage('Floor image must be a string'),
  body('Floor_Type_Name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Floor type name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Floor type name must be between 2 and 100 characters'),
  body('Details')
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
  validateCreateFloorType,
  validateUpdateFloorType,
  handleValidationErrors
};
