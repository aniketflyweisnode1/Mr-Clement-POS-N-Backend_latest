const Table_Booking_Status = require('../models/Table-Booking-Status.model');
const User = require('../models/User.model');

// Create Table-Booking-Status
const createTableBookingStatus = async (req, res) => {
  try {
    const { Name, Details, Status } = req.body;
    const userId = req.user.user_id;

    const tableBookingStatus = new Table_Booking_Status({
      Name,
      Details,
      Status,
      CreateBy: userId
    });

    const savedTableBookingStatus = await tableBookingStatus.save();
    
    res.status(201).json({
      success: true,
      message: 'Table booking status created successfully',
      data: savedTableBookingStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating table booking status',
      error: error.message
    });
  }
};

// Update Table-Booking-Status
const updateTableBookingStatus = async (req, res) => {
  try {
    const { id, Name, Details, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Table booking status ID is required in request body'
      });
    }

    const tableBookingStatus = await Table_Booking_Status.findOne({ 'Table-Booking-Status_id': parseInt(id) });
    if (!tableBookingStatus) {
      return res.status(404).json({
        success: false,
        message: 'Table booking status not found'
      });
    }

    if (Name) tableBookingStatus.Name = Name;
    if (Details !== undefined) tableBookingStatus.Details = Details;
    if (Status !== undefined) tableBookingStatus.Status = Status;
    
    tableBookingStatus.UpdatedBy = userId;
    tableBookingStatus.UpdatedAt = new Date();

    const updatedTableBookingStatus = await tableBookingStatus.save();
    
    res.status(200).json({
      success: true,
      message: 'Table booking status updated successfully',
      data: updatedTableBookingStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating table booking status',
      error: error.message
    });
  }
};

// Get Table-Booking-Status by ID
const getTableBookingStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tableBookingStatus = await Table_Booking_Status.findOne({ 'Table-Booking-Status_id': parseInt(id) });
    
    if (!tableBookingStatus) {
      return res.status(404).json({
        success: false,
        message: 'Table booking status not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      tableBookingStatus.CreateBy ? User.findOne({ user_id: tableBookingStatus.CreateBy }) : null,
      tableBookingStatus.UpdatedBy ? User.findOne({ user_id: tableBookingStatus.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const tableBookingStatusResponse = tableBookingStatus.toObject();
    tableBookingStatusResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    tableBookingStatusResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: tableBookingStatusResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table booking status',
      error: error.message
    });
  }
};

// Get All Table-Booking-Status
const getAllTableBookingStatus = async (req, res) => {
  try {
    const tableBookingStatuses = await Table_Booking_Status.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all table booking statuses
    const tableBookingStatusesWithPopulatedData = await Promise.all(
      tableBookingStatuses.map(async (tableBookingStatus) => {
        const [createByUser, updatedByUser] = await Promise.all([
          tableBookingStatus.CreateBy ? User.findOne({ user_id: tableBookingStatus.CreateBy }) : null,
          tableBookingStatus.UpdatedBy ? User.findOne({ user_id: tableBookingStatus.UpdatedBy }) : null
        ]);

        const tableBookingStatusResponse = tableBookingStatus.toObject();
        tableBookingStatusResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        tableBookingStatusResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return tableBookingStatusResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: tableBookingStatusesWithPopulatedData.length,
      data: tableBookingStatusesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table booking statuses',
      error: error.message
    });
  }
};

// Delete Table Booking Status
const deleteTableBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tableBookingStatus = await Table_Booking_Status.findOne({ 'Table-Booking-Status_id': parseInt(id) });
    
    if (!tableBookingStatus) {
      return res.status(404).json({
        success: false,
        message: 'Table booking status not found'
      });
    }

    await Table_Booking_Status.deleteOne({ 'Table-Booking-Status_id': parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Table booking status deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting table booking status',
      error: error.message
    });
  }
};

// Get Table Booking Status by Auth (current logged in user)
const getTableBookingStatusByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const tableBookingStatuses = await Table_Booking_Status.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!tableBookingStatuses || tableBookingStatuses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Table booking statuses not found for current user'
      });
    }

    // Manually fetch related data for all table booking statuses
    const tableBookingStatusesResponse = await Promise.all(tableBookingStatuses.map(async (tableBookingStatus) => {
      const [createByUser, updatedByUser] = await Promise.all([
        tableBookingStatus.CreateBy ? User.findOne({ user_id: tableBookingStatus.CreateBy }) : null,
        tableBookingStatus.UpdatedBy ? User.findOne({ user_id: tableBookingStatus.UpdatedBy }) : null
      ]);

      const tableBookingStatusObj = tableBookingStatus.toObject();
      tableBookingStatusObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      tableBookingStatusObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return tableBookingStatusObj;
    }));

    res.status(200).json({
      success: true,
      count: tableBookingStatusesResponse.length,
      data: tableBookingStatusesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table booking statuses',
      error: error.message
    });
  }
};

// Get Table Booking Status by Auth (current logged in user) - for table booking route
const getTableBookingStatusByAuthForBooking = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const tableBookingStatuses = await Table_Booking_Status.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!tableBookingStatuses || tableBookingStatuses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Table booking statuses not found for current user'
      });
    }

    // Manually fetch related data for all table booking statuses
    const tableBookingStatusesResponse = await Promise.all(tableBookingStatuses.map(async (tableBookingStatus) => {
      const [createByUser, updatedByUser] = await Promise.all([
        tableBookingStatus.CreateBy ? User.findOne({ user_id: tableBookingStatus.CreateBy }) : null,
        tableBookingStatus.UpdatedBy ? User.findOne({ user_id: tableBookingStatus.UpdatedBy }) : null
      ]);

      const tableBookingStatusObj = tableBookingStatus.toObject();
      tableBookingStatusObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      tableBookingStatusObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return tableBookingStatusObj;
    }));

    res.status(200).json({
      success: true,
      count: tableBookingStatusesResponse.length,
      data: tableBookingStatusesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table booking statuses',
      error: error.message
    });
  }
};

module.exports = {
  createTableBookingStatus,
  updateTableBookingStatus,
  getTableBookingStatusById,
  getAllTableBookingStatus,
  getTableBookingStatusByAuth,
  getTableBookingStatusByAuthForBooking,
  deleteTableBookingStatus
};
