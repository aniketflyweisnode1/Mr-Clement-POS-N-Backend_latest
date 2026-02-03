const { body, validationResult } = require('express-validator');

const validateCreateResponsibility = [
  body('Responsibility_name')
    .trim()
    .notEmpty()
    .withMessage('Responsibility name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Responsibility name must be between 2 and 100 characters')
];

const validateUpdateResponsibility = [
  body('id')
    .notEmpty()
    .withMessage('Responsibility ID is required')
    .isNumeric()
    .withMessage('Invalid Responsibility ID'),
  body('Responsibility_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Responsibility name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Responsibility name must be between 2 and 100 characters'),
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
  validateCreateResponsibility,
  validateUpdateResponsibility,
  handleValidationErrors
};
