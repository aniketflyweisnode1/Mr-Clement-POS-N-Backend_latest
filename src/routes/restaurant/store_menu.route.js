const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createStoreMenu,
  updateStoreMenu,
  getStoreMenuById,
  getAllStoreMenus,
  getStoreMenuByAuth,
  deleteStoreMenu
} = require('../../controllers/Store_menu.Controller');

// Create store menu (with auth)
router.post('/create', auth, createStoreMenu);

// Update store menu (with auth)
router.put('/update', auth, updateStoreMenu);

// Get store menu by ID (with auth)
router.get('/getbyid/:id', auth, getStoreMenuById);

// Get all store menus (with auth)
router.get('/getall', auth, getAllStoreMenus);

// Get store menus by authenticated user (with auth)
router.get('/getbyauth', auth, getStoreMenuByAuth);

// Delete store menu (with auth)
router.delete('/delete/:id', auth, deleteStoreMenu);

module.exports = router;
