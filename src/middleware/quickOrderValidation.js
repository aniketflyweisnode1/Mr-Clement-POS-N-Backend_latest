const { body, validationResult } = require('express-validator');

const validateCreateQuickOrder = [
  body('client_mobile_no')
    .trim()
    .notEmpty()
    .withMessage('Client mobile number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid mobile number format'),
  body('get_order_Employee_id')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),
  body('item_ids')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('item_ids.*.item_id')
    .isNumeric()
    .withMessage('Item ID must be a number'),
  body('item_ids.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('Floor_id')
    .notEmpty()
    .withMessage('Floor ID is required')
    .isNumeric()
    .withMessage('Invalid Floor ID'),
  body('Table_id')
    .notEmpty()
    .withMessage('Table ID is required')
    .isNumeric()
    .withMessage('Invalid Table ID'),
  body('AddOnTable_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Invalid AddOn Table ID'),
  body('Persons_Count')
    .notEmpty()
    .withMessage('Persons count is required')
    .isInt({ min: 1 })
    .withMessage('Persons count must be at least 1'),
  body('Table_Booking_Status_id')
    .notEmpty()
    .withMessage('Table booking status is required')
    .isNumeric()
    .withMessage('Invalid Table booking status ID'),
  body('Wating_Time')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Waiting time must be a non-negative number'),
  body('Tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a non-negative number'),
  body('SubTotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a non-negative number'),
  body('Total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total must be a non-negative number'),
  body('Order_Status')
    .optional()
    .isIn(['Preparing', 'Served', 'Cancelled'])
    .withMessage('Invalid order status'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateQuickOrder = [
  body('id')
    .notEmpty()
    .withMessage('Quick Order ID is required')
    .isNumeric()
    .withMessage('Invalid Quick Order ID'),
  body('client_mobile_no')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Client mobile number cannot be empty')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid mobile number format'),
  body('get_order_Employee_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Employee ID cannot be empty'),
  body('item_ids')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('item_ids.*.item_id')
    .optional()
    .isNumeric()
    .withMessage('Item ID must be a number'),
  body('item_ids.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('Floor_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Floor ID'),
  body('Table_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Table ID'),
  body('AddOnTable_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Invalid AddOn Table ID'),
  body('Persons_Count')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Persons count must be at least 1'),
  body('Table_Booking_Status_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Table booking status ID'),
  body('Wating_Time')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Waiting time must be a non-negative number'),
  body('Tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a non-negative number'),
  body('SubTotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a non-negative number'),
  body('Total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total must be a non-negative number'),
  body('Order_Status')
    .optional()
    .isIn(['Preparing', 'Served', 'Cancelled'])
    .withMessage('Invalid order status'),
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
  validateCreateQuickOrder,
  validateUpdateQuickOrder,
  handleValidationErrors
};
