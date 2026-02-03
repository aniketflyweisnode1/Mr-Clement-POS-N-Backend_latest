const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateFloor, validateUpdateFloor, handleValidationErrors } = require('../../middleware/floorValidation');
const { 
  createFloor, 
  updateFloor, 
  getFloorById, 
  getAllFloors,
  getFloorByAuth,
  deleteFloor
} = require('../../controllers/Floor.Controller');

// Floor routes 29/08/2025
router.post('/create', auth, validateCreateFloor, handleValidationErrors, createFloor);
router.put('/update', auth, validateUpdateFloor, handleValidationErrors, updateFloor);
router.get('/get/:id', auth, getFloorById);
router.get('/getall', getAllFloors);
router.get('/getbyauth', auth, getFloorByAuth);
router.delete('/delete/:id', auth, deleteFloor);

module.exports = router;
