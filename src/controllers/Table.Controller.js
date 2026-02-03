const Table = require('../models/Table.model');
const Table_types = require('../models/Table_types.model');
const Table_Booking_Status = require('../models/Table-Booking-Status.model');
const Floor = require('../models/Floor.model');
const User = require('../models/User.model');

// Create Table
const createTable = async (req, res) => {
  try {
    const { 
      Title,
      Floor_id,
      Capacity,
      Table_types_id, 
      Emozi, 
      image, 
      'Table-name': tableName, 
      'Table-code': tableCode, 
      'Table-booking-price': tableBookingPrice, 
      'Table-Booking-Status_id': tableBookingStatusId, 
      'Seating-Persons_Count': seatingPersonsCount, 
      Details, 
      Status 
    } = req.body;
    const userId = req.user.user_id;

    // Validate Floor exists
    if (Floor_id) {
      const floor = await Floor.findOne({ Floor_id: parseInt(Floor_id) });
      if (!floor) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Floor_id. Floor not found.'
        });
      }
    }

    // Auto-generate Table-code if not provided
    const lastTable = await Table.findOne().sort({ Table_id: -1 });
    const newTableId = lastTable ? lastTable.Table_id + 1 : 1;
    const generatedTableCode = tableCode || `T-${String(newTableId).padStart(2, '0')}`;

    const table = new Table({
      Title,
      Floor_id,
      Capacity,
      Table_types_id,
      Emozi: Emozi || '🪑',
      image,
      'Table-name': tableName || Title,
      'Table-code': generatedTableCode,
      'Table-booking-price': tableBookingPrice || 0,
      'Table-Booking-Status_id': tableBookingStatusId || 1,
      'Seating-Persons_Count': seatingPersonsCount || Capacity,
      Details,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedTable = await table.save();

    // Fetch floor data for response
    const floor = await Floor.findOne({ Floor_id: savedTable.Floor_id });
    
    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: {
        ...savedTable.toObject(),
        Floor: floor ? { Floor_id: floor.Floor_id, Floor_Name: floor.Floor_Name } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating table',
      error: error.message
    });
  }
};

// Update Table
const updateTable = async (req, res) => {
  try {
    const { 
      id,
      Title,
      Floor_id,
      Capacity,
      Table_types_id, 
      Emozi, 
      image, 
      'Table-name': tableName, 
      'Table-code': tableCode, 
      'Table-booking-price': tableBookingPrice, 
      'Table-Booking-Status_id': tableBookingStatusId, 
      'Seating-Persons_Count': seatingPersonsCount, 
      Details, 
      Status 
    } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Table ID is required in request body'
      });
    }

    const table = await Table.findOne({ Table_id: parseInt(id) });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Validate Floor if provided
    if (Floor_id) {
      const floor = await Floor.findOne({ Floor_id: parseInt(Floor_id) });
      if (!floor) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Floor_id. Floor not found.'
        });
      }
      table.Floor_id = Floor_id;
    }

    if (Title) table.Title = Title;
    if (Capacity !== undefined) table.Capacity = Capacity;
    if (Table_types_id) table.Table_types_id = Table_types_id;
    if (Emozi) table.Emozi = Emozi;
    if (image !== undefined) table.image = image;
    if (tableName) table['Table-name'] = tableName;
    if (tableCode) table['Table-code'] = tableCode;
    if (tableBookingPrice !== undefined) table['Table-booking-price'] = tableBookingPrice;
    if (tableBookingStatusId) table['Table-Booking-Status_id'] = tableBookingStatusId;
    if (seatingPersonsCount !== undefined) table['Seating-Persons_Count'] = seatingPersonsCount;
    if (Details !== undefined) table.Details = Details;
    if (Status !== undefined) table.Status = Status;
    
    table.UpdatedBy = userId;
    table.UpdatedAt = new Date();

    const updatedTable = await table.save();

    // Fetch floor data for response
    const floor = await Floor.findOne({ Floor_id: updatedTable.Floor_id });
    
    res.status(200).json({
      success: true,
      message: 'Table updated successfully',
      data: {
        ...updatedTable.toObject(),
        Floor: floor ? { Floor_id: floor.Floor_id, Floor_Name: floor.Floor_Name } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating table',
      error: error.message
    });
  }
};

// Get Table by ID
const getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const table = await Table.findOne({ Table_id: parseInt(id) });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Manually fetch related data
    const [floor, tableType, tableBookingStatus, createByUser, updatedByUser] = await Promise.all([
      Floor.findOne({ Floor_id: table.Floor_id }),
      table.Table_types_id ? Table_types.findOne({ Table_types_id: table.Table_types_id }) : null,
      Table_Booking_Status.findOne({ 'Table-Booking-Status_id': table['Table-Booking-Status_id'] }),
      table.CreateBy ? User.findOne({ user_id: table.CreateBy }) : null,
      table.UpdatedBy ? User.findOne({ user_id: table.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const tableResponse = table.toObject();
    tableResponse.Floor = floor ? { Floor_id: floor.Floor_id, Floor_Name: floor.Floor_Name } : null;
    tableResponse.Table_types_id = tableType ? { Table_types_id: tableType.Table_types_id, Name: tableType.Name, emozi: tableType.emozi } : null;
    tableResponse['Table-Booking-Status_id'] = tableBookingStatus ? { 'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'], Name: tableBookingStatus.Name } : null;
    tableResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    tableResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: tableResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table',
      error: error.message
    });
  }
};

// Get All Tables
const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all tables
    const tablesWithPopulatedData = await Promise.all(
      tables.map(async (table) => {
        const [floor, tableType, tableBookingStatus, createByUser, updatedByUser] = await Promise.all([
          Floor.findOne({ Floor_id: table.Floor_id }),
          table.Table_types_id ? Table_types.findOne({ Table_types_id: table.Table_types_id }) : null,
          Table_Booking_Status.findOne({ 'Table-Booking-Status_id': table['Table-Booking-Status_id'] }),
          table.CreateBy ? User.findOne({ user_id: table.CreateBy }) : null,
          table.UpdatedBy ? User.findOne({ user_id: table.UpdatedBy }) : null
        ]);

        const tableResponse = table.toObject();
        tableResponse.Floor = floor ? { Floor_id: floor.Floor_id, Floor_Name: floor.Floor_Name } : null;
        tableResponse.Table_types_id = tableType ? { Table_types_id: tableType.Table_types_id, Name: tableType.Name, emozi: tableType.emozi } : null;
        tableResponse['Table-Booking-Status_id'] = tableBookingStatus ? { 'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'], Name: tableBookingStatus.Name } : null;
        tableResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        tableResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return tableResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: tablesWithPopulatedData.length,
      data: tablesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tables',
      error: error.message
    });
  }
};

// Delete Table
const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const table = await Table.findOne({ Table_id: parseInt(id) });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    await Table.deleteOne({ Table_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting table',
      error: error.message
    });
  }
};

// Get Table by Auth (current logged in user)
const getTableByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const tables = await Table.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!tables || tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tables not found for current user'
      });
    }

    // Manually fetch related data for all tables
    const tablesResponse = await Promise.all(tables.map(async (table) => {
      const [floor, createByUser, updatedByUser] = await Promise.all([
        Floor.findOne({ Floor_id: table.Floor_id }),
        table.CreateBy ? User.findOne({ user_id: table.CreateBy }) : null,
        table.UpdatedBy ? User.findOne({ user_id: table.UpdatedBy }) : null
      ]);

      const tableObj = table.toObject();
      tableObj.Floor = floor ? { Floor_id: floor.Floor_id, Floor_Name: floor.Floor_Name } : null;
      tableObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      tableObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return tableObj;
    }));

    res.status(200).json({
      success: true,
      count: tablesResponse.length,
      data: tablesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tables',
      error: error.message
    });
  }
};

// Toggle Table Status
const toggleTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const table = await Table.findOne({ Table_id: parseInt(id) });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Toggle status
    table.Status = !table.Status;
    table.UpdatedBy = userId;
    table.UpdatedAt = new Date();

    const updatedTable = await table.save();
    
    res.status(200).json({
      success: true,
      message: `Table status changed to ${updatedTable.Status ? 'Active' : 'Inactive'}`,
      data: updatedTable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling table status',
      error: error.message
    });
  }
};

// Get Table by Code (Public - For QR Scan) - NO AUTH REQUIRED
const getTableByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Table code is required'
      });
    }

    const table = await Table.findOne({ 'Table-code': code, Status: true });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found or inactive'
      });
    }

    // Fetch related data
    const [floor, tableType, tableBookingStatus, restaurant] = await Promise.all([
      Floor.findOne({ Floor_id: table.Floor_id }),
      table.Table_types_id ? Table_types.findOne({ Table_types_id: table.Table_types_id }) : null,
      Table_Booking_Status.findOne({ 'Table-Booking-Status_id': table['Table-Booking-Status_id'] }),
      table.CreateBy ? User.findOne({ user_id: table.CreateBy }) : null
    ]);

    // Create response object for QR scan
    const tableResponse = {
      Table_id: table.Table_id,
      Title: table.Title,
      'Table-code': table['Table-code'],
      'Table-name': table['Table-name'],
      Capacity: table.Capacity,
      'Seating-Persons_Count': table['Seating-Persons_Count'],
      Floor: floor ? { 
        Floor_id: floor.Floor_id, 
        Floor_Name: floor.Floor_Name 
      } : null,
      Table_Type: tableType ? { 
        Table_types_id: tableType.Table_types_id, 
        Name: tableType.Name 
      } : null,
      Booking_Status: tableBookingStatus ? { 
        'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'], 
        Name: tableBookingStatus.Name 
      } : null,
      Restaurant: restaurant ? {
        Name: restaurant.Name || restaurant.businessName,
        email: restaurant.email
      } : null,
      'Table-booking-price': table['Table-booking-price'],
      Details: table.Details,
      Emozi: table.Emozi,
      image: table.image
    };

    res.status(200).json({
      success: true,
      message: 'Table details retrieved successfully',
      data: tableResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table details',
      error: error.message
    });
  }
};

// Generate QR Code Data for Table
const getTableQRData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const table = await Table.findOne({ Table_id: parseInt(id) });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Fetch floor data
    const floor = await Floor.findOne({ Floor_id: table.Floor_id });

    // Generate QR data - this URL will be encoded in QR
    const baseUrl = process.env.FRONTEND_URL || 'https://yourapp.com';
    const qrUrl = `${baseUrl}/table/${table['Table-code']}`;

    res.status(200).json({
      success: true,
      message: 'QR data generated successfully',
      data: {
        Table_id: table.Table_id,
        Title: table.Title,
        'Table-code': table['Table-code'],
        Floor: floor ? floor.Floor_Name : null,
        Capacity: table.Capacity,
        qr_url: qrUrl,
        qr_content: table['Table-code']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating QR data',
      error: error.message
    });
  }
};

module.exports = {
  createTable,
  updateTable,
  getTableById,
  getAllTables,
  getTableByAuth,
  deleteTable,
  toggleTableStatus,
  getTableByCode,
  getTableQRData
};
