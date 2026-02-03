const Table_types = require('../models/Table_types.model');
const User = require('../models/User.model');

// Create Table_types
const createTableTypes = async (req, res) => {
  try {
    const { emozi, image, Name, details, table_size, Status } = req.body;
    const userId = req.user.user_id;

    const tableTypes = new Table_types({
      emozi,
      image,
      Name,
      details,
      table_size,
      Status,
      CreateBy: userId
    });

    const savedTableTypes = await tableTypes.save();
    
    res.status(201).json({
      success: true,
      message: 'Table type created successfully',
      data: savedTableTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating table type',
      error: error.message
    });
  }
};

// Update Table_types
const updateTableTypes = async (req, res) => {
  try {
    const { id, emozi, image, Name, details, table_size, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Table type ID is required in request body'
      });
    }

    const tableTypes = await Table_types.findOne({ Table_types_id: parseInt(id) });
    if (!tableTypes) {
      return res.status(404).json({
        success: false,
        message: 'Table type not found'
      });
    }

    if (emozi) tableTypes.emozi = emozi;
    if (image !== undefined) tableTypes.image = image;
    if (Name) tableTypes.Name = Name;
    if (details !== undefined) tableTypes.details = details;
    if (table_size !== undefined) tableTypes.table_size = table_size;
    if (Status !== undefined) tableTypes.Status = Status;
    
    tableTypes.UpdatedBy = userId;
    tableTypes.UpdatedAt = new Date();

    const updatedTableTypes = await tableTypes.save();
    
    res.status(200).json({
      success: true,
      message: 'Table type updated successfully',
      data: updatedTableTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating table type',
      error: error.message
    });
  }
};

// Get Table_types by ID
const getTableTypesById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tableTypes = await Table_types.findOne({ Table_types_id: parseInt(id) });
    
    if (!tableTypes) {
      return res.status(404).json({
        success: false,
        message: 'Table type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      tableTypes.CreateBy ? User.findOne({ user_id: tableTypes.CreateBy }) : null,
      tableTypes.UpdatedBy ? User.findOne({ user_id: tableTypes.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const tableTypesResponse = tableTypes.toObject();
    tableTypesResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    tableTypesResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: tableTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table type',
      error: error.message
    });
  }
};

// Get All Table_types
const getAllTableTypes = async (req, res) => {
  try {
    const tableTypes = await Table_types.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all table types
    const tableTypesWithPopulatedData = await Promise.all(
      tableTypes.map(async (tableType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          tableType.CreateBy ? User.findOne({ user_id: tableType.CreateBy }) : null,
          tableType.UpdatedBy ? User.findOne({ user_id: tableType.UpdatedBy }) : null
        ]);

        const tableTypeResponse = tableType.toObject();
        tableTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        tableTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return tableTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: tableTypesWithPopulatedData.length,
      data: tableTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table types',
      error: error.message
    });
  }
};

// Get Table_types by Auth User
const getTableTypesByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const tableTypes = await Table_types.find({ 
      CreateBy: userId,
      Status: true 
    })
    .sort({ CreateAt: -1 });

    // Manually fetch related data for all table types
    const tableTypesWithPopulatedData = await Promise.all(
      tableTypes.map(async (tableType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          tableType.CreateBy ? User.findOne({ user_id: tableType.CreateBy }) : null,
          tableType.UpdatedBy ? User.findOne({ user_id: tableType.UpdatedBy }) : null
        ]);

        const tableTypeResponse = tableType.toObject();
        tableTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        tableTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return tableTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: tableTypesWithPopulatedData.length,
      data: tableTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table types by auth user',
      error: error.message
    });
  }
};

// Delete Table Types
const deleteTableTypes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tableTypes = await Table_types.findOne({ Table_types_id: parseInt(id) });
    
    if (!tableTypes) {
      return res.status(404).json({
        success: false,
        message: 'Table type not found'
      });
    }

    await Table_types.deleteOne({ Table_types_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Table type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting table type',
      error: error.message
    });
  }
};

module.exports = {
  createTableTypes,
  updateTableTypes,
  getTableTypesById,
  getAllTableTypes,
  getTableTypesByAuth,
  deleteTableTypes
};
