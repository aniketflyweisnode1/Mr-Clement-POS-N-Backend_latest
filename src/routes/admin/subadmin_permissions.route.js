const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createSubAdminPermissions,
  updateSubAdminPermissions,
  getSubAdminPermissionsById,
  getAllSubAdminPermissions,
  getSubAdminPermissionsByAuth,
  deleteSubAdminPermissions
} = require('../../controllers/SubAdmin_Permissions.Controller');

// Create SubAdmin Permissions (with auth)
router.post('/create', auth, createSubAdminPermissions);

// Update SubAdmin Permissions (with auth)
router.put('/update', auth, updateSubAdminPermissions);

// Get SubAdmin Permissions by ID (with auth)
router.get('/getbyid/:id', auth, getSubAdminPermissionsById);

// Get all SubAdmin Permissions (with auth)
router.get('/getall', auth, getAllSubAdminPermissions);

// Get SubAdmin Permissions by auth (with auth)
router.get('/getbyauth', auth, getSubAdminPermissionsByAuth);

// Delete SubAdmin Permissions (with auth)
router.delete('/delete/:id', auth, deleteSubAdminPermissions);

module.exports = router;

