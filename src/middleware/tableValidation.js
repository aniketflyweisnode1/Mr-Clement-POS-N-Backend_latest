const { body, validationResult } = require('express-validator');

const validateCreateTable = [
  body('Title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('Floor_id')
    .notEmpty()
    .withMessage('Floor is required')
    .isNumeric()
    .withMessage('Invalid Floor ID'),
  body('Capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('Table_types_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Table type ID'),
  body('Emozi')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('image')
    .optional()
    .trim()
    .isString()
    .withMessage('Image must be a string'),
  body('Table-name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Table name must be between 2 and 100 characters'),
  body('Table-code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Table code must be between 2 and 20 characters'),
  body('Table-booking-price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Table booking price must be a positive number'),
  body('Table-Booking-Status_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Table booking status ID'),
  body('Seating-Persons_Count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Seating persons count must be a non-negative integer'),
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

const validateUpdateTable = [
  body('id')
    .notEmpty()
    .withMessage('Table ID is required')
    .isNumeric()
    .withMessage('Invalid Table ID'),
  body('Title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('Floor_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Floor ID'),
  body('Capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('Table_types_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Table type ID'),
  body('Emozi')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('image')
    .optional()
    .trim()
    .isString()
    .withMessage('Image must be a string'),
  body('Table-name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Table name must be between 2 and 100 characters'),
  body('Table-code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Table code must be between 2 and 20 characters'),
  body('Table-booking-price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Table booking price must be a positive number'),
  body('Table-Booking-Status_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Table booking status ID'),
  body('Seating-Persons_Count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Seating persons count must be a non-negative integer'),
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
  validateCreateTable,
  validateUpdateTable,
  handleValidationErrors
};
