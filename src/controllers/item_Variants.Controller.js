const item_Variants = require('../models/item_Variants.model');
const User = require('../models/User.model');

// Create item variants
const createItemVariants = async (req, res) => {
  try {
    const { Variants, prices, Status } = req.body;
    const userId = req.user.user_id;

    const itemVariant = new item_Variants({
      Variants,
      prices,
      Status,
      CreateBy: userId
    });

    const savedItemVariant = await itemVariant.save();
    
    res.status(201).json({
      success: true,
      message: 'Item variant created successfully',
      data: savedItemVariant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item variant',
      error: error.message
    });
  }
};

// Update item variants
const updateItemVariants = async (req, res) => {
  try {
    const { id, Variants, prices, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item variant ID is required in request body'
      });
    }

    const itemVariant = await item_Variants.findOne({ item_Variants_id: parseInt(id) });
    if (!itemVariant) {
      return res.status(404).json({
        success: false,
        message: 'Item variant not found'
      });
    }

    if (Variants !== undefined) itemVariant.Variants = Variants;
    if (prices !== undefined) itemVariant.prices = prices;
    if (Status !== undefined) itemVariant.Status = Status;
    
    itemVariant.UpdatedBy = userId;
    itemVariant.UpdatedAt = new Date();

    const updatedItemVariant = await itemVariant.save();
    
    res.status(200).json({
      success: true,
      message: 'Item variant updated successfully',
      data: updatedItemVariant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item variant',
      error: error.message
    });
  }
};

// Get item variants by ID
const getItemVariantsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemVariant = await item_Variants.findOne({ item_Variants_id: parseInt(id) });
    
    if (!itemVariant) {
      return res.status(404).json({
        success: false,
        message: 'Item variant not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      itemVariant.CreateBy ? User.findOne({ user_id: itemVariant.CreateBy }) : null,
      itemVariant.UpdatedBy ? User.findOne({ user_id: itemVariant.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const itemVariantResponse = itemVariant.toObject();
    itemVariantResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    itemVariantResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: itemVariantResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item variant',
      error: error.message
    });
  }
};

// Get all item variants
const getAllItemVariants = async (req, res) => {
  try {
    const itemVariants = await item_Variants.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all item variants
    const itemVariantsWithPopulatedData = await Promise.all(
      itemVariants.map(async (itemVariant) => {
        const [createByUser, updatedByUser] = await Promise.all([
          itemVariant.CreateBy ? User.findOne({ user_id: itemVariant.CreateBy }) : null,
          itemVariant.UpdatedBy ? User.findOne({ user_id: itemVariant.UpdatedBy }) : null
        ]);

        const itemVariantResponse = itemVariant.toObject();
        itemVariantResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemVariantResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemVariantResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemVariantsWithPopulatedData.length,
      data: itemVariantsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item variants',
      error: error.message
    });
  }
};

// Delete Item Variants
const deleteItemVariants = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemVariant = await item_Variants.findOne({ item_Variants_id: parseInt(id) });
    
    if (!itemVariant) {
      return res.status(404).json({
        success: false,
        message: 'Item variant not found'
      });
    }

    await item_Variants.deleteOne({ item_Variants_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Item variant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item variant',
      error: error.message
    });
  }
};

// Get Item Variants by Auth (current logged in user)
const getItemVariantsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const itemVariants = await Item_Variants.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!itemVariants || itemVariants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item variants not found for current user'
      });
    }

    // Manually fetch related data for all item variants
    const itemVariantsResponse = await Promise.all(itemVariants.map(async (itemVariant) => {
      const [createByUser, updatedByUser] = await Promise.all([
        itemVariant.CreateBy ? User.findOne({ user_id: itemVariant.CreateBy }) : null,
        itemVariant.UpdatedBy ? User.findOne({ user_id: itemVariant.UpdatedBy }) : null
      ]);

      const itemVariantObj = itemVariant.toObject();
      itemVariantObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      itemVariantObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return itemVariantObj;
    }));

    res.status(200).json({
      success: true,
      count: itemVariantsResponse.length,
      data: itemVariantsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item variants',
      error: error.message
    });
  }
};

module.exports = {
  createItemVariants,
  updateItemVariants,
  getItemVariantsById,
  getAllItemVariants,
  getItemVariantsByAuth,
  deleteItemVariants
};
