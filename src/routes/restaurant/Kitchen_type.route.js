const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateKitchenType, validateUpdateKitchenType, handleValidationErrors } = require('../../middleware/kitchenTypeValidation');
const { 
  createKitchenType, 
  updateKitchenType, 
  getKitchenTypeById, 
  getAllKitchenTypes,
  getKitchenTypeByAuth,
  deleteKitchenType
} = require('../../controllers/Kitchen_type.Controller');

// Kitchen type routes
router.post('/create', auth, validateCreateKitchenType, handleValidationErrors, createKitchenType);
router.put('/update', auth, validateUpdateKitchenType, handleValidationErrors, updateKitchenType);
router.get('/get/:id', auth, getKitchenTypeById);
router.get('/getall', getAllKitchenTypes);
router.get('/getbyauth', auth, getKitchenTypeByAuth);
router.delete('/delete/:id', auth, deleteKitchenType);

module.exports = router;
