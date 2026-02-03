const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateRole, validateUpdateRole, handleValidationErrors } = require('../../middleware/roleValidation');
const { 
  createRole, 
  updateRole, 
  getRoleById, 
  getAllRoles,
  getRoleByAuth,
  deleteRole
} = require('../../controllers/Role.Controller');

// Role routes
router.post('/create', auth, validateCreateRole, handleValidationErrors, createRole);
router.put('/update', auth, validateUpdateRole, handleValidationErrors, updateRole);
router.get('/get/:id', auth, getRoleById);
router.get('/getall',  getAllRoles);
router.get('/getbyauth', auth, getRoleByAuth);
router.delete('/delete/:id', auth, deleteRole);

module.exports = router;
