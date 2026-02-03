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

// Create payment option (with auth)
router.post('/create', auth, createPaymentOption);

// Update payment option (with auth)
router.put('/update/:id', auth, updatePaymentOption);

// Get payment option by ID (with auth)
router.get('/getbyid/:id', auth, getPaymentOptionById);

// Get all payment options (with auth)
router.get('/getall', auth, getAllPaymentOptions);

// Get payment options by authenticated user (with auth)
router.get('/getbyauth', auth, getPaymentOptionsByAuth);

// Delete payment option (with auth)
router.delete('/delete/:id', auth, deletePaymentOption);

module.exports = router;
