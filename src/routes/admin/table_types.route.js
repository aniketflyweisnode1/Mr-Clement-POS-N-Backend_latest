const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateTableTypes, validateUpdateTableTypes, handleValidationErrors } = require('../../middleware/tableTypesValidation');
const { 
  createTableTypes, 
  updateTableTypes, 
  getTableTypesById, 
  getAllTableTypes,
  getTableTypesByAuth,
  deleteTableTypes
} = require('../../controllers/Table_types.Controller');

// Table_types routes 29/08/2025
router.post('/create', auth, validateCreateTableTypes, handleValidationErrors, createTableTypes);
router.put('/update', auth, validateUpdateTableTypes, handleValidationErrors, updateTableTypes);
router.get('/get/:id', auth, getTableTypesById);
router.get('/getall', getAllTableTypes);
router.get('/getbyauth', auth, getTableTypesByAuth);
router.delete('/delete/:id', auth, deleteTableTypes);

module.exports = router;
