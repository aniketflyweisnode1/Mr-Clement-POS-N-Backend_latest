const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createMenuMapItems,
  updateAllMenuMapItems,
  updateMenuMapItems,
  getMenuMapItemsById,
  getAllMenuMapItems,
  getMenuMapItemsByAuth,
  deleteMenuMapItems
} = require('../../controllers/Menu_map_Items.Controller');

// Create menu map items (with auth)
router.post('/create', auth, createMenuMapItems);

// Update all menu map items (with auth)
router.put('/updateall', auth, updateAllMenuMapItems);

// Update menu map items (with auth)
router.put('/update', auth, updateMenuMapItems);

// Get menu map items by ID (with auth)
router.get('/getbyid/:id', auth, getMenuMapItemsById);

// Get all menu map items (with auth)
router.get('/getall', auth, getAllMenuMapItems);

// Get menu map items by authenticated user (with auth)
router.get('/getbyauth', auth, getMenuMapItemsByAuth);

// Delete menu map items (with auth)
router.delete('/delete/:id', auth, deleteMenuMapItems);

module.exports = router;
