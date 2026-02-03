const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createTaxSetup,
  updateTaxSetup,
  getTaxSetupById,
  getAllTaxSetups,
  getTaxSetupByAuth,
  deleteTaxSetup
} = require('../../controllers/Tax_setup.Controller');

// Create tax setup (with auth)
router.post('/create', auth, createTaxSetup);

// Update tax setup (with auth)
router.put('/update', auth, updateTaxSetup);

// Get tax setup by ID (with auth)
router.get('/getbyid/:id', auth, getTaxSetupById);

// Get all tax setups (with auth)
router.get('/getall', auth, getAllTaxSetups);

// Get tax setup by auth (with auth)
router.get('/getbyauth', auth, getTaxSetupByAuth);

// Delete tax setup (with auth)
router.delete('/delete/:id', auth, deleteTaxSetup);

module.exports = router;
