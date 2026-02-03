const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateKitchen, validateUpdateKitchen, handleValidationErrors } = require('../../middleware/kitchenValidation');
const { 
  createKitchen, 
  updateKitchen, 
  getKitchenById, 
  getAllKitchens,
  getKitchenByAuth,
  deleteKitchen
} = require('../../controllers/Kitchen.Controller');

// Kitchen routes
router.post('/create', auth, validateCreateKitchen, handleValidationErrors, createKitchen);
router.put('/update', auth, validateUpdateKitchen, handleValidationErrors, updateKitchen);
router.get('/get/:id', auth, getKitchenById);
router.get('/getall', getAllKitchens);
router.get('/getbyauth', auth, getKitchenByAuth);
router.delete('/delete/:id', auth, deleteKitchen);

module.exports = router;
