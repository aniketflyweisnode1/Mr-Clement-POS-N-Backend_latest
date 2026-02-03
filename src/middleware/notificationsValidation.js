const { body, validationResult } = require('express-validator');

const validateCreateNotifications = [
  body('Notifications')
    .trim()
    .notEmpty()
    .withMessage('Notification text is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Notification text must be between 1 and 1000 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateNotifications = [
  body('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isNumeric()
    .withMessage('Invalid Notification ID'),
  body('Notifications')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Notification text cannot be empty')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Notification text must be between 1 and 1000 characters'),
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
  validateCreateNotifications,
  validateUpdateNotifications,
  handleValidationErrors
};
