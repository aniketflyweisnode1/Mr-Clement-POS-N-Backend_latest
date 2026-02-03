const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createPaymentOption,
  updatePaymentOption,
  getPaymentOptionById,
  getAllPaymentOptions,
  deletePaymentOption,
  getPaymentOptionsByAuth
} = require('../../controllers/Payment_Options.Controller');

// Create Payment Option (with auth)
router.post('/create', auth, createPaymentOption);

// Get Payment Options by Authenticated User (must come before /:id)
router.get('/auth/my-options', auth, getPaymentOptionsByAuth);

// Get All Payment Options (must come before /:id)
router.get('/all', getAllPaymentOptions);

// Get Payment Option by ID (with auth)
router.get('/payment-option-by/:id', auth, getPaymentOptionById);

// Update Payment Option (with auth)
router.put('/update/:id', auth, updatePaymentOption);

// Delete Payment Option
router.delete('/:id', auth, deletePaymentOption);

module.exports = router;

