const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  softDeleteUser,
  activateUser,
  getUserByAuth,
  getEmployeesByRestaurantId,
  getEmployeesByClientId,
  getEmployeeDetailsById,
  getUsersByRoleId,
  logout,
  createEmployee,
  changePasswordRestaurantByAdmin,

} = require('../../controllers/User.Controller.js');
const {
  loginUser,
  loginRestaurant,
  loginEmployee,
  loginAdmin,
  changePassword,
  registerRestaurant
} = require('../../controllers/Auth.Controller.js');
const {
  sendForgetPasswordOTPController,
  verifyOTPAndResetPassword,
  verifyOTP,
  resendOTP
} = require('../../controllers/OTP.Controller.js');
const {
  validateCreateUser,
  validateUpdateUser, 
  validateCreateEmployee,
  handleValidationErrors
} = require('../../middleware/userValidation.js');
const {
  validateLogin,
  validateAdminLogin,
  validateChangePassword,
  validateRestaurantRegistration
} = require('../../middleware/authValidation.js');
const {
  validateSendOTP,
  validateVerifyOTP,
  validateVerifyOTPAndResetPassword
} = require('../../middleware/otpValidation.js');
const { auth } = require('../../middleware/authMiddleware.js');

// Import JSON file routes
const jsonFileRoutes = require('./jsonFile.route.js');

// Create a new user
router.post('/create', validateCreateUser, handleValidationErrors, createUser);

// Restaurant Registration (Public - No Auth Required)
router.post('/register-restaurant', validateRestaurantRegistration, handleValidationErrors, registerRestaurant);

// Get all users with pagination and search
router.get('/getall', auth, getAllUsers);

// Get user by ID
router.get('/getbyid/:id', auth, getUserById);

// Get user by auth (current logged in user)
router.get('/getbyauth', auth, getUserByAuth);

// Get users by role ID
router.get('/getbyroleid/:roleId', getUsersByRoleId);

// Update user
router.put('/update', auth, validateUpdateUser, handleValidationErrors, updateUser);

// Delete user (hard delete)
router.delete('/delete/:id', auth, deleteUser);

// Soft delete user (deactivate)
router.patch('/deactivate/:id', auth, softDeleteUser);

// Activate user
router.patch('/activate/:id', auth, activateUser);


router.post('/createEmployee', auth, validateCreateEmployee, handleValidationErrors, createEmployee);

// Get employees by restaurant ID
router.get('/employees/:restaurantId', auth, getEmployeesByRestaurantId);

// Get employees by client ID - categorized by role with details, timing, and performance
router.get('/employees/client/:clientId', auth, getEmployeesByClientId);

// Get employee details by ID with Responsibility and Work Details
router.get('/employeedetailsbyid/:id', auth, getEmployeeDetailsById);

// Authentication routes
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/login-restaurant', validateAdminLogin, handleValidationErrors, loginRestaurant);
router.post('/login-employee', validateAdminLogin, handleValidationErrors, loginEmployee);
router.post('/login-admin', validateAdminLogin, handleValidationErrors, loginAdmin);
router.post('/logout', auth, logout);
router.put('/change-password', auth, validateChangePassword, handleValidationErrors, changePassword);

// Forget Password routes 29/08/2025
router.post('/forget-password/send-otp', validateSendOTP, handleValidationErrors, sendForgetPasswordOTPController);
router.post('/forget-password/verify-otp', validateVerifyOTP, handleValidationErrors, verifyOTP);
router.post(
  '/forget-password/resend-otp',
  validateSendOTP,
  handleValidationErrors,
  resendOTP
);
// Change Password Restaurant By Admin (with auth)
router.put('/changePasswordRestaurantByAdmin', auth, changePasswordRestaurantByAdmin);

// JSON File routes
// router.use('/json-files', jsonFileRoutes);

module.exports = router;
