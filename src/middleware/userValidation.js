const { body, validationResult } = require('express-validator');

const validateCreateUser = [
  body('Name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('Responsibility_id')
    .notEmpty()
    .withMessage('Responsibility is required')
    .isNumeric()
    .withMessage('Invalid Responsibility ID'),
  body('Role_id')
    .notEmpty()
    .withMessage('Role is required')
    .isNumeric()
    .withMessage('Invalid Role ID'),
  body('Language_id')
    .notEmpty()
    .withMessage('Language is required')
    .isNumeric()
    .withMessage('Invalid Language ID'),
  body('Country_id')
    .notEmpty()
    .withMessage('Country is required')
    .isNumeric()
    .withMessage('Invalid Country ID'),
  body('State_id')
    .notEmpty()
    .withMessage('State is required')
    .isNumeric()
    .withMessage('Invalid State ID'),
  body('City_id')
    .notEmpty()
    .withMessage('City is required')
    .isNumeric()
    .withMessage('Invalid City ID'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('user_image')
    .optional()
    .isString()
    .withMessage('User image must be a string'),
  body('OnboardingDate')
    .optional()
    .isISO8601()
    .withMessage('Onboarding date must be a valid date'),
  body('yearsWithus')
    .optional()
    .isNumeric()
    .withMessage('Years with us must be a number'),
  body('isLoginPermission')
    .optional()
    .isBoolean()
    .withMessage('Login permission must be a boolean value'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateUser = [
  body('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isNumeric()
    .withMessage('Invalid User ID'),
  body('Name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('last_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('Responsibility_id')
    .optional()
    .notEmpty()
    .withMessage('Responsibility cannot be empty')
    .isNumeric()
    .withMessage('Invalid Responsibility ID'),
  body('Role_id')
    .optional()
    .notEmpty()
    .withMessage('Role cannot be empty')
    .isNumeric()
    .withMessage('Invalid Role ID'),
  body('Language_id')
    .optional()
    .notEmpty()
    .withMessage('Language cannot be empty')
    .isNumeric()
    .withMessage('Invalid Language ID'),
  body('Country_id')
    .optional()
    .notEmpty()
    .withMessage('Country cannot be empty')
    .isNumeric()
    .withMessage('Invalid Country ID'),
  body('State_id')
    .optional()
    .notEmpty()
    .withMessage('State cannot be empty')
    .isNumeric()
    .withMessage('Invalid State ID'),
  body('City_id')
    .optional()
    .notEmpty()
    .withMessage('City cannot be empty')
    .isNumeric()
    .withMessage('Invalid City ID'),
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('password')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('user_image')
    .optional()
    .isString()
    .withMessage('User image must be a string'),
  body('OnboardingDate')
    .optional()
    .isISO8601()
    .withMessage('Onboarding date must be a valid date'),
  body('yearsWithus')
    .optional()
    .isNumeric()
    .withMessage('Years with us must be a number'),
  body('isLoginPermission')
    .optional()
    .isBoolean()
    .withMessage('Login permission must be a boolean value'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateCreateEmployee = validateCreateUser;

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
  validateCreateUser,
  validateCreateEmployee,
  validateUpdateUser,
  handleValidationErrors
};
