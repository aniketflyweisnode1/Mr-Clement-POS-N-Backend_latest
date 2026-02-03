const Items_types = require('../models/Items_types.model');
const User = require('../models/User.model');

// Create Items_types
const createItemsTypes = async (req, res) => {
  try {
    const { emozi, image, Name, details, Status } = req.body;
    const userId = req.user.user_id;

    const itemsTypes = new Items_types({
      emozi,
      image,
      Name,
      details,
      Status,
      CreateBy: userId
    });

    const savedItemsTypes = await itemsTypes.save();
    
    res.status(201).json({
      success: true,
      message: 'Items type created successfully',
      data: savedItemsTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating items type',
      error: error.message
    });
  }
};

// Update Items_types
const updateItemsTypes = async (req, res) => {
  try {
    const { id, emozi, image, Name, details, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Items type ID is required in request body'
      });
    }

    const itemsTypes = await Items_types.findOne({ Items_types_id: parseInt(id) });
    if (!itemsTypes) {
      return res.status(404).json({
        success: false,
        message: 'Items type not found'
      });
    }

    if (emozi) itemsTypes.emozi = emozi;
    if (image !== undefined) itemsTypes.image = image;
    if (Name) itemsTypes.Name = Name;
    if (details !== undefined) itemsTypes.details = details;
    if (Status !== undefined) itemsTypes.Status = Status;
    
    itemsTypes.UpdatedBy = userId;
    itemsTypes.UpdatedAt = new Date();

    const updatedItemsTypes = await itemsTypes.save();
    
    res.status(200).json({
      success: true,
      message: 'Items type updated successfully',
      data: updatedItemsTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating items type',
      error: error.message
    });
  }
};

// Get Items_types by ID
const getItemsTypesById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemsTypes = await Items_types.findOne({ Items_types_id: parseInt(id) });
    
    if (!itemsTypes) {
      return res.status(404).json({
        success: false,
        message: 'Items type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      itemsTypes.CreateBy ? User.findOne({ user_id: itemsTypes.CreateBy }) : null,
      itemsTypes.UpdatedBy ? User.findOne({ user_id: itemsTypes.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const itemsTypesResponse = itemsTypes.toObject();
    itemsTypesResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    itemsTypesResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: itemsTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items type',
      error: error.message
    });
  }
};

// Get All Items_types
const getAllItemsTypes = async (req, res) => {
  try {
    const itemsTypes = await Items_types.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all items types
    const itemsTypesWithPopulatedData = await Promise.all(
      itemsTypes.map(async (itemType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          itemType.CreateBy ? User.findOne({ user_id: itemType.CreateBy }) : null,
          itemType.UpdatedBy ? User.findOne({ user_id: itemType.UpdatedBy }) : null
        ]);

        const itemTypeResponse = itemType.toObject();
        itemTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemsTypesWithPopulatedData.length,
      data: itemsTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items types',
      error: error.message
    });
  }
};

// Get Items_types by Auth User
const getItemsTypesByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const itemsTypes = await Items_types.find({ 
      CreateBy: userId,
      Status: true 
    })
    .sort({ CreateAt: -1 });

    // Manually fetch related data for all items types
    const itemsTypesWithPopulatedData = await Promise.all(
      itemsTypes.map(async (itemType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          itemType.CreateBy ? User.findOne({ user_id: itemType.CreateBy }) : null,
          itemType.UpdatedBy ? User.findOne({ user_id: itemType.UpdatedBy }) : null
        ]);

        const itemTypeResponse = itemType.toObject();
        itemTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        itemTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return itemTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: itemsTypesWithPopulatedData.length,
      data: itemsTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items types by auth user',
      error: error.message
    });
  }
};

// Delete Items Types
const deleteItemsTypes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemsTypes = await Items_types.findOne({ Items_types_id: parseInt(id) });
    
    if (!itemsTypes) {
      return res.status(404).json({
        success: false,
        message: 'Items type not found'
      });
    }

    await Items_types.deleteOne({ Items_types_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Items type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting items type',
      error: error.message
    });
  }
};

// Toggle Status Items Types
const toggleStatusItemsTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const itemsTypes = await Items_types.findOne({ Items_types_id: parseInt(id) });
    
    if (!itemsTypes) {
      return res.status(404).json({
        success: false,
        message: 'Items type not found'
      });
    }

    // Toggle status
    itemsTypes.Status = !itemsTypes.Status;
    itemsTypes.UpdatedBy = userId;
    itemsTypes.UpdatedAt = new Date();

    const updatedItemsTypes = await itemsTypes.save();
    
    res.status(200).json({
      success: true,
      message: `Items type status changed to ${updatedItemsTypes.Status ? 'Active' : 'Inactive'}`,
      data: updatedItemsTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling items type status',
      error: error.message
    });
  }
};

module.exports = {
  createItemsTypes,
  updateItemsTypes,
  getItemsTypesById,
  getAllItemsTypes,
  getItemsTypesByAuth,
  deleteItemsTypes,
  toggleStatusItemsTypes
};
