const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreatePermissionsTypeMapWithEmployee,
  validateUpdatePermissionsTypeMapWithEmployee,
  handleValidationErrors
} = require('../../middleware/permissionsTypeMapWithEmployeeValidation');
const {
  createPermissionsTypeMapWithEmployee,
  updatePermissionsTypeMapWithEmployee,
  getPermissionsTypeMapWithEmployeeById,
  getAllPermissionsTypeMapWithEmployee,
  getPermissionsTypeMapWithEmployeeByAuth,
  deletePermissionsTypeMapWithEmployee
} = require('../../controllers/Permissions_type_Map_with_Employee.Controller');

// Create permissions type map with employee (with auth)
router.post('/create', auth, validateCreatePermissionsTypeMapWithEmployee, handleValidationErrors, createPermissionsTypeMapWithEmployee);

// Update permissions type map with employee (with auth)
router.put('/update', auth, validateUpdatePermissionsTypeMapWithEmployee, handleValidationErrors, updatePermissionsTypeMapWithEmployee);

// Get permissions type map with employee by ID (with auth)
router.get('/getbyid/:id', auth, getPermissionsTypeMapWithEmployeeById);

// Get all permissions type map with employee (with auth)
router.get('/getall', auth, getAllPermissionsTypeMapWithEmployee);

// Get permissions type map with employee by authenticated user (with auth)
router.get('/getbyauth', auth, getPermissionsTypeMapWithEmployeeByAuth);

// Delete permissions type map with employee (with auth)
router.delete('/delete/:id', auth, deletePermissionsTypeMapWithEmployee);

module.exports = router;
