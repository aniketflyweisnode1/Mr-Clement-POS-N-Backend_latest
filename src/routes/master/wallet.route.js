const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createWallet,
  updateAllWallets,
  updateWallet,
  getWalletById,
  getAllWallets,
  getWalletByAuth
} = require('../../controllers/wallet.Controller');

// Create wallet (with auth)
router.post('/create', auth, createWallet);

// Update all wallets (with auth)
router.post('/updateall', auth, updateAllWallets);

// Update wallet (with auth)
router.put('/update', auth, updateWallet);

// Get wallet by ID (with auth)
router.get('/getbyid/:id', auth, getWalletById);

// Get all wallets (with auth)
router.get('/getall', auth, getAllWallets);

// Get wallet by auth (with auth)
router.get('/getbyauth', auth, getWalletByAuth);

module.exports = router;
