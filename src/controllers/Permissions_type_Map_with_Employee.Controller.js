const Permissions_type_Map_with_Employee = require('../models/Permissions_type_Map_with_Employee.model');
const User = require('../models/User.model');
const Permissions_type = require('../models/Permissions_type.model');

// Create permissions type map with employee
const createPermissionsTypeMapWithEmployee = async (req, res) => {
  try {
    console.log(req.body);
    const { Permissions_type_id, user_id, Status } = req.body;
    const userId = req.user.user_id;

    const permissionsTypeMapWithEmployee = new Permissions_type_Map_with_Employee({
      Permissions_type_id,
      user_id,
      Status,
      CreateBy: userId
    });

    const savedPermissionsTypeMapWithEmployee = await permissionsTypeMapWithEmployee.save();
    
    res.status(201).json({
      success: true,
      message: 'Permissions type map with employee created successfully',
      data: savedPermissionsTypeMapWithEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating permissions type map with employee',
      error: error.message
    });
  }
};

// Update permissions type map with employee
const updatePermissionsTypeMapWithEmployee = async (req, res) => {
  try {
    const { id, Permissions_type_id, user_id, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Permissions type map with employee ID is required in request body'
      });
    }

    const permissionsTypeMapWithEmployee = await Permissions_type_Map_with_Employee.findOne({ 
      Permissions_type_Map_with_Employee_id: parseInt(id) 
    });
    
    if (!permissionsTypeMapWithEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Permissions type map with employee not found'
      });
    }

    if (Permissions_type_id !== undefined) permissionsTypeMapWithEmployee.Permissions_type_id = Permissions_type_id;
    if (user_id !== undefined) permissionsTypeMapWithEmployee.user_id = user_id;
    if (Status !== undefined) permissionsTypeMapWithEmployee.Status = Status;
    
    permissionsTypeMapWithEmployee.UpdatedBy = userId;
    permissionsTypeMapWithEmployee.UpdatedAt = new Date();

    const updatedPermissionsTypeMapWithEmployee = await permissionsTypeMapWithEmployee.save();
    
    res.status(200).json({
      success: true,
      message: 'Permissions type map with employee updated successfully',
      data: updatedPermissionsTypeMapWithEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating permissions type map with employee',
      error: error.message
    });
  }
};

// Get permissions type map with employee by ID
const getPermissionsTypeMapWithEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const permissionsTypeMapWithEmployee = await Permissions_type_Map_with_Employee.findOne({ 
      Permissions_type_Map_with_Employee_id: parseInt(id) 
    });
    
    if (!permissionsTypeMapWithEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Permissions type map with employee not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, permissionsTypeData, userData] = await Promise.all([
      permissionsTypeMapWithEmployee.CreateBy ? User.findOne({ user_id: permissionsTypeMapWithEmployee.CreateBy }) : null,
      permissionsTypeMapWithEmployee.UpdatedBy ? User.findOne({ user_id: permissionsTypeMapWithEmployee.UpdatedBy }) : null,
      permissionsTypeMapWithEmployee.Permissions_type_id ? Permissions_type.findOne({ Permissions_type_id: permissionsTypeMapWithEmployee.Permissions_type_id }) : null,
      permissionsTypeMapWithEmployee.user_id ? User.findOne({ user_id: permissionsTypeMapWithEmployee.user_id }) : null
    ]);

    // Create response object with populated data
    const permissionsTypeMapWithEmployeeResponse = permissionsTypeMapWithEmployee.toObject();
    permissionsTypeMapWithEmployeeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    permissionsTypeMapWithEmployeeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    permissionsTypeMapWithEmployeeResponse.Permissions_type_id = permissionsTypeData ? { Permissions_type_id: permissionsTypeData.Permissions_type_id, Permissions_Name: permissionsTypeData.Permissions_Name } : null;
    permissionsTypeMapWithEmployeeResponse.user_id = userData ? { user_id: userData.user_id, Name: userData.Name, email: userData.email } : null;

    res.status(200).json({
      success: true,
      data: permissionsTypeMapWithEmployeeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions type map with employee',
      error: error.message
    });
  }
};

// Get all permissions type map with employee
const getAllPermissionsTypeMapWithEmployee = async (req, res) => {
  try {
    const permissionsTypeMapWithEmployees = await Permissions_type_Map_with_Employee.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all permissions type map with employee
    const permissionsTypeMapWithEmployeesWithPopulatedData = await Promise.all(
      permissionsTypeMapWithEmployees.map(async (permissionsTypeMapWithEmployee) => {
        const [createByUser, updatedByUser, permissionsTypeData, userData] = await Promise.all([
          permissionsTypeMapWithEmployee.CreateBy ? User.findOne({ user_id: permissionsTypeMapWithEmployee.CreateBy }) : null,
          permissionsTypeMapWithEmployee.UpdatedBy ? User.findOne({ user_id: permissionsTypeMapWithEmployee.UpdatedBy }) : null,
          permissionsTypeMapWithEmployee.Permissions_type_id ? Permissions_type.findOne({ Permissions_type_id: permissionsTypeMapWithEmployee.Permissions_type_id }) : null,
          permissionsTypeMapWithEmployee.user_id ? User.findOne({ user_id: permissionsTypeMapWithEmployee.user_id }) : null
        ]);

        const permissionsTypeMapWithEmployeeResponse = permissionsTypeMapWithEmployee.toObject();
        permissionsTypeMapWithEmployeeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        permissionsTypeMapWithEmployeeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        permissionsTypeMapWithEmployeeResponse.Permissions_type_id = permissionsTypeData ? { Permissions_type_id: permissionsTypeData.Permissions_type_id, Permissions_Name: permissionsTypeData.Permissions_Name } : null;
        permissionsTypeMapWithEmployeeResponse.user_id = userData ? { user_id: userData.user_id, Name: userData.Name, email: userData.email } : null;

        return permissionsTypeMapWithEmployeeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: permissionsTypeMapWithEmployeesWithPopulatedData.length,
      data: permissionsTypeMapWithEmployeesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions type map with employee',
      error: error.message
    });
  }
};

// Get permissions type map with employee by authenticated user
const getPermissionsTypeMapWithEmployeeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const permissionsTypeMapWithEmployees = await Permissions_type_Map_with_Employee.find({ CreateBy: userId })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all permissions type map with employee
    const permissionsTypeMapWithEmployeesWithPopulatedData = await Promise.all(
      permissionsTypeMapWithEmployees.map(async (permissionsTypeMapWithEmployee) => {
        const [createByUser, updatedByUser, permissionsTypeData, userData] = await Promise.all([
          permissionsTypeMapWithEmployee.CreateBy ? User.findOne({ user_id: permissionsTypeMapWithEmployee.CreateBy }) : null,
          permissionsTypeMapWithEmployee.UpdatedBy ? User.findOne({ user_id: permissionsTypeMapWithEmployee.UpdatedBy }) : null,
          permissionsTypeMapWithEmployee.Permissions_type_id ? Permissions_type.findOne({ Permissions_type_id: permissionsTypeMapWithEmployee.Permissions_type_id }) : null,
          permissionsTypeMapWithEmployee.user_id ? User.findOne({ user_id: permissionsTypeMapWithEmployee.user_id }) : null
        ]);

        const permissionsTypeMapWithEmployeeResponse = permissionsTypeMapWithEmployee.toObject();
        permissionsTypeMapWithEmployeeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        permissionsTypeMapWithEmployeeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        permissionsTypeMapWithEmployeeResponse.Permissions_type_id = permissionsTypeData ? { Permissions_type_id: permissionsTypeData.Permissions_type_id, Permissions_Name: permissionsTypeData.Permissions_Name } : null;
        permissionsTypeMapWithEmployeeResponse.user_id = userData ? { user_id: userData.user_id, Name: userData.Name, email: userData.email } : null;

        return permissionsTypeMapWithEmployeeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: permissionsTypeMapWithEmployeesWithPopulatedData.length,
      data: permissionsTypeMapWithEmployeesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions type map with employee by auth',
      error: error.message
    });
  }
};

// Delete Permissions Type Map with Employee
const deletePermissionsTypeMapWithEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const permissionsTypeMapWithEmployee = await Permissions_type_Map_with_Employee.findOne({ 
      Permissions_type_Map_with_Employee_id: parseInt(id) 
    });
    
    if (!permissionsTypeMapWithEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Permissions type map with employee not found'
      });
    }

    await Permissions_type_Map_with_Employee.deleteOne({ 
      Permissions_type_Map_with_Employee_id: parseInt(id) 
    });
    
    res.status(200).json({
      success: true,
      message: 'Permissions type map with employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting permissions type map with employee',
      error: error.message
    });
  }
};

module.exports = {
  createPermissionsTypeMapWithEmployee,
  updatePermissionsTypeMapWithEmployee,
  getPermissionsTypeMapWithEmployeeById,
  getAllPermissionsTypeMapWithEmployee,
  getPermissionsTypeMapWithEmployeeByAuth,
  deletePermissionsTypeMapWithEmployee
};
