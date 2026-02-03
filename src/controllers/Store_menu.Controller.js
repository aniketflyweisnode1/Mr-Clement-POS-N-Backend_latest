const Store_menu = require('../models/Store_menu.model');
const User = require('../models/User.model');

// Create Store Menu
const createStoreMenu = async (req, res) => {
  try {
    const {
      name,
      Status
    } = req.body;

    const storeMenu = new Store_menu({
      name,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedStoreMenu = await storeMenu.save();
    
    // Manually fetch related data
    const createByUser = savedStoreMenu.CreateBy ? 
      await User.findOne({ user_id: savedStoreMenu.CreateBy }) : null;

    // Create response object with populated data
    const storeMenuResponse = savedStoreMenu.toObject();
    storeMenuResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Store menu created successfully',
      data: storeMenuResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating store menu',
      error: error.message
    });
  }
};

// Update Store Menu
const updateStoreMenu = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store Menu ID is required in request body'
      });
    }

    const storeMenu = await Store_menu.findOne({ Store_menu_id: parseInt(id) });
    if (!storeMenu) {
      return res.status(404).json({
        success: false,
        message: 'Store menu not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Store_menu_id') {
        storeMenu[key] = updateData[key];
      }
    });

    storeMenu.UpdatedBy = userId;
    storeMenu.UpdatedAt = new Date();

    const updatedStoreMenu = await storeMenu.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedStoreMenu.CreateBy ? User.findOne({ user_id: updatedStoreMenu.CreateBy }) : null,
      updatedStoreMenu.UpdatedBy ? User.findOne({ user_id: updatedStoreMenu.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const storeMenuResponse = updatedStoreMenu.toObject();
    storeMenuResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    storeMenuResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Store menu updated successfully',
      data: storeMenuResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating store menu',
      error: error.message
    });
  }
};

// Get Store Menu by ID
const getStoreMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storeMenu = await Store_menu.findOne({ Store_menu_id: parseInt(id) });
    
    if (!storeMenu) {
      return res.status(404).json({
        success: false,
        message: 'Store menu not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      storeMenu.CreateBy ? User.findOne({ user_id: storeMenu.CreateBy }) : null,
      storeMenu.UpdatedBy ? User.findOne({ user_id: storeMenu.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const storeMenuResponse = storeMenu.toObject();
    storeMenuResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    storeMenuResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: storeMenuResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching store menu',
      error: error.message
    });
  }
};

// Get All Store Menus
const getAllStoreMenus = async (req, res) => {
  try {
    const storeMenus = await Store_menu.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all store menus
    const storeMenusResponse = await Promise.all(storeMenus.map(async (storeMenu) => {
      const createByUser = storeMenu.CreateBy ? 
        await User.findOne({ user_id: storeMenu.CreateBy }) : null;

      const storeMenuObj = storeMenu.toObject();
      storeMenuObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return storeMenuObj;
    }));

    res.status(200).json({
      success: true,
      count: storeMenusResponse.length,
      data: storeMenusResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching store menus',
      error: error.message
    });
  }
};

// Delete Store Menu
const deleteStoreMenu = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storeMenu = await Store_menu.findOne({ Store_menu_id: parseInt(id) });
    
    if (!storeMenu) {
      return res.status(404).json({
        success: false,
        message: 'Store menu not found'
      });
    }

    await Store_menu.deleteOne({ Store_menu_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Store menu deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting store menu',
      error: error.message
    });
  }
};

// Get Store Menu by Auth (current logged in user)
const getStoreMenuByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const storeMenus = await Store_menu.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!storeMenus || storeMenus.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store menus not found for current user'
      });
    }

    // Manually fetch related data for all store menus
    const storeMenusResponse = await Promise.all(storeMenus.map(async (storeMenu) => {
      const [createByUser, updatedByUser] = await Promise.all([
        storeMenu.CreateBy ? User.findOne({ user_id: storeMenu.CreateBy }) : null,
        storeMenu.UpdatedBy ? User.findOne({ user_id: storeMenu.UpdatedBy }) : null
      ]);

      const storeMenuObj = storeMenu.toObject();
      storeMenuObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      storeMenuObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return storeMenuObj;
    }));

    res.status(200).json({
      success: true,
      count: storeMenusResponse.length,
      data: storeMenusResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching store menus',
      error: error.message
    });
  }
};

module.exports = {
  createStoreMenu,
  updateStoreMenu,
  getStoreMenuById,
  getAllStoreMenus,
  getStoreMenuByAuth,
  deleteStoreMenu
};
