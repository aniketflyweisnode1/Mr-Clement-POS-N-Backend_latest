const { body, validationResult } = require('express-validator');

// Validation rules for creating support ticket reply
const validateCreateSupportTicketReply = [
  body('support_ticket_id')
    .notEmpty()
    .withMessage('Support ticket ID is required')
    .isNumeric()
    .withMessage('Support ticket ID must be a number'),
  body('reply')
    .notEmpty()
    .withMessage('Reply is required')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Reply must be between 1 and 2000 characters'),
  body('employee_id')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isNumeric()
    .withMessage('Employee ID must be a number'),
  body('Ticket_status')
    .optional()
    .isIn(['Pending', 'Open', 'Process', 'Solve', 'Close'])
    .withMessage('Ticket status must be one of: Pending, Open, Process, Solve, Close'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating support ticket reply
const validateUpdateSupportTicketReply = [
  body('id')
    .notEmpty()
    .withMessage('Support ticket reply ID is required')
    .isNumeric()
    .withMessage('Support ticket reply ID must be a number'),
  body('support_ticket_id')
    .optional()
    .isNumeric()
    .withMessage('Support ticket ID must be a number'),
  body('reply')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Reply must be between 1 and 2000 characters'),
  body('employee_id')
    .optional()
    .isNumeric()
    .withMessage('Employee ID must be a number'),
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
  validateCreateSupportTicketReply,
  validateUpdateSupportTicketReply,
  handleValidationErrors
};
