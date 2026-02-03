const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreatePermissionsType,
  validateUpdatePermissionsType,
  handleValidationErrors
} = require('../../middleware/permissionsTypeValidation');
const {
  createPermissionsType,
  updatePermissionsType,
  getPermissionsTypeById,
  getAllPermissionsTypes,
  getPermissionsTypesByAuth,
  deletePermissionsType
} = require('../../controllers/Permissions_type.Controller');

// Create permissions type (with auth)
router.post('/create', auth, validateCreatePermissionsType, handleValidationErrors, createPermissionsType);

// Update permissions type (with auth)
router.put('/update', auth, validateUpdatePermissionsType, handleValidationErrors, updatePermissionsType);

// Get permissions type by ID (with auth)
router.get('/getbyid/:id', auth, getPermissionsTypeById);

// Get all permissions types (with auth)
router.get('/getall', auth, getAllPermissionsTypes);

// Get permissions types by authenticated user (with auth)
router.get('/getbyauth', auth, getPermissionsTypesByAuth);

// Delete permissions type (with auth)
router.delete('/delete/:id', auth, deletePermissionsType);

module.exports = router;
