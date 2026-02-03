const Kitchen = require('../models/Kitchen.model');
const Kitchen_type = require('../models/Kitchen_type.model');
const User = require('../models/User.model');

// Create kitchen
const createKitchen = async (req, res) => {
  try {
    const { Kitchen_type_id, emozi, Name, token, working_user_id, Status } = req.body;
    const userId = req.user.user_id;

    const kitchen = new Kitchen({
      Kitchen_type_id,
      emozi,
      Name,
      token,
      working_user_id,
      Status,
      CreateBy: userId
    });

    const savedKitchen = await kitchen.save();
    
    res.status(201).json({
      success: true,
      message: 'Kitchen created successfully',
      data: savedKitchen
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating kitchen',
      error: error.message
    });
  }
};

// Update kitchen
const updateKitchen = async (req, res) => {
  try {
    const { id, Kitchen_type_id, emozi, Name, token, working_user_id, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Kitchen ID is required in request body'
      });
    }

    const kitchen = await Kitchen.findOne({ Kitchen_id: parseInt(id) });
    if (!kitchen) {
      return res.status(404).json({
        success: false,
        message: 'Kitchen not found'
      });
    }

    if (Kitchen_type_id !== undefined) kitchen.Kitchen_type_id = Kitchen_type_id;
    if (emozi !== undefined) kitchen.emozi = emozi;
    if (Name !== undefined) kitchen.Name = Name;
    if (token !== undefined) kitchen.token = token;
    if (working_user_id !== undefined) kitchen.working_user_id = working_user_id;
    if (Status !== undefined) kitchen.Status = Status;
    
    kitchen.UpdatedBy = userId;
    kitchen.UpdatedAt = new Date();

    const updatedKitchen = await kitchen.save();
    
    res.status(200).json({
      success: true,
      message: 'Kitchen updated successfully',
      data: updatedKitchen
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating kitchen',
      error: error.message
    });
  }
};

// Get kitchen by ID
const getKitchenById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kitchen = await Kitchen.findOne({ Kitchen_id: parseInt(id) });
    
    if (!kitchen) {
      return res.status(404).json({
        success: false,
        message: 'Kitchen not found'
      });
    }

    // Manually fetch related data
    const [kitchenType, workingUser, createByUser, updatedByUser] = await Promise.all([
      Kitchen_type.findOne({ Kitchen_type_id: kitchen.Kitchen_type_id }),
      User.findOne({ user_id: kitchen.working_user_id }),
      kitchen.CreateBy ? User.findOne({ user_id: kitchen.CreateBy }) : null,
      kitchen.UpdatedBy ? User.findOne({ user_id: kitchen.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const kitchenResponse = kitchen.toObject();
    kitchenResponse.Kitchen_type_id = kitchenType ? { Kitchen_type_id: kitchenType.Kitchen_type_id, Name: kitchenType.Name, Emozi: kitchenType.Emozi } : null;
    kitchenResponse.working_user_id = workingUser ? { user_id: workingUser.user_id, Name: workingUser.Name, email: workingUser.email } : null;
    kitchenResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    kitchenResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: kitchenResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching kitchen',
      error: error.message
    });
  }
};

// Get all kitchens
// Get all kitchens with optional search
const getAllKitchens = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    // Apply search filter if search query exists
    if (search) {
      filter = {
        $or: [
          { Name: { $regex: search, $options: 'i' } },          // Kitchen Name
          { emozi: { $regex: search, $options: 'i' } },         // Emoji
          { token: { $regex: search, $options: 'i' } },         // Token
          { Kitchen_id: Number(search) || -1 },                 // Kitchen ID
          { Kitchen_type_id: Number(search) || -1 },            // Kitchen Type ID
          { working_user_id: Number(search) || -1 }             // Working User ID
        ]
      };
    }

    const kitchens = await Kitchen.find(filter).sort({ CreateAt: -1 });

    // Populate related data manually
    const kitchensWithPopulatedData = await Promise.all(
      kitchens.map(async (kitchen) => {
        const [kitchenType, workingUser, createByUser, updatedByUser] =
          await Promise.all([
            Kitchen_type.findOne({ Kitchen_type_id: kitchen.Kitchen_type_id }),
            User.findOne({ user_id: kitchen.working_user_id }),
            kitchen.CreateBy
              ? User.findOne({ user_id: kitchen.CreateBy })
              : null,
            kitchen.UpdatedBy
              ? User.findOne({ user_id: kitchen.UpdatedBy })
              : null
          ]);

        const kitchenResponse = kitchen.toObject();

        kitchenResponse.Kitchen_type_id = kitchenType
          ? {
              Kitchen_type_id: kitchenType.Kitchen_type_id,
              Name: kitchenType.Name,
              Emozi: kitchenType.Emozi
            }
          : null;

        kitchenResponse.working_user_id = workingUser
          ? {
              user_id: workingUser.user_id,
              Name: workingUser.Name,
              email: workingUser.email
            }
          : null;

        kitchenResponse.CreateBy = createByUser
          ? {
              user_id: createByUser.user_id,
              Name: createByUser.Name,
              email: createByUser.email
            }
          : null;

        kitchenResponse.UpdatedBy = updatedByUser
          ? {
              user_id: updatedByUser.user_id,
              Name: updatedByUser.Name,
              email: updatedByUser.email
            }
          : null;

        return kitchenResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: kitchensWithPopulatedData.length,
      data: kitchensWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching kitchens',
      error: error.message
    });
  }
};


// Delete Kitchen
const deleteKitchen = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kitchen = await Kitchen.findOne({ Kitchen_id: parseInt(id) });
    
    if (!kitchen) {
      return res.status(404).json({
        success: false,
        message: 'Kitchen not found'
      });
    }

    await Kitchen.deleteOne({ Kitchen_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Kitchen deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting kitchen',
      error: error.message
    });
  }
};

// Get Kitchen by Auth (current logged in user)
const getKitchenByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const kitchens = await Kitchen.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!kitchens || kitchens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kitchens not found for current user'
      });
    }

    // Manually fetch related data for all kitchens
    const kitchensResponse = await Promise.all(kitchens.map(async (kitchen) => {
      const [createByUser, updatedByUser] = await Promise.all([
        kitchen.CreateBy ? User.findOne({ user_id: kitchen.CreateBy }) : null,
        kitchen.UpdatedBy ? User.findOne({ user_id: kitchen.UpdatedBy }) : null
      ]);

      const kitchenObj = kitchen.toObject();
      kitchenObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      kitchenObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return kitchenObj;
    }));

    res.status(200).json({
      success: true,
      count: kitchensResponse.length,
      data: kitchensResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching kitchens',
      error: error.message
    });
  }
};

module.exports = {
  createKitchen,
  updateKitchen,
  getKitchenById,
  getAllKitchens,
  getKitchenByAuth,
  deleteKitchen
};
