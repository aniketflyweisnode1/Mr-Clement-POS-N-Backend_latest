const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createNewSletter,
  updateNewSletter,
  getNewSletterById,
  getAllNewSletters,
  getNewSletterByAuth,
  deleteNewSletter
} = require('../../controllers/NewSletter.Controller');

// Create NewSletter (without auth)
router.post('/create', createNewSletter);

// Update NewSletter (with auth)
router.put('/update', auth, updateNewSletter);

// Get NewSletter by ID (with auth)
router.get('/getbyid/:id', auth, getNewSletterById);

// Get all NewSletters (with auth)
router.get('/getall', auth, getAllNewSletters);

// Get NewSletter by auth (with auth)
router.get('/getbyauth', auth, getNewSletterByAuth);

// Delete NewSletter (with auth)
router.delete('/delete/:id', auth, deleteNewSletter);

module.exports = router;

