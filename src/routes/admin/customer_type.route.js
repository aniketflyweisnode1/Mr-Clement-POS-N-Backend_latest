const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateCustomerType,
  validateUpdateCustomerType,
  handleValidationErrors
} = require('../../middleware/customerTypeValidation');
const {
  createCustomerType,
  updateCustomerType,
  getCustomerTypeById,
  getAllCustomerTypes,
  getCustomerTypeByAuth,
  deleteCustomerType
} = require('../../controllers/Customer_type.Controller');

console.log("customer_type_route");
// Create customer type (with auth)
router.post('/create', auth, validateCreateCustomerType, handleValidationErrors, createCustomerType);

// Update customer type (with auth)
router.put('/update', auth, validateUpdateCustomerType, handleValidationErrors, updateCustomerType);

// Get customer type by ID (with auth)
router.get('/getbyid/:id', auth, getCustomerTypeById);

// Get all customer types (with auth)
router.get('/getall', auth, getAllCustomerTypes);

// Get customer type by auth (with auth)
router.get('/getbyauth', auth, getCustomerTypeByAuth);

// Delete customer type (with auth)
router.delete('/delete/:id', auth, deleteCustomerType);

module.exports = router;
