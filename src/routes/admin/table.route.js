const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateTable, validateUpdateTable, handleValidationErrors } = require('../../middleware/tableValidation');
const { 
  createTable, 
  updateTable, 
  getTableById,
  getAllTables,
  getTableByAuth,
  deleteTable,
  toggleTableStatus,
  getTableByCode,
  getTableQRData
} = require('../../controllers/Table.Controller');


// Table routes 29/08/2025
router.post('/create', auth, validateCreateTable, handleValidationErrors, createTable);
router.put('/update', auth, validateUpdateTable, handleValidationErrors, updateTable);
router.put('/toggle-status/:id', auth, toggleTableStatus);
router.get('/get/:id', auth, getTableById);
router.get('/getall', getAllTables);
router.get('/getbyauth', auth, getTableByAuth);
router.get('/qr-data/:id', auth, getTableQRData);
router.get('/scan/:code', getTableByCode); // Public - No Auth (For QR Scan)
router.delete('/delete/:id', auth, deleteTable);

module.exports = router;
