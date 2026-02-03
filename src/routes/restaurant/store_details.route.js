const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createStoreDetails,
  updateStoreDetails,
  getStoreDetailsById,
  getAllStoreDetails,
  getStoreDetailsByAuth,
  deleteStoreDetails
} = require('../../controllers/Store_details.Controller');

// Create store details (with auth)
router.post('/create', auth, createStoreDetails);

// Update store details (with auth)
router.put('/update', auth, updateStoreDetails);

// Get store details by ID (with auth)
router.get('/getbyid/:id', auth, getStoreDetailsById);

// Get all store details (with auth)
router.get('/getall', auth, getAllStoreDetails);

// Get store details by auth (with auth)
router.get('/getbyauth', auth, getStoreDetailsByAuth);

// Delete store details (with auth)
router.delete('/delete/:id', auth, deleteStoreDetails);

module.exports = router;
