const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createAdminPOSMyDevicesSoldInRestaurant,
  updateAdminPOSMyDevicesSoldInRestaurant,
  getAdminPOSMyDevicesSoldInRestaurantById,
  getAllAdminPOSMyDevicesSoldInRestaurant,
  getAdminPOSMyDevicesSoldInRestaurantByAuth,
  deleteAdminPOSMyDevicesSoldInRestaurant,
  getPOSHardwareDevices_Dashboard,
  PosDeviceSection
} = require('../../controllers/Admin_POS_MyDevices_sold_in_restaurant.Controller');

// Create Admin POS MyDevices Sold in Restaurant (with auth)
router.post('/create', auth, createAdminPOSMyDevicesSoldInRestaurant);

// Update Admin POS MyDevices Sold in Restaurant (with auth)
router.put('/update', auth, updateAdminPOSMyDevicesSoldInRestaurant);

// Get Admin POS MyDevices Sold in Restaurant by ID (with auth)
router.get('/getbyid/:id', auth, getAdminPOSMyDevicesSoldInRestaurantById);

// Get all Admin POS MyDevices Solds in Restaurant (with auth)
router.get('/getall', auth, getAllAdminPOSMyDevicesSoldInRestaurant);

// Get Admin POS MyDevices Sold in Restaurant by auth (with auth)
router.get('/getbyauth', auth, getAdminPOSMyDevicesSoldInRestaurantByAuth);

// Delete Admin POS MyDevices Sold in Restaurant (with auth)
router.delete('/delete/:id', auth, deleteAdminPOSMyDevicesSoldInRestaurant);

// Get POS Hardware Devices Dashboard (with auth)
router.get('/POSHardwareDevices_Dashboard', auth, getPOSHardwareDevices_Dashboard);

// PosDeviceSection API (with auth)
router.get('/PosDeviceSection', auth, PosDeviceSection);

module.exports = router;

