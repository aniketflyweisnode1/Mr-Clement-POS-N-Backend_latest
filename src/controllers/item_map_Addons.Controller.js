const item_map_Addons = require('../models/item_map_Addons.model');
const item_Addons = require('../models/item_Addons.model');
const Items = require('../models/Items.model');
const User = require('../models/User.model');

// Create item map addons
const createItemMapAddons = async (req, res) => {
  try {
    const { item_Addons_id, item_id, Status } = req.body;
    const userId = req.user.user_id;

    const itemMapAddon = new item_map_Addons({
      item_Addons_id,
      item_id,
      Status,
      CreateBy: userId
    });

    const savedItemMapAddon = await itemMapAddon.save();
    
    res.status(201).json({
      success: true,
      message: 'Item map addon created successfully',
      data: savedItemMapAddon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item map addon',
      error: error.message
    });
  }
};

// Update item map addons
const updateItemMapAddons = async (req, res) => {
  try {
    const { id, item_Addons_id, item_id, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item map addon ID is required in request body'
      });
    }

    const itemMapAddon = await item_map_Addons.findOne({ item_map_Addons_id: parseInt(id) });
    if (!itemMapAddon) {
      return res.status(404).json({
        success: false,
        message: 'Item map addon not found'
      });
    }

    if (item_Addons_id !== undefined) itemMapAddon.item_Addons_id = item_Addons_id;
    if (item_id !== undefined) itemMapAddon.item_id = item_id;
    if (Status !== undefined) itemMapAddon.Status = Status;
    
    itemMapAddon.UpdatedBy = userId;
    itemMapAddon.UpdatedAt = new Date();

    const updatedItemMapAddon = await itemMapAddon.save();
    
    res.status(200).json({
      success: true,
      message: 'Item map addon updated successfully',
      data: updatedItemMapAddon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item map addon',
      error: error.message
    });
  }
};

// Get item map addons by ID
const getItemMapAddonsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemMapAddon = await item_map_Addons.findOne({ item_map_Addons_id: parseInt(id) });
    
    if (!itemMapAddon) {
      return res.status(404).json({
        success: false,
        message: 'Item map addon not found'
      });
    }

    // Manually fetch related data
    const [itemAddon, item, createByUser, updatedByUser] = await Promise.all([
      item_Addons.findOne({ item_Addons_id: itemMapAddon.item_Addons_id }),
      Items.findOne({ Items_id: itemMapAddon.item_id }),
      itemMapAddon.CreateBy ? User.findOne({ user_id: itemMapAddon.CreateBy }) : null,
      itemMapAddon.UpdatedBy ? User.findOne({ user_id: itemMapAddon.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const itemMapAddonResponse = itemMapAddon.toObject();
    itemMapAddonResponse.item_Addons_id = itemAddon ? { item_Addons_id: itemAddon.item_Addons_id, Addons: itemAddon.Addons } : null;
    itemMapAddonResponse.item_id = item ? { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-code': item['item-code'] } : null;
    itemMapAddonResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    itemMapAddonResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: itemMapAddonResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map addon',
      error: error.message
    });
  }
};

// Get all item map addons
const getAllItemMapAddons = async (req, res) => {
  try {
    const itemMapAddons = await item_map_Addons.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all item map addons
    const itemMapAddonsWithPopulatedData = await Promise.all(
      itemMapAddons.map(async (itemMapAddon) => {
        const [itemAddon, item, createByUser, updatedByUser] = await Promise.all([
          item_Addons.findOne({ item_Addons_id: itemMapAddon.item_Addons_id }),
          Items.findOne({ Items_id: itemMapAddon.item_id }),
          itemMapAddon.CreateBy ? User.findOne({ user_id: itemMapAddon.CreateBy }) : null,
          itemMapAddon.UpdatedBy ? User.findOne({ user_id: itemMapAddon.UpdatedBy }) : null
        ]);

        const itemMapAddonResponse = itemMapAddon.toObject();
        itemMapAddonResponse.item_Addons_id = itemAddon ? { item_Addons_id: itemAddon.item_Addons_id, Addons: itemAddon.Addons } : null;
        itemMapAddonResponse.item_id = item ? { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-code': item['item-code'] } : null;
        itemMapAddonResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemMapAddonResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemMapAddonResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemMapAddonsWithPopulatedData.length,
      data: itemMapAddonsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map addons',
      error: error.message
    });
  }
};

// Delete Item Map Addons
const deleteItemMapAddons = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemMapAddon = await item_map_Addons.findOne({ item_map_Addons_id: parseInt(id) });
    
    if (!itemMapAddon) {
      return res.status(404).json({
        success: false,
        message: 'Item map addon not found'
      });
    }

    await item_map_Addons.deleteOne({ item_map_Addons_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Item map addon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item map addon',
      error: error.message
    });
  }
};

// Get Item Map Addons by Auth (current logged in user)
const getItemMapAddonsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const itemMapAddons = await item_map_Addons.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!itemMapAddons || itemMapAddons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item map addons not found for current user'
      });
    }

    // Manually fetch related data for all item map addons
    const itemMapAddonsResponse = await Promise.all(itemMapAddons.map(async (itemMapAddon) => {
      const [createByUser, updatedByUser] = await Promise.all([
        itemMapAddon.CreateBy ? User.findOne({ user_id: itemMapAddon.CreateBy }) : null,
        itemMapAddon.UpdatedBy ? User.findOne({ user_id: itemMapAddon.UpdatedBy }) : null
      ]);

      const itemMapAddonObj = itemMapAddon.toObject();
      itemMapAddonObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      itemMapAddonObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return itemMapAddonObj;
    }));

    res.status(200).json({
      success: true,
      count: itemMapAddonsResponse.length,
      data: itemMapAddonsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map addons',
      error: error.message
    });
  }
};

// Get Item Map Addons by Item ID
const getItemMapAddonsByItemId = async (req, res) => {
  try {
    const { itemid } = req.params;
    
    if (!itemid) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const itemMapAddons = await item_map_Addons.find({ item_id: parseInt(itemid), Status: true })
      .sort({ CreateAt: -1 });
    
    if (!itemMapAddons || itemMapAddons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item map addons not found for this item'
      });
    }

    // Manually fetch related data for all item map addons
    const itemMapAddonsResponse = await Promise.all(
      itemMapAddons.map(async (itemMapAddon) => {
        const [itemAddon, item, createByUser, updatedByUser] = await Promise.all([
          item_Addons.findOne({ item_Addons_id: itemMapAddon.item_Addons_id }),
          Items.findOne({ Items_id: itemMapAddon.item_id }),
          itemMapAddon.CreateBy ? User.findOne({ user_id: itemMapAddon.CreateBy }) : null,
          itemMapAddon.UpdatedBy ? User.findOne({ user_id: itemMapAddon.UpdatedBy }) : null
        ]);

        const itemMapAddonResponse = itemMapAddon.toObject();
        itemMapAddonResponse.item_Addons_id = itemAddon ? { item_Addons_id: itemAddon.item_Addons_id, Addons: itemAddon.Addons } : null;
        itemMapAddonResponse.item_id = item ? { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-code': item['item-code'] } : null;
        itemMapAddonResponse.Item_prices = item ? item['item-price'] : null;
        itemMapAddonResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemMapAddonResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemMapAddonResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemMapAddonsResponse.length,
      data: itemMapAddonsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item map addons by item ID',
      error: error.message
    });
  }
};

module.exports = {
  createItemMapAddons,
  updateItemMapAddons,
  getItemMapAddonsById,
  getAllItemMapAddons,
  getItemMapAddonsByAuth,
  getItemMapAddonsByItemId,
  deleteItemMapAddons
};
