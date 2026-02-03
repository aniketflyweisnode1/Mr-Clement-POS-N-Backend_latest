const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createPrintSettings,
  updatePrintSettings,
  getPrintSettingsById,
  getAllPrintSettings,
  getPrintSettingsByAuth,
  deletePrintSettings
} = require('../../controllers/Print_Settings.Controller');

// Create print settings (with auth)
router.post('/create', auth, createPrintSettings);

// Update print settings (with auth)
router.put('/update', auth, updatePrintSettings);

// Get print settings by ID (with auth)
router.get('/getbyid/:id', auth, getPrintSettingsById);

// Get all print settings (with auth)
router.get('/getall', auth, getAllPrintSettings);

// Get print settings by authenticated user (with auth)
router.get('/getbyauth', auth, getPrintSettingsByAuth);

// Delete print settings (with auth)
router.delete('/delete/:id', auth, deletePrintSettings);

module.exports = router;
