const { body, validationResult } = require('express-validator');

// Validation rules for creating reservation
const validateCreateReservation = [
  body('Customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isNumeric()
    .withMessage('Customer ID must be a number'),
  body('slots_time')
    .notEmpty()
    .withMessage('Slots time is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Slots time must be between 1 and 50 characters'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('Capacity_count')
    .notEmpty()
    .withMessage('Capacity count is required')
    .isNumeric()
    .withMessage('Capacity count must be a number')
    .isInt({ min: 1 })
    .withMessage('Capacity count must be at least 1'),
  body('people_count')
    .notEmpty()
    .withMessage('People count is required')
    .isNumeric()
    .withMessage('People count must be a number')
    .isInt({ min: 1 })
    .withMessage('People count must be at least 1'),
  body('Date_time')
    .notEmpty()
    .withMessage('Date and time is required')
    .isISO8601()
    .withMessage('Date and time must be a valid date'),
  body('Reservations_online')
    .optional()
    .isBoolean()
    .withMessage('Reservations online must be a boolean value'),
  body('slots')
    .optional()
    .isIn(['Morning', 'Lunch', 'Dinner'])
    .withMessage('Slots must be one of: Morning, Lunch, Dinner'),
  body('Floor')
    .optional()
    .isNumeric()
    .withMessage('Floor must be a number'),
  body('PaymentStatus')
    .optional()
    .isIn(['UnPaid', 'Paid'])
    .withMessage('Payment status must be one of: UnPaid, Paid'),
  body('Table_id')
    .optional()
    .isNumeric()
    .withMessage('Table ID must be a number'),
  body('Addone_Table_id')
    .optional()
    .isNumeric()
    .withMessage('Addon table ID must be a number'),
  body('Notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating reservation
const validateUpdateReservation = [
  body('id')
    .notEmpty()
    .withMessage('Reservation ID is required')
    .isNumeric()
    .withMessage('Reservation ID must be a number'),
  body('Customer_id')
    .optional()
    .isNumeric()
    .withMessage('Customer ID must be a number'),
  body('slots_time')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Slots time must be between 1 and 50 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('Capacity_count')
    .optional()
    .isNumeric()
    .withMessage('Capacity count must be a number')
    .isInt({ min: 1 })
    .withMessage('Capacity count must be at least 1'),
  body('people_count')
    .optional()
    .isNumeric()
    .withMessage('People count must be a number')
    .isInt({ min: 1 })
    .withMessage('People count must be at least 1'),
  body('Date_time')
    .optional()
    .isISO8601()
    .withMessage('Date and time must be a valid date'),
  body('Reservations_online')
    .optional()
    .isBoolean()
    .withMessage('Reservations online must be a boolean value'),
  body('slots')
    .optional()
    .isIn(['Morning', 'Lunch', 'Dinner'])
    .withMessage('Slots must be one of: Morning, Lunch, Dinner'),
  body('Floor')
    .optional()
    .isNumeric()
    .withMessage('Floor must be a number'),
  body('PaymentStatus')
    .optional()
    .isIn(['UnPaid', 'Paid'])
    .withMessage('Payment status must be one of: UnPaid, Paid'),
  body('Table_id')
    .optional()
    .isNumeric()
    .withMessage('Table ID must be a number'),
  body('Addone_Table_id')
    .optional()
    .isNumeric()
    .withMessage('Addon table ID must be a number'),
  body('Notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
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
  validateCreateReservation,
  validateUpdateReservation,
  handleValidationErrors
};
