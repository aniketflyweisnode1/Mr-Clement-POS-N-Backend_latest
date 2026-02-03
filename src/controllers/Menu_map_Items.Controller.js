const Menu_map_Items = require('../models/Menu_map_Items.model');
const User = require('../models/User.model');
const Store_menu = require('../models/Store_menu.model');
const Items = require('../models/Items.model');
const Store_details = require('../models/Store_details.model');

// Create Menu Map Items
const createMenuMapItems = async (req, res) => {
  try {
    const {
      Menu_id,
      item_id,
      store_id,
      Status
    } = req.body;

    const menuMapItems = new Menu_map_Items({
      Menu_id,
      item_id,
      store_id,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedMenuMapItems = await menuMapItems.save();
    
    // Manually fetch related data
    const [createByUser, storeMenu, item, storeDetails] = await Promise.all([
      savedMenuMapItems.CreateBy ? User.findOne({ user_id: savedMenuMapItems.CreateBy }) : null,
      savedMenuMapItems.Menu_id ? Store_menu.findOne({ Store_menu_id: savedMenuMapItems.Menu_id }) : null,
      savedMenuMapItems.item_id ? Items.findOne({ Items_id: savedMenuMapItems.item_id }) : null,
      savedMenuMapItems.store_id ? Store_details.findOne({ Store_id: savedMenuMapItems.store_id }) : null
    ]);

    // Create response object with populated data
    const menuMapItemsResponse = savedMenuMapItems.toObject();
    menuMapItemsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    menuMapItemsResponse.Menu_id = storeMenu ? 
      { Store_menu_id: storeMenu.Store_menu_id, name: storeMenu.name } : null;
    menuMapItemsResponse.item_id = item ? 
      { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-price': item['item-price'] } : null;
    menuMapItemsResponse.store_id = storeDetails ? 
      { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Menu map items created successfully',
      data: menuMapItemsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating menu map items',
      error: error.message
    });
  }
};

// Update All Menu Map Items
const updateAllMenuMapItems = async (req, res) => {
  try {
    const { Menu_id, items } = req.body;
    const userId = req.user.user_id;

    if (!Menu_id || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Menu_id and items array are required'
      });
    }

    // First, deactivate all existing mappings for this menu
    await Menu_map_Items.updateMany(
      { Menu_id: parseInt(Menu_id) },
      { 
        Status: false,
        UpdatedBy: userId,
        UpdatedAt: new Date()
      }
    );

    // Create new mappings for provided items one by one to avoid auto-increment issues
    const savedMappings = [];
    for (const item of items) {
      const newMapping = new Menu_map_Items({
        Menu_id: parseInt(Menu_id),
        item_id: item.item_id,
        store_id: item.store_id,
        Status: true,
        CreateBy: userId
      });
      const savedMapping = await newMapping.save();
      savedMappings.push(savedMapping);
    }

    res.status(200).json({
      success: true,
      message: 'All menu map items updated successfully',
      data: savedMappings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating all menu map items',
      error: error.message
    });
  }
};

// Update Menu Map Items
const updateMenuMapItems = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Menu Map Items ID is required in request body'
      });
    }

    const menuMapItems = await Menu_map_Items.findOne({ Menu_map_Items_id: parseInt(id) });
    if (!menuMapItems) {
      return res.status(404).json({
        success: false,
        message: 'Menu map items not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Menu_map_Items_id') {
        menuMapItems[key] = updateData[key];
      }
    });

    menuMapItems.UpdatedBy = userId;
    menuMapItems.UpdatedAt = new Date();

    const updatedMenuMapItems = await menuMapItems.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser, storeMenu, item, storeDetails] = await Promise.all([
      updatedMenuMapItems.CreateBy ? User.findOne({ user_id: updatedMenuMapItems.CreateBy }) : null,
      updatedMenuMapItems.UpdatedBy ? User.findOne({ user_id: updatedMenuMapItems.UpdatedBy }) : null,
      updatedMenuMapItems.Menu_id ? Store_menu.findOne({ Store_menu_id: updatedMenuMapItems.Menu_id }) : null,
      updatedMenuMapItems.item_id ? Items.findOne({ Items_id: updatedMenuMapItems.item_id }) : null,
      updatedMenuMapItems.store_id ? Store_details.findOne({ Store_id: updatedMenuMapItems.store_id }) : null
    ]);

    // Create response object with populated data
    const menuMapItemsResponse = updatedMenuMapItems.toObject();
    menuMapItemsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    menuMapItemsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    menuMapItemsResponse.Menu_id = storeMenu ? 
      { Store_menu_id: storeMenu.Store_menu_id, name: storeMenu.name } : null;
    menuMapItemsResponse.item_id = item ? 
      { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-price': item['item-price'] } : null;
    menuMapItemsResponse.store_id = storeDetails ? 
      { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Menu map items updated successfully',
      data: menuMapItemsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating menu map items',
      error: error.message
    });
  }
};

// Get Menu Map Items by ID
const getMenuMapItemsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuMapItems = await Menu_map_Items.findOne({ Menu_map_Items_id: parseInt(id) });
    
    if (!menuMapItems) {
      return res.status(404).json({
        success: false,
        message: 'Menu map items not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, storeMenu, item, storeDetails] = await Promise.all([
      menuMapItems.CreateBy ? User.findOne({ user_id: menuMapItems.CreateBy }) : null,
      menuMapItems.UpdatedBy ? User.findOne({ user_id: menuMapItems.UpdatedBy }) : null,
      menuMapItems.Menu_id ? Store_menu.findOne({ Store_menu_id: menuMapItems.Menu_id }) : null,
      menuMapItems.item_id ? Items.findOne({ Items_id: menuMapItems.item_id }) : null,
      menuMapItems.store_id ? Store_details.findOne({ Store_id: menuMapItems.store_id }) : null
    ]);

    // Create response object with populated data
    const menuMapItemsResponse = menuMapItems.toObject();
    menuMapItemsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    menuMapItemsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    menuMapItemsResponse.Menu_id = storeMenu ? 
      { Store_menu_id: storeMenu.Store_menu_id, name: storeMenu.name } : null;
    menuMapItemsResponse.item_id = item ? 
      { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-price': item['item-price'] } : null;
    menuMapItemsResponse.store_id = storeDetails ? 
      { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;

    res.status(200).json({
      success: true,
      data: menuMapItemsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu map items',
      error: error.message
    });
  }
};

// Get All Menu Map Items
const getAllMenuMapItems = async (req, res) => {
  try {
    const menuMapItemsList = await Menu_map_Items.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all menu map items
    const menuMapItemsResponse = await Promise.all(menuMapItemsList.map(async (menuMapItems) => {
      const [createByUser, storeMenu, item, storeDetails] = await Promise.all([
        menuMapItems.CreateBy ? User.findOne({ user_id: menuMapItems.CreateBy }) : null,
        menuMapItems.Menu_id ? Store_menu.findOne({ Store_menu_id: menuMapItems.Menu_id }) : null,
        menuMapItems.item_id ? Items.findOne({ Items_id: menuMapItems.item_id }) : null,
        menuMapItems.store_id ? Store_details.findOne({ Store_id: menuMapItems.store_id }) : null
      ]);

      const menuMapItemsObj = menuMapItems.toObject();
      menuMapItemsObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      menuMapItemsObj.Menu_id = storeMenu ? 
        { Store_menu_id: storeMenu.Store_menu_id, name: storeMenu.name } : null;
      menuMapItemsObj.item_id = item ? 
        { Items_id: item.Items_id, 'item-name': item['item-name'], 'item-price': item['item-price'] } : null;
      menuMapItemsObj.store_id = storeDetails ? 
        { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;

      return menuMapItemsObj;
    }));

    res.status(200).json({
      success: true,
      count: menuMapItemsResponse.length,
      data: menuMapItemsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu map items',
      error: error.message
    });
  }
};

// Delete Menu Map Items
const deleteMenuMapItems = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuMapItems = await Menu_map_Items.findOne({ Menu_map_Items_id: parseInt(id) });
    
    if (!menuMapItems) {
      return res.status(404).json({
        success: false,
        message: 'Menu map items not found'
      });
    }

    await Menu_map_Items.deleteOne({ Menu_map_Items_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Menu map items deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting menu map items',
      error: error.message
    });
  }
};

// Get Menu Map Items by Auth (current logged in user)
const getMenuMapItemsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const menuMapItems = await Menu_map_Items.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!menuMapItems || menuMapItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu map items not found for current user'
      });
    }

    // Manually fetch related data for all menu map items
    const menuMapItemsResponse = await Promise.all(menuMapItems.map(async (menuMapItem) => {
      const [createByUser, updatedByUser] = await Promise.all([
        menuMapItem.CreateBy ? User.findOne({ user_id: menuMapItem.CreateBy }) : null,
        menuMapItem.UpdatedBy ? User.findOne({ user_id: menuMapItem.UpdatedBy }) : null
      ]);

      const menuMapItemObj = menuMapItem.toObject();
      menuMapItemObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      menuMapItemObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return menuMapItemObj;
    }));

    res.status(200).json({
      success: true,
      count: menuMapItemsResponse.length,
      data: menuMapItemsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu map items',
      error: error.message
    });
  }
};

module.exports = {
  createMenuMapItems,
  updateAllMenuMapItems,
  updateMenuMapItems,
  getMenuMapItemsById,
  getAllMenuMapItems,
  getMenuMapItemsByAuth,
  deleteMenuMapItems
};
