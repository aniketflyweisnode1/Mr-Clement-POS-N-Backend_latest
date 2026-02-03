const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createBusinessSettings,
  updateBusinessSettings,
  getBusinessSettingsById,
  getAllBusinessSettings,
  getBusinessSettingsByAuth
} = require('../../controllers/Business_settings.Controller');

// Create business settings (with auth)
router.post('/create', auth, createBusinessSettings);

// Update business settings (with auth)
router.put('/update', auth, updateBusinessSettings);

// Get business settings by ID (with auth)
router.get('/getbyid/:id', auth, getBusinessSettingsById);

// Get all business settings (with auth)
router.get('/getall', auth, getAllBusinessSettings);

// Get business settings by auth (with auth)
router.get('/getbyauth', auth, getBusinessSettingsByAuth);

module.exports = router;
