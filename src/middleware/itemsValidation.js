const { body, validationResult } = require('express-validator');

// Updated validation as per UI
const validateCreateItems = [
  // New UI fields
  body('Title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('Description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('image')
    .optional()
    .trim()
    .isString()
    .withMessage('Image must be a string'),
  body('Net_Price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Net Price must be a positive number'),
  body('Price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('Items_types_id')
    .notEmpty()
    .withMessage('Category (Items_types_id) is required')
    .isNumeric()
    .withMessage('Invalid Category ID'),
  body('Tax_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Invalid Tax ID'),
  body('Variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  body('Variants.*')
    .optional()
    .isNumeric()
    .withMessage('Variant ID must be a number'),
  body('Addons')
    .optional()
    .isArray()
    .withMessage('Addons must be an array'),
  body('Addons.*')
    .optional()
    .isNumeric()
    .withMessage('Addon ID must be a number'),
  // Legacy fields (optional)
  body('Emozi')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('item-name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('item-code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Item code must be between 2 and 20 characters'),
  body('item-size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Item size must not exceed 50 characters'),
  body('item-price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Item price must be a positive number'),
  body('item-quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Item quantity must be a non-negative integer'),
  body('item-stock-quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Item stock quantity must be a non-negative integer'),
  body('Details')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Details must not exceed 1000 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateItems = [
  body('id')
    .notEmpty()
    .withMessage('Item ID is required')
    .isNumeric()
    .withMessage('Invalid Item ID'),
  // New UI fields
  body('Title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('Description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('image')
    .optional()
    .trim()
    .isString()
    .withMessage('Image must be a string'),
  body('Net_Price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Net Price must be a positive number'),
  body('Price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('Items_types_id')
    .optional()
    .isNumeric()
    .withMessage('Invalid Category ID'),
  body('Tax_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Invalid Tax ID'),
  body('Variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  body('Addons')
    .optional()
    .isArray()
    .withMessage('Addons must be an array'),
  // Legacy fields
  body('Emozi')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('item-name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('item-code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Item code must be between 2 and 20 characters'),
  body('item-size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Item size must not exceed 50 characters'),
  body('item-price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Item price must be a positive number'),
  body('item-quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Item quantity must be a non-negative integer'),
  body('item-stock-quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Item stock quantity must be a non-negative integer'),
  body('Details')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Details must not exceed 1000 characters'),
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
  validateCreateItems,
  validateUpdateItems,
  handleValidationErrors
};
