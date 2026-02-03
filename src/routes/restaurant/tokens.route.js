const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateToken,
  validateUpdateToken,
  handleValidationErrors
} = require('../../middleware/tokensValidation');
const {
  createToken,
  updateToken,
  getTokenById,
  getAllTokens,
  getTokensByAuth,
  deleteToken
} = require('../../controllers/Tokens.Controller');

// Create token (with auth)
router.post('/create', auth, validateCreateToken, handleValidationErrors, createToken);

// Update token (with auth)
router.put('/update', auth, validateUpdateToken, handleValidationErrors, updateToken);

// Get token by ID (with auth)
router.get('/getbyid/:id', auth, getTokenById);

// Get all tokens (with auth)
router.get('/getall', auth, getAllTokens);

// Get tokens by authenticated user (with auth)
router.get('/getbyauth', auth, getTokensByAuth);

// Delete token (with auth)
router.delete('/delete/:id', auth, deleteToken);

module.exports = router;
