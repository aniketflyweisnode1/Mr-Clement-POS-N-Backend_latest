const item_map_Variants = require('../models/item_map_Variants.model');
const item_Variants = require('../models/item_Variants.model');
const Items = require('../models/Items.model');
const User = require('../models/User.model');

// Create item map variants
const createItemMapVariants = async (req, res) => {
  try {
    const { item_Variants_id, item_id, Status } = req.body;
    const userId = req.user.user_id;

    const itemMapVariant = new item_map_Variants({
      item_Variants_id,
      item_id,
      Status,
      CreateBy: userId
    });

    const savedItemMapVariant = await itemMapVariant.save();
    
    res.status(201).json({
      success: true,
      message: 'Item map variant created successfully',
      data: savedItemMapVariant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item map variant',
      error: error.message
    });
  }
};

// Update item map variants
const updateItemMapVariants = async (req, res) => {
  try {
    const { id, item_Variants_id, item_id, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item map variant ID is required in request body'
      });
    }

    const itemMapVariant = await item_map_Variants.findOne({ item_map_Variants_id: parseInt(id) });
    if (!itemMapVariant) {
      return res.status(404).json({
        success: false,
        message: 'Item map variant not found'
      });
    }

    if (item_Variants_id !== undefined) itemMapVariant.item_Variants_id = item_Variants_id;
    if (item_id !== undefined) itemMapVariant.item_id = item_id;
    if (Status !== undefined) itemMapVariant.Status = Status;
    
    itemMapVariant.UpdatedBy = userId;
    itemMapVariant.UpdatedAt = new Date();

    const updatedItemMapVariant = await itemMapVariant.save();
    
    res.status(200).json({
      success: true,
      message: 'Item map variant updated successfully',
      data: updatedItemMapVariant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item map variant',
      error: error.message
    });
  }
};

// Get item map variants by ID
const getItemMapVariantsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemMapVariant = await item_map_Variants.findOne({ item_map_Variants_id: parseInt(id) });
    
    if (!itemMapVariant) {
      return res.status(404).json({
        success: false,
        message: 'Item map variant not found'
      });
    }

    // Manually fetch related data
    const [itemVariant, item, createByUser, updatedByUser] = await Promise.all([
      item_Variants.findOne({ item_Variants_id: itemMapVariant.item_Variants_id }),
      Items.findOne({ Items_id: itemMapVariant.item_id }),
      itemMapVariant.CreateBy ? User.findOne({ user_id: itemMapVariant.CreateBy }) : null,
      itemMapVariant.UpdatedBy ? User.findOne({ user_id: itemMapVariant.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const itemMapVariantResponse = itemMapVariant.toObject();
    itemMapVariantResponse.item_Variants_id = itemVariant ? { item_Variants_id: itemVariant.item_Variants_id, Variants: itemVariant.Variants } : null;
    itemMapVariantResponse.item_id = item ? { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-code': item['item-code'] } : null;
    itemMapVariantResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    itemMapVariantResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: itemMapVariantResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map variant',
      error: error.message
    });
  }
};

// Get all item map variants
const getAllItemMapVariants = async (req, res) => {
  try {
    const itemMapVariants = await item_map_Variants.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all item map variants
    const itemMapVariantsWithPopulatedData = await Promise.all(
      itemMapVariants.map(async (itemMapVariant) => {
        const [itemVariant, item, createByUser, updatedByUser] = await Promise.all([
          item_Variants.findOne({ item_Variants_id: itemMapVariant.item_Variants_id }),
          Items.findOne({ Items_id: itemMapVariant.item_id }),
          itemMapVariant.CreateBy ? User.findOne({ user_id: itemMapVariant.CreateBy }) : null,
          itemMapVariant.UpdatedBy ? User.findOne({ user_id: itemMapVariant.UpdatedBy }) : null
        ]);

        const itemMapVariantResponse = itemMapVariant.toObject();
        itemMapVariantResponse.item_Variants_id = itemVariant ? { item_Variants_id: itemVariant.item_Variants_id, Variants: itemVariant.Variants } : null;
        itemMapVariantResponse.item_id = item ? { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-code': item['item-code'] } : null;
        itemMapVariantResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemMapVariantResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemMapVariantResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemMapVariantsWithPopulatedData.length,
      data: itemMapVariantsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map variants',
      error: error.message
    });
  }
};

// Delete Item Map Variants
const deleteItemMapVariants = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemMapVariant = await item_map_Variants.findOne({ item_map_Variants_id: parseInt(id) });
    
    if (!itemMapVariant) {
      return res.status(404).json({
        success: false,
        message: 'Item map variant not found'
      });
    }

    await item_map_Variants.deleteOne({ item_map_Variants_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Item map variant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item map variant',
      error: error.message
    });
  }
};

// Get Item Map Variants by Auth (current logged in user)
const getItemMapVariantsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const itemMapVariants = await item_map_Variants.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!itemMapVariants || itemMapVariants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item map variants not found for current user'
      });
    }

    // Manually fetch related data for all item map variants
    const itemMapVariantsResponse = await Promise.all(itemMapVariants.map(async (itemMapVariant) => {
      const [createByUser, updatedByUser] = await Promise.all([
        itemMapVariant.CreateBy ? User.findOne({ user_id: itemMapVariant.CreateBy }) : null,
        itemMapVariant.UpdatedBy ? User.findOne({ user_id: itemMapVariant.UpdatedBy }) : null
      ]);

      const itemMapVariantObj = itemMapVariant.toObject();
      itemMapVariantObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      itemMapVariantObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return itemMapVariantObj;
    }));

    res.status(200).json({
      success: true,
      count: itemMapVariantsResponse.length,
      data: itemMapVariantsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map variants',
      error: error.message
    });
  }
};

// Get Item Map Variants by Item ID
const getItemMapVariantsByItemId = async (req, res) => {
  try {
    const { itemid } = req.params;
    
    if (!itemid) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const itemMapVariants = await item_map_Variants.find({ item_id: parseInt(itemid), Status: true })
      .sort({ CreateAt: -1 });
    
    if (!itemMapVariants || itemMapVariants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item map variants not found for this item'
      });
    }

    // Manually fetch related data for all item map variants
    const itemMapVariantsResponse = await Promise.all(
      itemMapVariants.map(async (itemMapVariant) => {
        const [itemVariant, item, createByUser, updatedByUser] = await Promise.all([
          item_Variants.findOne({ item_Variants_id: itemMapVariant.item_Variants_id }),
          Items.findOne({ Items_id: itemMapVariant.item_id }),
          itemMapVariant.CreateBy ? User.findOne({ user_id: itemMapVariant.CreateBy }) : null,
          itemMapVariant.UpdatedBy ? User.findOne({ user_id: itemMapVariant.UpdatedBy }) : null
        ]);

        const itemMapVariantResponse = itemMapVariant.toObject();
        itemMapVariantResponse.item_Variants_id = itemVariant ? { item_Variants_id: itemVariant.item_Variants_id, Variants: itemVariant.Variants } : null;
        itemMapVariantResponse.item_id = item ? { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-code': item['item-code'] } : null;
        itemMapVariantResponse.Item_prices = item ? item['item-price'] : null;
        itemMapVariantResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemMapVariantResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemMapVariantResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemMapVariantsResponse.length,
      data: itemMapVariantsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map variants by item ID',
      error: error.message
    });
  }
};

// Get Item with Variants by Item ID
const getbyitemwithVariants = async (req, res) => {
  try {
    const { itemid } = req.params;
    
    if (!itemid) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Get item details
    const item = await Items.findOne({ Items_id: parseInt(itemid), Status: true });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Get all variants mapped to this item
    const itemMapVariants = await item_map_Variants.find({ 
      item_id: parseInt(itemid), 
      Status: true 
    }).sort({ CreateAt: -1 });

    // Fetch variant details for all mapped variants
    const variants = await Promise.all(
      itemMapVariants.map(async (itemMapVariant) => {
        const variant = await item_Variants.findOne({ 
          item_Variants_id: itemMapVariant.item_Variants_id,
          Status: true
        });
        
        if (variant) {
          return {
            item_Variants_id: variant.item_Variants_id,
            Variants: variant.Variants,
            prices: variant.prices,
            item_map_Variants_id: itemMapVariant.item_map_Variants_id
          };
        }
        return null;
      })
    );

    // Filter out null values
    const validVariants = variants.filter(v => v !== null);

    // Create response with item and its variants
    const itemResponse = item.toObject();
    itemResponse.Variants = validVariants;

    res.status(200).json({
      success: true,
      message: 'Item with variants retrieved successfully',
      data: itemResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item with variants',
      error: error.message
    });
  }
};

module.exports = {
  createItemMapVariants,
  updateItemMapVariants,
  getItemMapVariantsById,
  getAllItemMapVariants,
  getItemMapVariantsByAuth,
  getItemMapVariantsByItemId,
  deleteItemMapVariants,
  getbyitemwithVariants
};
