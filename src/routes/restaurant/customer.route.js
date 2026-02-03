const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateCustomer,
  validateUpdateCustomer,
  handleValidationErrors
} = require('../../middleware/customerValidation');
const {
  createCustomer,
  updateCustomer,
  getCustomerById,
  getAllCustomers,
  getCustomerByAuth,
  deleteCustomer
} = require('../../controllers/Customer.Controller');

// Create customer (with auth)
router.post('/create', auth, validateCreateCustomer, handleValidationErrors, createCustomer);

// Update customer (with auth)
router.put('/update', auth, validateUpdateCustomer, handleValidationErrors, updateCustomer);

// Get customer by ID (with auth)
router.get('/getbyid/:id', auth, getCustomerById);

// Get all customers (with auth)
router.get('/getall', auth, getAllCustomers);

// Get customer by auth (with auth)
router.get('/getbyauth', auth, getCustomerByAuth);

// Delete customer (with auth)
router.delete('/delete/:id', auth, deleteCustomer);

module.exports = router;
