const SubAdmin_Permissions = require('../models/SubAdmin_Permissions.model');
const User = require('../models/User.model');
const Role = require('../models/Role.model');

// Create SubAdmin Permissions
const createSubAdminPermissions = async (req, res) => {
  try {
    const { User_id, IsPermissons, role_id } = req.body;
    const userId = req.user.user_id;

    if (!User_id) {
      return res.status(400).json({
        success: false,
        message: 'User_id is required'
      });
    }

    // Verify user exists
    const user = await User.findOne({ user_id: parseInt(User_id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if permissions already exist for this user
    const existingPermissions = await SubAdmin_Permissions.findOne({ 
      User_id: parseInt(User_id) 
    });

    if (existingPermissions) {
      return res.status(400).json({
        success: false,
        message: 'SubAdmin permissions already exist for this user'
      });
    }

    // Default permissions if not provided
    const defaultPermissions = IsPermissons || [
      { type: 'Dashboard', status: true }
    ];

    const subAdminPermissions = new SubAdmin_Permissions({
      User_id: parseInt(User_id),
      IsPermissons: defaultPermissions,
      role_id: role_id || user.Role_id,
      Status:  true,
      CreateBy: userId
    });

    const savedPermissions = await subAdminPermissions.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData, role] = await Promise.all([
      User.findOne({ user_id: savedPermissions.CreateBy }),
      savedPermissions.UpdatedBy ? User.findOne({ user_id: savedPermissions.UpdatedBy }) : null,
      User.findOne({ user_id: savedPermissions.User_id }),
      Role.findOne({ Role_id: savedPermissions.role_id })
    ]);

    const permissionsResponse = savedPermissions.toObject();
    permissionsResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    permissionsResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    permissionsResponse.User_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    permissionsResponse.role_id = role ? {
      Role_id: role.Role_id,
      role_name: role.role_name
    } : null;

    res.status(201).json({
      success: true,
      message: 'SubAdmin permissions created successfully',
      data: permissionsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating SubAdmin permissions',
      error: error.message
    });
  }
};

// Update SubAdmin Permissions
const updateSubAdminPermissions = async (req, res) => {
  try {
    const { id, IsPermissons, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'SubAdmin Permissions ID is required in request body'
      });
    }

    const subAdminPermissions = await SubAdmin_Permissions.findOne({ 
      SubAdmin_Permissions_id: parseInt(id) 
    });

    if (!subAdminPermissions) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin permissions not found'
      });
    }

    if (IsPermissons !== undefined) subAdminPermissions.IsPermissons = IsPermissons;
    if (Status !== undefined) subAdminPermissions.Status = Status;
    
    subAdminPermissions.UpdatedBy = userId;
    subAdminPermissions.UpdatedAt = new Date();

    const updatedPermissions = await subAdminPermissions.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData, role] = await Promise.all([
      User.findOne({ user_id: updatedPermissions.CreateBy }),
      User.findOne({ user_id: updatedPermissions.UpdatedBy }),
      User.findOne({ user_id: updatedPermissions.User_id }),
      Role.findOne({ Role_id: updatedPermissions.role_id })
    ]);

    const permissionsResponse = updatedPermissions.toObject();
    permissionsResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    permissionsResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    permissionsResponse.User_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    permissionsResponse.role_id = role ? {
      Role_id: role.Role_id,
      role_name: role.role_name
    } : null;

    res.status(200).json({
      success: true,
      message: 'SubAdmin permissions updated successfully',
      data: permissionsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating SubAdmin permissions',
      error: error.message
    });
  }
};

// Get SubAdmin Permissions by ID
const getSubAdminPermissionsById = async (req, res) => {
  try {
    const { id } = req.params;

    const subAdminPermissions = await SubAdmin_Permissions.findOne({ 
      SubAdmin_Permissions_id: parseInt(id) 
    });

    if (!subAdminPermissions) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin permissions not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, userData, role] = await Promise.all([
      User.findOne({ user_id: subAdminPermissions.CreateBy }),
      subAdminPermissions.UpdatedBy ? User.findOne({ user_id: subAdminPermissions.UpdatedBy }) : null,
      User.findOne({ user_id: subAdminPermissions.User_id }),
      Role.findOne({ Role_id: subAdminPermissions.role_id })
    ]);

    const permissionsResponse = subAdminPermissions.toObject();
    permissionsResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    permissionsResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    permissionsResponse.User_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    permissionsResponse.role_id = role ? {
      Role_id: role.Role_id,
      role_name: role.role_name
    } : null;

    res.status(200).json({
      success: true,
      data: permissionsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SubAdmin permissions',
      error: error.message
    });
  }
};

// Get All SubAdmin Permissions
const getAllSubAdminPermissions = async (req, res) => {
  try {
    const subAdminPermissions = await SubAdmin_Permissions.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all permissions
    const permissionsWithPopulatedData = await Promise.all(
      subAdminPermissions.map(async (permission) => {
        const [createByUser, updatedByUser, userData, role] = await Promise.all([
          User.findOne({ user_id: permission.CreateBy }),
          permission.UpdatedBy ? User.findOne({ user_id: permission.UpdatedBy }) : null,
          User.findOne({ user_id: permission.User_id }),
          Role.findOne({ Role_id: permission.role_id })
        ]);

        const permissionResponse = permission.toObject();
        permissionResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        permissionResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        permissionResponse.User_id = userData ? {
          user_id: userData.user_id,
          Name: userData.Name,
          email: userData.email
        } : null;
        permissionResponse.role_id = role ? {
          Role_id: role.Role_id,
          role_name: role.role_name
        } : null;

        return permissionResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: permissionsWithPopulatedData.length,
      data: permissionsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SubAdmin permissions',
      error: error.message
    });
  }
};

// Get SubAdmin Permissions by Auth (current logged in user)
const getSubAdminPermissionsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const subAdminPermissions = await SubAdmin_Permissions.findOne({ 
      User_id: userId,
      Status: true 
    });

    if (!subAdminPermissions) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin permissions not found for current user'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, userData, role] = await Promise.all([
      User.findOne({ user_id: subAdminPermissions.CreateBy }),
      subAdminPermissions.UpdatedBy ? User.findOne({ user_id: subAdminPermissions.UpdatedBy }) : null,
      User.findOne({ user_id: subAdminPermissions.User_id }),
      Role.findOne({ Role_id: subAdminPermissions.role_id })
    ]);

    const permissionsResponse = subAdminPermissions.toObject();
    permissionsResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    permissionsResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    permissionsResponse.User_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    permissionsResponse.role_id = role ? {
      Role_id: role.Role_id,
      role_name: role.role_name
    } : null;

    res.status(200).json({
      success: true,
      data: permissionsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SubAdmin permissions',
      error: error.message
    });
  }
};

// Delete SubAdmin Permissions
const deleteSubAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const subAdminPermissions = await SubAdmin_Permissions.findOne({ 
      SubAdmin_Permissions_id: parseInt(id) 
    });

    if (!subAdminPermissions) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin permissions not found'
      });
    }

    await SubAdmin_Permissions.deleteOne({ SubAdmin_Permissions_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'SubAdmin permissions deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SubAdmin permissions',
      error: error.message
    });
  }
};

module.exports = {
  createSubAdminPermissions,
  updateSubAdminPermissions,
  getSubAdminPermissionsById,
  getAllSubAdminPermissions,
  getSubAdminPermissionsByAuth,
  deleteSubAdminPermissions
};

