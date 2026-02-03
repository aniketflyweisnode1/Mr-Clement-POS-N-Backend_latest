const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateMyDevices,
  validateUpdateMyDevices,
  handleValidationErrors
} = require('../../middleware/myDevicesValidation');
const {
  createMyDevices,
  updateMyDevices,
  getMyDevicesById,
  getAllMyDevices,
  getMyDevicesByAuth,
  deleteMyDevices
} = require('../../controllers/MyDevices.Controller');

// Create MyDevices (with auth)
router.post('/create', auth, validateCreateMyDevices, handleValidationErrors, createMyDevices);

// Update MyDevices (with auth)
router.put('/update', auth, validateUpdateMyDevices, handleValidationErrors, updateMyDevices);

// Get MyDevices by ID (with auth)
router.get('/getbyid/:id', auth, getMyDevicesById);

// Get all MyDevices (with auth)
router.get('/getall', auth, getAllMyDevices);

// Get MyDevices by authenticated user (with auth)
router.get('/getbyauth', auth, getMyDevicesByAuth);

// Delete MyDevices (with auth)
router.delete('/delete/:id', auth, deleteMyDevices);

module.exports = router;
