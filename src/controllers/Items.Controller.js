const Items = require('../models/Items.model');
const Items_types = require('../models/Items_types.model');
const Tax_setup = require('../models/Tax_setup.model');
const item_Variants = require('../models/item_Variants.model');
const item_Addons = require('../models/item_Addons.model');
const User = require('../models/User.model');

// Create Items (Updated as per UI)
const createItems = async (req, res) => {
  try {
    const { 
      Title,
      Description,
      image,
      Net_Price,
      Price,
      Items_types_id,
      Tax_id,
      Variants,
      Addons,
      // Legacy fields support
      Emozi, 
      'item-name': itemName, 
      'item-code': itemCode, 
      'item-size': itemSize, 
      'item-price': itemPrice, 
      'item-quantity': itemQuantity, 
      'item-stock-quantity': itemStockQuantity, 
      Details, 
      Status 
    } = req.body;
    const userId = req.user.user_id;

    // Validate category exists
    if (Items_types_id) {
      const category = await Items_types.findOne({ Items_types_id: parseInt(Items_types_id) });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Items_types_id. Category not found.'
        });
      }
    }

    // Validate Tax if provided
    if (Tax_id) {
      const tax = await Tax_setup.findOne({ Tax_setup_id: parseInt(Tax_id) });
      if (!tax) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Tax_id. Tax not found.'
        });
      }
    }

    // Auto-generate item-code if not provided
    const lastItem = await Items.findOne().sort({ Items_id: -1 });
    const newItemId = lastItem ? lastItem.Items_id + 1 : 1;
    const generatedItemCode = itemCode || `ITEM-${String(newItemId).padStart(3, '0')}`;

    const items = new Items({
      Title,
      Description: Description || Details,
      image,
      Net_Price: Net_Price || 0,
      Price: Price || itemPrice,
      Items_types_id,
      Tax_id,
      Variants: Variants || [],
      Addons: Addons || [],
      Emozi: Emozi || '🍽️',
      'item-name': itemName || Title,
      'item-code': generatedItemCode,
      'item-size': itemSize,
      'item-price': itemPrice || Price,
      'item-quantity': itemQuantity || 1,
      'item-stock-quantity': itemStockQuantity || 0,
      Details: Details || Description,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedItems = await items.save();

    // Fetch related data for response
    const [category, tax] = await Promise.all([
      Items_types.findOne({ Items_types_id: savedItems.Items_types_id }),
      savedItems.Tax_id ? Tax_setup.findOne({ Tax_setup_id: savedItems.Tax_id }) : null
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: {
        ...savedItems.toObject(),
        Category: category ? { Items_types_id: category.Items_types_id, Name: category.Name } : null,
        Tax: tax ? { Tax_setup_id: tax.Tax_setup_id, title: tax.title, rate: tax.rate } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

// Update Items
const updateItems = async (req, res) => {
  try {
    const { 
      id,
      Title,
      Description,
      image,
      Net_Price,
      Price,
      Items_types_id,
      Tax_id,
      Variants,
      Addons,
      Emozi, 
      'item-name': itemName, 
      'item-code': itemCode, 
      'item-size': itemSize, 
      'item-price': itemPrice, 
      'item-quantity': itemQuantity, 
      'item-stock-quantity': itemStockQuantity, 
      Details, 
      Status 
    } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required in request body'
      });
    }

    const items = await Items.findOne({ Items_id: parseInt(id) });
    if (!items) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Validate category if provided
    if (Items_types_id) {
      const category = await Items_types.findOne({ Items_types_id: parseInt(Items_types_id) });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Items_types_id. Category not found.'
        });
      }
      items.Items_types_id = Items_types_id;
    }

    // Validate Tax if provided
    if (Tax_id !== undefined) {
      if (Tax_id) {
        const tax = await Tax_setup.findOne({ Tax_setup_id: parseInt(Tax_id) });
        if (!tax) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Tax_id. Tax not found.'
          });
        }
      }
      items.Tax_id = Tax_id;
    }

    // Update new fields
    if (Title) items.Title = Title;
    if (Description !== undefined) items.Description = Description;
    if (image !== undefined) items.image = image;
    if (Net_Price !== undefined) items.Net_Price = Net_Price;
    if (Price !== undefined) items.Price = Price;
    if (Variants !== undefined) items.Variants = Variants;
    if (Addons !== undefined) items.Addons = Addons;

    // Update legacy fields
    if (Emozi) items.Emozi = Emozi;
    if (itemName) items['item-name'] = itemName;
    if (itemCode) items['item-code'] = itemCode;
    if (itemSize !== undefined) items['item-size'] = itemSize;
    if (itemPrice !== undefined) items['item-price'] = itemPrice;
    if (itemQuantity !== undefined) items['item-quantity'] = itemQuantity;
    if (itemStockQuantity !== undefined) items['item-stock-quantity'] = itemStockQuantity;
    if (Details !== undefined) items.Details = Details;
    if (Status !== undefined) items.Status = Status;
    
    items.UpdatedBy = userId;
    items.UpdatedAt = new Date();

    const updatedItems = await items.save();

    // Fetch related data for response
    const [category, tax] = await Promise.all([
      Items_types.findOne({ Items_types_id: updatedItems.Items_types_id }),
      updatedItems.Tax_id ? Tax_setup.findOne({ Tax_setup_id: updatedItems.Tax_id }) : null
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: {
        ...updatedItems.toObject(),
        Category: category ? { Items_types_id: category.Items_types_id, Name: category.Name } : null,
        Tax: tax ? { Tax_setup_id: tax.Tax_setup_id, title: tax.title, rate: tax.rate } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

// Get Items by ID
const getItemsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const items = await Items.findOne({ Items_id: parseInt(id) });
    
    if (!items) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Manually fetch related data
    const [itemsType, tax, variants, addons, createByUser, updatedByUser] = await Promise.all([
      Items_types.findOne({ Items_types_id: items.Items_types_id }),
      items.Tax_id ? Tax_setup.findOne({ Tax_setup_id: items.Tax_id }) : null,
      items.Variants && items.Variants.length > 0 
        ? item_Variants.find({ item_Variants_id: { $in: items.Variants } }) 
        : [],
      items.Addons && items.Addons.length > 0 
        ? item_Addons.find({ item_Addons_id: { $in: items.Addons } }) 
        : [],
      items.CreateBy ? User.findOne({ user_id: items.CreateBy }) : null,
      items.UpdatedBy ? User.findOne({ user_id: items.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const itemsResponse = items.toObject();
    itemsResponse.Category = itemsType ? { Items_types_id: itemsType.Items_types_id, Name: itemsType.Name, emozi: itemsType.emozi } : null;
    itemsResponse.Tax = tax ? { Tax_setup_id: tax.Tax_setup_id, title: tax.title, rate: tax.rate, type: tax.type } : null;
    itemsResponse.VariantsData = variants;
    itemsResponse.AddonsData = addons;
    itemsResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    itemsResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: itemsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message
    });
  }
};

// Get All Items
const getAllItems = async (req, res) => {
  try {
    const items = await Items.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all items
    const itemsWithPopulatedData = await Promise.all(
      items.map(async (item) => {
        const [itemsType, tax, variants, addons, createByUser, updatedByUser] = await Promise.all([
          Items_types.findOne({ Items_types_id: item.Items_types_id }),
          item.Tax_id ? Tax_setup.findOne({ Tax_setup_id: item.Tax_id }) : null,
          item.Variants && item.Variants.length > 0 
            ? item_Variants.find({ item_Variants_id: { $in: item.Variants } }) 
            : [],
          item.Addons && item.Addons.length > 0 
            ? item_Addons.find({ item_Addons_id: { $in: item.Addons } }) 
            : [],
          item.CreateBy ? User.findOne({ user_id: item.CreateBy }) : null,
          item.UpdatedBy ? User.findOne({ user_id: item.UpdatedBy }) : null
        ]);

        const itemResponse = item.toObject();
        itemResponse.Category = itemsType ? { Items_types_id: itemsType.Items_types_id, Name: itemsType.Name, emozi: itemsType.emozi } : null;
        itemResponse.Tax = tax ? { Tax_setup_id: tax.Tax_setup_id, title: tax.title, rate: tax.rate } : null;
        itemResponse.VariantsData = variants;
        itemResponse.AddonsData = addons;
        itemResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemsWithPopulatedData.length,
      data: itemsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// Delete Items
const deleteItems = async (req, res) => {
  try {
    
    const { id } = req.params;
    const items = await Items.findOne({ Items_id: parseInt(id) });
    
    if (!items) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await Items.deleteOne({ Items_id: parseInt(id) });   
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};

// Get Items by Auth (current logged in user)
const getItemsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const items = await Items.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Items not found for current user'
      });
    }

    // Manually fetch related data for all items
    const itemsResponse = await Promise.all(items.map(async (item) => {
      const [itemsType, tax, createByUser, updatedByUser] = await Promise.all([
        Items_types.findOne({ Items_types_id: item.Items_types_id }),
        item.Tax_id ? Tax_setup.findOne({ Tax_setup_id: item.Tax_id }) : null,
        item.CreateBy ? User.findOne({ user_id: item.CreateBy }) : null,
        item.UpdatedBy ? User.findOne({ user_id: item.UpdatedBy }) : null
      ]);

      const itemObj = item.toObject();
      itemObj.Category = itemsType ? 
        { Items_types_id: itemsType.Items_types_id, Name: itemsType.Name, emozi: itemsType.emozi } : null;
      itemObj.Tax = tax ? { Tax_setup_id: tax.Tax_setup_id, title: tax.title, rate: tax.rate } : null;
      itemObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      itemObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return itemObj;
    }));

    res.status(200).json({
      success: true,
      count: itemsResponse.length,
      data: itemsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// Get Items by Item Type ID (Category)
const getItemsByItemTypeId = async (req, res) => {
  try {
    const { itemTypeId } = req.params;
    
    if (!itemTypeId) {
      return res.status(400).json({
        success: false,
        message: 'Item Type ID is required'
      });
    }

    // Check if item type exists
    const itemType = await Items_types.findOne({ Items_types_id: parseInt(itemTypeId) });
    if (!itemType) {
      return res.status(404).json({
        success: false,
        message: 'Item Type not found'
      });
    }

    const items = await Items.find({ Items_types_id: parseInt(itemTypeId), Status: true })
      .sort({ CreateAt: -1 });
    
    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No items found for this category'
      });
    }

    // Manually fetch related data for all items
    const itemsWithPopulatedData = await Promise.all(
      items.map(async (item) => {
        const [tax, createByUser] = await Promise.all([
          item.Tax_id ? Tax_setup.findOne({ Tax_setup_id: item.Tax_id }) : null,
          item.CreateBy ? User.findOne({ user_id: item.CreateBy }) : null
        ]);

        const itemResponse = item.toObject();
        itemResponse.Category = { Items_types_id: itemType.Items_types_id, Name: itemType.Name, emozi: itemType.emozi };
        itemResponse.Tax = tax ? { Tax_setup_id: tax.Tax_setup_id, title: tax.title, rate: tax.rate } : null;
        itemResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name } : null;

        return itemResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemsWithPopulatedData.length,
      Category: {
        Items_types_id: itemType.Items_types_id,
        Name: itemType.Name,
        emozi: itemType.emozi
      },
      data: itemsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items by category',
      error: error.message
    });
  }
};

// Toggle Item Status
const toggleItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const item = await Items.findOne({ Items_id: parseInt(id) });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Toggle status
    item.Status = !item.Status;
    item.UpdatedBy = userId;
    item.UpdatedAt = new Date();

    const updatedItem = await item.save();
    
    res.status(200).json({
      success: true,
      message: `Item status changed to ${updatedItem.Status ? 'Active' : 'Inactive'}`,
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling item status',
      error: error.message
    });
  }
};

module.exports = {
  createItems,
  updateItems,
  getItemsById,
  getAllItems,
  getItemsByAuth,
  deleteItems,
  getItemsByItemTypeId,
  toggleItemStatus
};
