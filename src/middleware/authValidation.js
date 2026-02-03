const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember Me must be a boolean value')
];

// Validation for Restaurant/Employee/Admin login using adminId
const validateAdminLogin = [
  body('adminId')
    .trim()
    .notEmpty()
    .withMessage('Admin ID is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember Me must be a boolean value')
];



const validateChangePassword = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateRestaurantRegistration = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember Me must be a boolean value')
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
  validateLogin,
  validateAdminLogin,
  validateChangePassword,
  validateRestaurantRegistration,
  handleValidationErrors
};
