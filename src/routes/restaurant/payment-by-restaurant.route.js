const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createPaymentByRestaurant,
  updatePaymentByRestaurant,
  getPaymentByRestaurantById,
  getAllPaymentsByRestaurant,
  deletePaymentByRestaurant,
  getPaymentsByPaymentOptions,
  getPaymentsByAuth
} = require('../../controllers/PaymentByRestaurant.Controller');

// Create Payment by Restaurant (with auth)
router.post('/create-payment', auth, createPaymentByRestaurant);

// Get Payments by Authenticated User (must come before /:id)
router.get('/auth/my-payments', auth, getPaymentsByAuth);

// Get Payments by Payment Options (must come before /:id)
router.get('/payment-options/:paymentOptionsId', auth, getPaymentsByPaymentOptions);

// Get All Payments by Restaurant (must come before /:id)
router.get('/all-payments', getAllPaymentsByRestaurant);

// Get Payment by Restaurant by ID (with auth)
router.get('/payment-by-id/:id', auth, getPaymentByRestaurantById);

// Update Payment by Restaurant (with auth)
router.put('/update-payment/:id', auth, updatePaymentByRestaurant);

// Delete Payment by Restaurant
router.delete('/delete-payment/:id', auth, deletePaymentByRestaurant);

module.exports = router;

