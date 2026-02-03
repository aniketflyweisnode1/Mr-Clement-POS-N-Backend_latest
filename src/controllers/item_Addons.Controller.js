const item_Addons = require('../models/item_Addons.model');
const User = require('../models/User.model');

// Create item addons
const createItemAddons = async (req, res) => {
  try {
    const { Addons, prices, Status } = req.body;
    const userId = req.user.user_id;

    const itemAddon = new item_Addons({
      Addons,
      prices,
      Status,
      CreateBy: userId
    });

    const savedItemAddon = await itemAddon.save();
    
    res.status(201).json({
      success: true,
      message: 'Item addon created successfully',
      data: savedItemAddon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item addon',
      error: error.message
    });
  }
};

// Update item addons
const updateItemAddons = async (req, res) => {
  try {
    const { id, Addons, prices, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item addon ID is required in request body'
      });
    }

    const itemAddon = await item_Addons.findOne({ item_Addons_id: parseInt(id) });
    if (!itemAddon) {
      return res.status(404).json({
        success: false,
        message: 'Item addon not found'
      });
    }

    if (Addons !== undefined) itemAddon.Addons = Addons;
    if (prices !== undefined) itemAddon.prices = prices;
    if (Status !== undefined) itemAddon.Status = Status;
    
    itemAddon.UpdatedBy = userId;
    itemAddon.UpdatedAt = new Date();

    const updatedItemAddon = await itemAddon.save();
    
    res.status(200).json({
      success: true,
      message: 'Item addon updated successfully',
      data: updatedItemAddon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item addon',
      error: error.message
    });
  }
};

// Get item addons by ID
const getItemAddonsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemAddon = await item_Addons.findOne({ item_Addons_id: parseInt(id) });
    
    if (!itemAddon) {
      return res.status(404).json({
        success: false,
        message: 'Item addon not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      itemAddon.CreateBy ? User.findOne({ user_id: itemAddon.CreateBy }) : null,
      itemAddon.UpdatedBy ? User.findOne({ user_id: itemAddon.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const itemAddonResponse = itemAddon.toObject();
    itemAddonResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    itemAddonResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: itemAddonResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item addon',
      error: error.message
    });
  }
};

// Get all item addons
const getAllItemAddons = async (req, res) => {
  try {
    const itemAddons = await item_Addons.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all item addons
    const itemAddonsWithPopulatedData = await Promise.all(
      itemAddons.map(async (itemAddon) => {
        const [createByUser, updatedByUser] = await Promise.all([
          itemAddon.CreateBy ? User.findOne({ user_id: itemAddon.CreateBy }) : null,
          itemAddon.UpdatedBy ? User.findOne({ user_id: itemAddon.UpdatedBy }) : null
        ]);

        const itemAddonResponse = itemAddon.toObject();
        itemAddonResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemAddonResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemAddonResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemAddonsWithPopulatedData.length,
      data: itemAddonsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item addons',
      error: error.message
    });
  }
};

// Delete Item Addons
const deleteItemAddons = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemAddon = await item_Addons.findOne({ item_Addons_id: parseInt(id) });
    
    if (!itemAddon) {
      return res.status(404).json({
        success: false,
        message: 'Item addon not found'
      });
    }

    await item_Addons.deleteOne({ item_Addons_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Item addon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item addon',
      error: error.message
    });
  }
};

// Get Item Addons by Auth (current logged in user)
const getItemAddonsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const itemAddons = await Item_Addons.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!itemAddons || itemAddons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item addons not found for current user'
      });
    }

    // Manually fetch related data for all item addons
    const itemAddonsResponse = await Promise.all(itemAddons.map(async (itemAddon) => {
      const [createByUser, updatedByUser] = await Promise.all([
        itemAddon.CreateBy ? User.findOne({ user_id: itemAddon.CreateBy }) : null,
        itemAddon.UpdatedBy ? User.findOne({ user_id: itemAddon.UpdatedBy }) : null
      ]);

      const itemAddonObj = itemAddon.toObject();
      itemAddonObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      itemAddonObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return itemAddonObj;
    }));

    res.status(200).json({
      success: true,
      count: itemAddonsResponse.length,
      data: itemAddonsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item addons',
      error: error.message
    });
  }
};

module.exports = {
  createItemAddons,
  updateItemAddons,
  getItemAddonsById,
  getAllItemAddons,
  getItemAddonsByAuth,
  deleteItemAddons
};
