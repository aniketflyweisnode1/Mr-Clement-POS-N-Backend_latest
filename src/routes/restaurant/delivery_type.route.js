const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateDeliveryType,
  validateUpdateDeliveryType,
  handleValidationErrors
} = require('../../middleware/deliveryTypeValidation');
const {
  createDeliveryType,
  updateDeliveryType,
  getDeliveryTypeById,
  getAllDeliveryTypes,
  getDeliveryTypesByAuth,
  deleteDeliveryType
} = require('../../controllers/Delivery_type.Controller');

// Create delivery type (with auth)
router.post('/create', auth, validateCreateDeliveryType, handleValidationErrors, createDeliveryType);

// Update delivery type (with auth)
router.put('/update', auth, validateUpdateDeliveryType, handleValidationErrors, updateDeliveryType);

// Get delivery type by ID (with auth)
router.get('/getbyid/:id', auth, getDeliveryTypeById);

// Get all delivery types (with auth)
router.get('/getall', auth, getAllDeliveryTypes);

// Get delivery types by authenticated user (with auth)
router.get('/getbyauth', auth, getDeliveryTypesByAuth);

// Delete delivery type (with auth)
router.delete('/delete/:id', auth, deleteDeliveryType);

module.exports = router;
