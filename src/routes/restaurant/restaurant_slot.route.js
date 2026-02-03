const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createRestaurantSlot,
  updateRestaurantSlot,
  getRestaurantSlotById,
  getAllRestaurantSlots,
  getRestaurantSlotByAuth,
  deleteRestaurantSlot
} = require('../../controllers/Restaurant_slot.Controller');

// Create Restaurant Slot (with auth)
router.post('/create', auth, createRestaurantSlot);

// Update Restaurant Slot (with auth)
router.put('/update', auth, updateRestaurantSlot);

// Get Restaurant Slot by ID (with auth)
router.get('/getbyid/:id', auth, getRestaurantSlotById);

// Get all Restaurant Slots (with auth)
router.get('/getall', auth, getAllRestaurantSlots);

// Get Restaurant Slot by auth (with auth)
router.get('/getbyauth', auth, getRestaurantSlotByAuth);

// Delete Restaurant Slot (with auth)
router.delete('/delete/:id', auth, deleteRestaurantSlot);

module.exports = router;

