const { body, query, validationResult } = require('express-validator');

// Validation for creating table booking
const validateCreateTableBooking = [
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),

  body('customer_mobile')
    .notEmpty()
    .withMessage('Customer mobile is required')
    .isMobilePhone()
    .withMessage('Invalid mobile phone number'),

  body('customer_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),

  body('table_id')
    .notEmpty()
    .withMessage('Table ID is required')
    .isInt({ min: 1 })
    .withMessage('Table ID must be a positive integer'),

  body('floor_id')
    .notEmpty()
    .withMessage('Floor ID is required')
    .isInt({ min: 1 })
    .withMessage('Floor ID must be a positive integer'),

  body('booking_date')
    .notEmpty()
    .withMessage('Booking date is required')
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('booking_time')
    .notEmpty()
    .withMessage('Booking time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),

  body('number_of_guests')
    .notEmpty()
    .withMessage('Number of guests is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of guests must be between 1 and 50'),

  body('booking_status_id')
    .notEmpty()
    .withMessage('Booking status ID is required')
    .isInt({ min: 1 })
    .withMessage('Booking status ID must be a positive integer'),

  body('duration_hours')
    .optional()
    .isFloat({ min: 0.5, max: 12 })
    .withMessage('Duration must be between 0.5 and 12 hours'),

  body('special_requests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
];

// Validation for updating table booking
const validateUpdateTableBooking = [
  body('booking_id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),

  body('customer_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),

  body('customer_mobile')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid mobile phone number'),

  body('customer_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),

  body('table_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Table ID must be a positive integer'),

  body('floor_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Floor ID must be a positive integer'),

  body('booking_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('booking_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),

  body('number_of_guests')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of guests must be between 1 and 50'),

  body('booking_status_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Booking status ID must be a positive integer'),

  body('duration_hours')
    .optional()
    .isFloat({ min: 0.5, max: 12 })
    .withMessage('Duration must be between 0.5 and 12 hours'),

  body('special_requests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
];

// Validation for getting table bookings query parameters
const validateGetTableBookings = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),

  query('status')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Status must be a valid string')
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
  validateCreateTableBooking,
  validateUpdateTableBooking,
  validateGetTableBookings,
  handleValidationErrors
};
