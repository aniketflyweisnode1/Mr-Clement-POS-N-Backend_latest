const { body, validationResult } = require('express-validator');

const validateCreateFloor = [
  body('Floor_Type_id')
    .notEmpty()
    .withMessage('Floor type ID is required')
    .isNumeric()
    .withMessage('Invalid Floor type ID'),
  body('Floor_Name')
    .trim()
    .notEmpty()
    .withMessage('Floor name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Floor name must be between 2 and 100 characters'),
  body('Total_Table_Count')
    .notEmpty()
    .withMessage('Total table count is required')
    .isInt({ min: 0 })
    .withMessage('Total table count must be a non-negative integer'),
  body('Seating-Persons_Count')
    .notEmpty()
    .withMessage('Seating persons count is required')
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

const validateUpdateFloor = [
  body('id')
    .notEmpty()
    .withMessage('Floor ID is required')
    .isNumeric()
    .withMessage('Invalid Floor ID'),
  body('Floor_Type_id')
    .optional()
    .notEmpty()
    .withMessage('Floor type ID cannot be empty')
    .isNumeric()
    .withMessage('Invalid Floor type ID'),
  body('Floor_Name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Floor name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Floor name must be between 2 and 100 characters'),
  body('Total_Table_Count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total table count must be a non-negative integer'),
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
  validateCreateFloor,
  validateUpdateFloor,
  handleValidationErrors
};
