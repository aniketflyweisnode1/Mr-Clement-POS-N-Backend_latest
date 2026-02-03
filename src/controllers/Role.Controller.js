const Role = require('../models/Role.model');
const User = require('../models/User.model');

// Create Role
const createRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    const userId = req.user.user_id; // From auth middleware

    const role = new Role({
      role_name,
      CreateBy: userId
    });

    const savedRole = await role.save();
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: savedRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { id, role_name, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Role ID is required in request body'
      });
    }

    const role = await Role.findOne({ Role_id: parseInt(id) });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    role.role_name = role_name || role.role_name;
    role.Status = Status !== undefined ? Status : role.Status;
    role.UpdatedBy = userId;
    role.UpdatedAt = new Date();

    const updatedRole = await role.save();
    
    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
};

// Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findOne({ Role_id: parseInt(id) });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      role.CreateBy ? User.findOne({ user_id: role.CreateBy }) : null,
      role.UpdatedBy ? User.findOne({ user_id: role.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const roleResponse = role.toObject();
    roleResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    roleResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: roleResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    });
  }
};

// Get All Roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all roles
    const rolesWithPopulatedData = await Promise.all(
      roles.map(async (role) => {
        const [createByUser, updatedByUser] = await Promise.all([
          role.CreateBy ? User.findOne({ user_id: role.CreateBy }) : null,
          role.UpdatedBy ? User.findOne({ user_id: role.UpdatedBy }) : null
        ]);

        const roleResponse = role.toObject();
        roleResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        roleResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return roleResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: rolesWithPopulatedData.length,
      data: rolesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findOne({ Role_id: parseInt(id) });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await Role.deleteOne({ Role_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
};

// Get Role by Auth (current logged in user)
const getRoleByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const roles = await Role.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!roles || roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Roles not found for current user'
      });
    }

    // Manually fetch related data for all roles
    const rolesResponse = await Promise.all(roles.map(async (role) => {
      const [createByUser, updatedByUser] = await Promise.all([
        role.CreateBy ? User.findOne({ user_id: role.CreateBy }) : null,
        role.UpdatedBy ? User.findOne({ user_id: role.UpdatedBy }) : null
      ]);

      const roleObj = role.toObject();
      roleObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      roleObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return roleObj;
    }));

    res.status(200).json({
      success: true,
      count: rolesResponse.length,
      data: rolesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
};

module.exports = {
  createRole,
  updateRole,
  getRoleById,
  getAllRoles,
  getRoleByAuth,
  deleteRole
};
