const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createPosSpealist,
  updatePosSpealist,
  getPosSpealistById,
  getAllPosSpealists,
  getPosSpealistByAuth,
  deletePosSpealist
} = require('../../controllers/PosSpealist.Controller');

// Create PosSpealist (without auth)
router.post('/create', createPosSpealist);

// Update PosSpealist (with auth)
router.put('/update', auth, updatePosSpealist);

// Get PosSpealist by ID (with auth)
router.get('/getbyid/:id', auth, getPosSpealistById);

// Get all PosSpealists (with auth)
router.get('/getall', auth, getAllPosSpealists);

// Get PosSpealist by auth (with auth)
router.get('/getbyauth', auth, getPosSpealistByAuth);

// Delete PosSpealist (with auth)
router.delete('/delete/:id', auth, deletePosSpealist);

module.exports = router;

