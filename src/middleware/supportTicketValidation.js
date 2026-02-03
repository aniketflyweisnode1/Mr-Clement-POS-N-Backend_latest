const { body, validationResult } = require('express-validator');

// Validation rules for creating support ticket
const validateCreateSupportTicket = [
  body('support_ticket_type_id')
    .notEmpty()
    .withMessage('Support ticket type ID is required')
    .isNumeric()
    .withMessage('Support ticket type ID must be a number'),
  body('question')
    .notEmpty()
    .withMessage('Question is required')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters'),
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isNumeric()
    .withMessage('Customer ID must be a number'),
  body('Ticket_status')
    .optional()
    .isIn(['Pending', 'Open', 'Process', 'Solve', 'Close'])
    .withMessage('Ticket status must be one of: Pending, Open, Process, Solve, Close'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating support ticket
const validateUpdateSupportTicket = [
  body('id')
    .notEmpty()
    .withMessage('Support ticket ID is required')
    .isNumeric()
    .withMessage('Support ticket ID must be a number'),
  body('support_ticket_type_id')
    .optional()
    .isNumeric()
    .withMessage('Support ticket type ID must be a number'),
  body('question')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters'),
  body('customer_id')
    .optional()
    .isNumeric()
    .withMessage('Customer ID must be a number'),
  body('Ticket_status')
    .optional()
    .isIn(['Pending', 'Open', 'Process', 'Solve', 'Close'])
    .withMessage('Ticket status must be one of: Pending, Open, Process, Solve, Close'),
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
  validateCreateSupportTicket,
  validateUpdateSupportTicket,
  handleValidationErrors
};
