const { body, validationResult } = require('express-validator');

// Validation rules for creating invoice
const validateCreateInvoice = [
  body('Token_id')
    .optional()
    .isNumeric()
    .withMessage('Token ID must be a number'),
  body('order_id')
    .optional()
    .isNumeric()
    .withMessage('Order ID must be a number'),
  body('Delivery_type_id')
    .optional()
    .isNumeric()
    .withMessage('Delivery type ID must be a number'),
  body('Customer_type')
    .optional()
    .isNumeric()
    .withMessage('Customer type must be a number'),
  body('Table_id')
    .optional()
    .isNumeric()
    .withMessage('Table ID must be a number'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating invoice
const validateUpdateInvoice = [
  body('id')
    .notEmpty()
    .withMessage('Invoice ID is required')
    .isNumeric()
    .withMessage('Invoice ID must be a number'),
  body('Token_id')
    .optional()
    .isNumeric()
    .withMessage('Token ID must be a number'),
  body('order_id')
    .optional()
    .isNumeric()
    .withMessage('Order ID must be a number'),
  body('Delivery_type_id')
    .optional()
    .isNumeric()
    .withMessage('Delivery type ID must be a number'),
  body('Customer_type')
    .optional()
    .isNumeric()
    .withMessage('Customer type must be a number'),
  body('Table_id')
    .optional()
    .isNumeric()
    .withMessage('Table ID must be a number'),
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
  validateCreateInvoice,
  validateUpdateInvoice,
  handleValidationErrors
};
