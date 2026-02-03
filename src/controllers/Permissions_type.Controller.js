const Permissions_type = require('../models/Permissions_type.model');
const User = require('../models/User.model');

// Create permissions type
const createPermissionsType = async (req, res) => {
  try {
    console.log(req.body);
    const { Permissions_Name, Status } = req.body;
    const userId = req.user.user_id;

    const permissionsType = new Permissions_type({
      Permissions_Name,
      Status,
      CreateBy: userId
    });

    const savedPermissionsType = await permissionsType.save();
    
    res.status(201).json({
      success: true,
      message: 'Permissions type created successfully',
      data: savedPermissionsType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating permissions type',
      error: error.message
    });
  }
};

// Update permissions type
const updatePermissionsType = async (req, res) => {
  try {
    const { id, Permissions_Name, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Permissions type ID is required in request body'
      });
    }

    const permissionsType = await Permissions_type.findOne({ Permissions_type_id: parseInt(id) });
    if (!permissionsType) {
      return res.status(404).json({
        success: false,
        message: 'Permissions type not found'
      });
    }

    if (Permissions_Name !== undefined) permissionsType.Permissions_Name = Permissions_Name;
    if (Status !== undefined) permissionsType.Status = Status;
    
    permissionsType.UpdatedBy = userId;
    permissionsType.UpdatedAt = new Date();

    const updatedPermissionsType = await permissionsType.save();
    
    res.status(200).json({
      success: true,
      message: 'Permissions type updated successfully',
      data: updatedPermissionsType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating permissions type',
      error: error.message
    });
  }
};

// Get permissions type by ID
const getPermissionsTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const permissionsType = await Permissions_type.findOne({ Permissions_type_id: parseInt(id) });
    
    if (!permissionsType) {
      return res.status(404).json({
        success: false,
        message: 'Permissions type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      permissionsType.CreateBy ? User.findOne({ user_id: permissionsType.CreateBy }) : null,
      permissionsType.UpdatedBy ? User.findOne({ user_id: permissionsType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const permissionsTypeResponse = permissionsType.toObject();
    permissionsTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    permissionsTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: permissionsTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions type',
      error: error.message
    });
  }
};

// Get all permissions types
const getAllPermissionsTypes = async (req, res) => {
  try {
    const permissionsTypes = await Permissions_type.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all permissions types
    const permissionsTypesWithPopulatedData = await Promise.all(
      permissionsTypes.map(async (permissionsType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          permissionsType.CreateBy ? User.findOne({ user_id: permissionsType.CreateBy }) : null,
          permissionsType.UpdatedBy ? User.findOne({ user_id: permissionsType.UpdatedBy }) : null
        ]);

        const permissionsTypeResponse = permissionsType.toObject();
        permissionsTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        permissionsTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return permissionsTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: permissionsTypesWithPopulatedData.length,
      data: permissionsTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions types',
      error: error.message
    });
  }
};

// Get permissions types by authenticated user
const getPermissionsTypesByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const permissionsTypes = await Permissions_type.find({ CreateBy: userId })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all permissions types
    const permissionsTypesWithPopulatedData = await Promise.all(
      permissionsTypes.map(async (permissionsType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          permissionsType.CreateBy ? User.findOne({ user_id: permissionsType.CreateBy }) : null,
          permissionsType.UpdatedBy ? User.findOne({ user_id: permissionsType.UpdatedBy }) : null
        ]);

        const permissionsTypeResponse = permissionsType.toObject();
        permissionsTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        permissionsTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return permissionsTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: permissionsTypesWithPopulatedData.length,
      data: permissionsTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions types by auth',
      error: error.message
    });
  }
};

// Delete Permissions Type
const deletePermissionsType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const permissionsType = await Permissions_type.findOne({ Permissions_type_id: parseInt(id) });
    
    if (!permissionsType) {
      return res.status(404).json({
        success: false,
        message: 'Permissions type not found'
      });
    }

    await Permissions_type.deleteOne({ Permissions_type_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Permissions type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting permissions type',
      error: error.message
    });
  }
};

module.exports = {
  createPermissionsType,
  updatePermissionsType,
  getPermissionsTypeById,
  getAllPermissionsTypes,
  getPermissionsTypesByAuth,
  deletePermissionsType
};
