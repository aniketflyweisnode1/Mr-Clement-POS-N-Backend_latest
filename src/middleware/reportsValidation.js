const { body, validationResult } = require('express-validator');

// Validation middleware for reports
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Since reports are GET endpoints with no body data, we don't need specific validations
// But we can add date range validation if needed in the future
const validateDateRange = [
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateDateRange
};
