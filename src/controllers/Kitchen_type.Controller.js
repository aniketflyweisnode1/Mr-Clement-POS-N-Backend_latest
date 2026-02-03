const Kitchen_type = require('../models/Kitchen_type.model');
const User = require('../models/User.model');

// Create kitchen type
const createKitchenType = async (req, res) => {
  try {
    const { Emozi, Name, Status } = req.body;
    const userId = req.user.user_id;

    const kitchenType = new Kitchen_type({
      Emozi,
      Name,
      Status,
      CreateBy: userId
    });

    const savedKitchenType = await kitchenType.save();
    
    res.status(201).json({
      success: true,
      message: 'Kitchen type created successfully',
      data: savedKitchenType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating kitchen type',
      error: error.message
    });
  }
};

// Update kitchen type
const updateKitchenType = async (req, res) => {
  try {
    const { id, Emozi, Name, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Kitchen type ID is required in request body'
      });
    }

    const kitchenType = await Kitchen_type.findOne({ Kitchen_type_id: parseInt(id) });
    if (!kitchenType) {
      return res.status(404).json({
        success: false,
        message: 'Kitchen type not found'
      });
    }

    if (Emozi !== undefined) kitchenType.Emozi = Emozi;
    if (Name !== undefined) kitchenType.Name = Name;
    if (Status !== undefined) kitchenType.Status = Status;
    
    kitchenType.UpdatedBy = userId;
    kitchenType.UpdatedAt = new Date();

    const updatedKitchenType = await kitchenType.save();
    
    res.status(200).json({
      success: true,
      message: 'Kitchen type updated successfully',
      data: updatedKitchenType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating kitchen type',
      error: error.message
    });
  }
};

// Get kitchen type by ID
const getKitchenTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kitchenType = await Kitchen_type.findOne({ Kitchen_type_id: parseInt(id) });
    
    if (!kitchenType) {
      return res.status(404).json({
        success: false,
        message: 'Kitchen type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      kitchenType.CreateBy ? User.findOne({ user_id: kitchenType.CreateBy }) : null,
      kitchenType.UpdatedBy ? User.findOne({ user_id: kitchenType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const kitchenTypeResponse = kitchenType.toObject();
    kitchenTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    kitchenTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: kitchenTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching kitchen type',
      error: error.message
    });
  }
};

// Get all kitchen types with optional search
const getAllKitchenTypes = async (req, res) => {
  try {
    const { search } = req.query;

    // Default filter (get all)
    let filter = {};

    // If search exists, apply search filter
    if (search) {
      filter = {
        $or: [
          { Name: { $regex: search, $options: 'i' } },      // search by Name
          { Emozi: { $regex: search, $options: 'i' } },     // search by Emoji
          { Kitchen_type_id: Number(search) || -1 },        // search by ID
        ]
      };
    }

    const kitchenTypes = await Kitchen_type.find(filter)
      .sort({ CreateAt: -1 });

    // Populate CreateBy & UpdatedBy manually
    const kitchenTypesWithPopulatedData = await Promise.all(
      kitchenTypes.map(async (kitchenType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          kitchenType.CreateBy
            ? User.findOne({ user_id: kitchenType.CreateBy })
            : null,
          kitchenType.UpdatedBy
            ? User.findOne({ user_id: kitchenType.UpdatedBy })
            : null
        ]);

        const kitchenTypeResponse = kitchenType.toObject();

        kitchenTypeResponse.CreateBy = createByUser
          ? {
              user_id: createByUser.user_id,
              Name: createByUser.Name,
              email: createByUser.email
            }
          : null;

        kitchenTypeResponse.UpdatedBy = updatedByUser
          ? {
              user_id: updatedByUser.user_id,
              Name: updatedByUser.Name,
              email: updatedByUser.email
            }
          : null;

        return kitchenTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: kitchenTypesWithPopulatedData.length,
      data: kitchenTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching kitchen types',
      error: error.message
    });
  }
};


// Delete Kitchen Type
const deleteKitchenType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kitchenType = await Kitchen_type.findOne({ Kitchen_type_id: parseInt(id) });
    
    if (!kitchenType) {
      return res.status(404).json({
        success: false,
        message: 'Kitchen type not found'
      });
    }

    await Kitchen_type.deleteOne({ Kitchen_type_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Kitchen type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting kitchen type',
      error: error.message
    });
  }
};

// Get Kitchen Type by Auth (current logged in user)
const getKitchenTypeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const kitchenTypes = await Kitchen_type.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!kitchenTypes || kitchenTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kitchen types not found for current user'
      });
    }

    // Manually fetch related data for all kitchen types
    const kitchenTypesResponse = await Promise.all(kitchenTypes.map(async (kitchenType) => {
      const [createByUser, updatedByUser] = await Promise.all([
        kitchenType.CreateBy ? User.findOne({ user_id: kitchenType.CreateBy }) : null,
        kitchenType.UpdatedBy ? User.findOne({ user_id: kitchenType.UpdatedBy }) : null
      ]);

      const kitchenTypeObj = kitchenType.toObject();
      kitchenTypeObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      kitchenTypeObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return kitchenTypeObj;
    }));

    res.status(200).json({
      success: true,
      count: kitchenTypesResponse.length,
      data: kitchenTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching kitchen types',
      error: error.message
    });
  }
};

module.exports = {
  createKitchenType,
  updateKitchenType,
  getKitchenTypeById,
  getAllKitchenTypes,
  getKitchenTypeByAuth,
  deleteKitchenType
};
