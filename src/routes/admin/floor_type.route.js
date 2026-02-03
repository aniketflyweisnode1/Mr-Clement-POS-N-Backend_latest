const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateFloorType, validateUpdateFloorType, handleValidationErrors } = require('../../middleware/floorTypeValidation');
const { 
  createFloorType, 
  updateFloorType, 
  getFloorTypeById, 
  getAllFloorTypes,
  getFloorTypeByAuth,
  deleteFloorType
} = require('../../controllers/Floor_Type.Controller');

// Floor_Type routes 29/08/2025
router.post('/create', auth, validateCreateFloorType, handleValidationErrors, createFloorType);
router.put('/update', auth, validateUpdateFloorType, handleValidationErrors, updateFloorType);
router.get('/get/:id', auth, getFloorTypeById);
router.get('/getall', getAllFloorTypes);
router.get('/getbyauth', auth, getFloorTypeByAuth);
router.delete('/delete/:id', auth, deleteFloorType);

module.exports = router;
