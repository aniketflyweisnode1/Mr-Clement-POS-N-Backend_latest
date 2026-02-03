const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateItemMapAddons, validateUpdateItemMapAddons, handleValidationErrors } = require('../../middleware/itemMapAddonsValidation');
const { 
  createItemMapAddons, 
  updateItemMapAddons, 
  getItemMapAddonsById, 
  getAllItemMapAddons,
  getItemMapAddonsByAuth,
  getItemMapAddonsByItemId,
  deleteItemMapAddons
} = require('../../controllers/item_map_Addons.Controller');

// Item map addons routes
router.post('/create', auth, validateCreateItemMapAddons, handleValidationErrors, createItemMapAddons);
router.put('/update', auth, validateUpdateItemMapAddons, handleValidationErrors, updateItemMapAddons);
router.get('/get/:id', auth, getItemMapAddonsById);
router.get('/getall', getAllItemMapAddons);
router.get('/getbyauth', auth, getItemMapAddonsByAuth);
router.get('/getbyitemid/:itemid', auth, getItemMapAddonsByItemId);
router.delete('/delete/:id', auth, deleteItemMapAddons);


module.exports = router;
