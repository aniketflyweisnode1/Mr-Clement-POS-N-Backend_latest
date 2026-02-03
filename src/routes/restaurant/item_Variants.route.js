const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateItemVariants, validateUpdateItemVariants, handleValidationErrors } = require('../../middleware/itemVariantsValidation');
const { 
  createItemVariants, 
  updateItemVariants, 
  getItemVariantsById, 
  getAllItemVariants,
  getItemVariantsByAuth,
  deleteItemVariants
} = require('../../controllers/item_Variants.Controller');

// Item variants routes
router.post('/create', auth, validateCreateItemVariants, handleValidationErrors, createItemVariants);
router.put('/update', auth, validateUpdateItemVariants, handleValidationErrors, updateItemVariants);
router.get('/get/:id', auth, getItemVariantsById);
router.get('/getall', getAllItemVariants);
router.get('/getbyauth', auth, getItemVariantsByAuth);
router.delete('/delete/:id', auth, deleteItemVariants);

module.exports = router;
