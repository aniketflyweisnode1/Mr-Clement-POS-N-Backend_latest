const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateItemAddons, validateUpdateItemAddons, handleValidationErrors } = require('../../middleware/itemAddonsValidation');
const { 
  createItemAddons, 
  updateItemAddons, 
  getItemAddonsById, 
  getAllItemAddons,
  getItemAddonsByAuth,
  deleteItemAddons
} = require('../../controllers/item_Addons.Controller');

// Item addons routes
router.post('/create', auth, validateCreateItemAddons, handleValidationErrors, createItemAddons);
router.put('/update', auth, validateUpdateItemAddons, handleValidationErrors, updateItemAddons);
router.get('/get/:id', auth, getItemAddonsById);
router.get('/getall', getAllItemAddons);
router.get('/getbyauth', auth, getItemAddonsByAuth);
router.delete('/delete/:id', auth, deleteItemAddons);

module.exports = router;
