const Floor_map_Table = require('../models/Floor_map_Table.model');
const User = require('../models/User.model');
const Floor = require('../models/Floor.model');
const Floor_Type = require('../models/Floor_Type.model');
const Table = require('../models/Table.model');
const Table_types = require('../models/Table_types.model');
const Table_Booking_Status = require('../models/Table-Booking-Status.model');
const Quick_Order = require('../models/Quick_Order.model');
const Reservations = require('../models/Reservations.model');
const Pos_Point_sales_Order = require('../models/Pos_Point_sales_Order.model');

// Create Floor Map Table
const createFloorMapTable = async (req, res) => {
  try {
    const {
      floor_id,
      table_id,
      Row_No,
      Status
    } = req.body;

    const floorMapTable = new Floor_map_Table({
      floor_id,
      table_id,
      Row_No: Row_No !== undefined ? Row_No : null,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedFloorMapTable = await floorMapTable.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser, floorData, tableData] = await Promise.all([
      savedFloorMapTable.CreateBy ? User.findOne({ user_id: savedFloorMapTable.CreateBy }) : null,
      savedFloorMapTable.UpdatedBy ? User.findOne({ user_id: savedFloorMapTable.UpdatedBy }) : null,
      savedFloorMapTable.floor_id ? Floor.findOne({ Floor_id: savedFloorMapTable.floor_id }) : null,
      savedFloorMapTable.table_id ? Table.findOne({ Table_id: savedFloorMapTable.table_id }) : null
    ]);

    // Fetch nested data for floor (Floor_Type) and table (Table_types and Table-Booking-Status)
    const [floorTypeData, tableTypeData, tableBookingStatusData] = await Promise.all([
      floorData && floorData.Floor_Type_id ? Floor_Type.findOne({ Floor_Type_id: floorData.Floor_Type_id }) : null,
      tableData && tableData.Table_types_id ? Table_types.findOne({ Table_types_id: tableData.Table_types_id }) : null,
      tableData && tableData['Table-Booking-Status_id'] ? Table_Booking_Status.findOne({ 'Table-Booking-Status_id': tableData['Table-Booking-Status_id'] }) : null
    ]);

    // Create response object with populated data
    const floorMapTableResponse = savedFloorMapTable.toObject();
    
    // Ensure Row_No is included in response
    floorMapTableResponse.Row_No = savedFloorMapTable.Row_No !== undefined ? savedFloorMapTable.Row_No : null;
    
    // Populate CreateBy and UpdatedBy with full user data
    floorMapTableResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    floorMapTableResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    // Populate floor_id with full floor data including nested Floor_Type
    if (floorData) {
      const floorObj = floorData.toObject();
      floorObj.Floor_Type_id = floorTypeData ? 
        { Floor_Type_id: floorTypeData.Floor_Type_id, Floor_Type_Name: floorTypeData.Floor_Type_Name, emozi: floorTypeData.emozi } : null;
      floorMapTableResponse.floor_id = floorObj;
    } else {
      floorMapTableResponse.floor_id = null;
    }
    
    // Populate table_id with full table data including nested Table_types and Table-Booking-Status
    if (tableData) {
      const tableObj = tableData.toObject();
      tableObj.Table_types_id = tableTypeData ? 
        { Table_types_id: tableTypeData.Table_types_id, Name: tableTypeData.Name, emozi: tableTypeData.emozi } : null;
      tableObj['Table-Booking-Status_id'] = tableBookingStatusData ? 
        { 'Table-Booking-Status_id': tableBookingStatusData['Table-Booking-Status_id'], Name: tableBookingStatusData.Name } : null;
      floorMapTableResponse.table_id = tableObj;
    } else {
      floorMapTableResponse.table_id = null;
    }
    
    res.status(201).json({
      success: true,
      message: 'Floor map table created successfully',
      data: floorMapTableResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating floor map table',
      error: error.message
    });
  }
};

// Update Floor Map Table
const updateFloorMapTable = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Floor Map Table ID is required in request body'
      });
    }

    const floorMapTable = await Floor_map_Table.findOne({ floor_map_Table_id: parseInt(id) });
    if (!floorMapTable) {
      return res.status(404).json({
        success: false,
        message: 'Floor map table not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'floor_map_Table_id') {
        floorMapTable[key] = updateData[key];
      }
    });

    floorMapTable.UpdatedBy = userId;
    floorMapTable.UpdatedAt = new Date();

    const updatedFloorMapTable = await floorMapTable.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser, floorData, tableData] = await Promise.all([
      updatedFloorMapTable.CreateBy ? User.findOne({ user_id: updatedFloorMapTable.CreateBy }) : null,
      updatedFloorMapTable.UpdatedBy ? User.findOne({ user_id: updatedFloorMapTable.UpdatedBy }) : null,
      updatedFloorMapTable.floor_id ? Floor.findOne({ Floor_id: updatedFloorMapTable.floor_id }) : null,
      updatedFloorMapTable.table_id ? Table.findOne({ Table_id: updatedFloorMapTable.table_id }) : null
    ]);

    // Create response object with populated data
    const floorMapTableResponse = updatedFloorMapTable.toObject();
    floorMapTableResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    floorMapTableResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    floorMapTableResponse.floor_id = floorData ? 
      { Floor_id: floorData.Floor_id, Floor_Name: floorData.Floor_Name, Total_Table_Count: floorData.Total_Table_Count } : null;
    floorMapTableResponse.table_id = tableData ? 
      { Table_id: tableData.Table_id, 'Table-name': tableData['Table-name'], 'Table-code': tableData['Table-code'] } : null;
    
    res.status(200).json({
      success: true,
      message: 'Floor map table updated successfully',
      data: floorMapTableResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating floor map table',
      error: error.message
    });
  }
};

// Get Floor Map Table by ID
const getFloorMapTableById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const floorMapTable = await Floor_map_Table.findOne({ floor_map_Table_id: parseInt(id) });
    
    if (!floorMapTable) {
      return res.status(404).json({
        success: false,
        message: 'Floor map table not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, floorData, tableData] = await Promise.all([
      floorMapTable.CreateBy ? User.findOne({ user_id: floorMapTable.CreateBy }) : null,
      floorMapTable.UpdatedBy ? User.findOne({ user_id: floorMapTable.UpdatedBy }) : null,
      floorMapTable.floor_id ? Floor.findOne({ Floor_id: floorMapTable.floor_id }) : null,
      floorMapTable.table_id ? Table.findOne({ Table_id: floorMapTable.table_id }) : null
    ]);

    // Create response object with populated data
    const floorMapTableResponse = floorMapTable.toObject();
    floorMapTableResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    floorMapTableResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    floorMapTableResponse.floor_id = floorData ? 
      { Floor_id: floorData.Floor_id, Floor_Name: floorData.Floor_Name, Total_Table_Count: floorData.Total_Table_Count } : null;
    floorMapTableResponse.table_id = tableData ? 
      { Table_id: tableData.Table_id, 'Table-name': tableData['Table-name'], 'Table-code': tableData['Table-code'] } : null;

    res.status(200).json({
      success: true,
      data: floorMapTableResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor map table',
      error: error.message
    });
  }
};

// Get All Floor Map Tables
const getAllFloorMapTables = async (req, res) => {
  try {
    const floorMapTables = await Floor_map_Table.find().sort({ CreateAt: -1 });

    // Manually fetch related data for all floor map tables
    const floorMapTablesResponse = await Promise.all(floorMapTables.map(async (floorMapTable) => {
      const [createByUser, updatedByUser, floorData, tableData] = await Promise.all([
        floorMapTable.CreateBy ? User.findOne({ user_id: floorMapTable.CreateBy }) : null,
        floorMapTable.UpdatedBy ? User.findOne({ user_id: floorMapTable.UpdatedBy }) : null,
        floorMapTable.floor_id ? Floor.findOne({ Floor_id: floorMapTable.floor_id }) : null,
        floorMapTable.table_id ? Table.findOne({ Table_id: floorMapTable.table_id }) : null
      ]);

      const floorMapTableObj = floorMapTable.toObject();
      floorMapTableObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      floorMapTableObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
      floorMapTableObj.floor_id = floorData ? 
        { Floor_id: floorData.Floor_id, Floor_Name: floorData.Floor_Name, Total_Table_Count: floorData.Total_Table_Count } : null;
      floorMapTableObj.table_id = tableData ? 
        { Table_id: tableData.Table_id, 'Table-name': tableData['Table-name'], 'Table-code': tableData['Table-code'] } : null;

      return floorMapTableObj;
    }));

    res.status(200).json({
      success: true,
      count: floorMapTablesResponse.length,
      data: floorMapTablesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor map tables',
      error: error.message
    });
  }
};

// Get Tables by Floor ID
const getTableByFloorId = async (req, res) => {
  try {
    const { floor_id } = req.params;
    
    const floorMapTables = await Floor_map_Table.find({ 
      floor_id: parseInt(floor_id),
      Status: true 
    }).sort({ Row_No: 1 });

    if (!floorMapTables || floorMapTables.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No tables found for this floor'
      });
    }

    // Get floor data once (all records have the same floor_id)
    const floorData = floorMapTables[0]?.floor_id ? await Floor.findOne({ Floor_id: floorMapTables[0].floor_id }) : null;
    const floorTypeData = floorData && floorData.Floor_Type_id ? await Floor_Type.findOne({ Floor_Type_id: floorData.Floor_Type_id }) : null;
    
    // Populate floor object with nested Floor_Type
    let floorObj = null;
    if (floorData) {
      floorObj = floorData.toObject();
      floorObj.Floor_Type_id = floorTypeData ? 
        { Floor_Type_id: floorTypeData.Floor_Type_id, Floor_Type_Name: floorTypeData.Floor_Type_Name, emozi: floorTypeData.emozi } : null;
    }

    // Manually fetch related data for all floor map tables
    const tablesResponse = await Promise.all(floorMapTables.map(async (floorMapTable) => {
      const [createByUser, updatedByUser, tableData] = await Promise.all([
        floorMapTable.CreateBy ? User.findOne({ user_id: floorMapTable.CreateBy }) : null,
        floorMapTable.UpdatedBy ? User.findOne({ user_id: floorMapTable.UpdatedBy }) : null,
        floorMapTable.table_id ? Table.findOne({ Table_id: floorMapTable.table_id }) : null
      ]);

      // Fetch nested data for table (Table_types and Table-Booking-Status)
      const [tableTypeData, tableBookingStatusData] = await Promise.all([
        tableData && tableData.Table_types_id ? Table_types.findOne({ Table_types_id: tableData.Table_types_id }) : null,
        tableData && tableData['Table-Booking-Status_id'] ? Table_Booking_Status.findOne({ 'Table-Booking-Status_id': tableData['Table-Booking-Status_id'] }) : null
      ]);

      // Populate table_id with full table data including nested Table_types and Table-Booking-Status
      let tableObj = null;
      if (tableData) {
        tableObj = tableData.toObject();
        tableObj.Table_types_id = tableTypeData ? 
          { Table_types_id: tableTypeData.Table_types_id, Name: tableTypeData.Name, emozi: tableTypeData.emozi } : null;
        tableObj['Table-Booking-Status_id'] = tableBookingStatusData ? 
          { 'Table-Booking-Status_id': tableBookingStatusData['Table-Booking-Status_id'], Name: tableBookingStatusData.Name } : null;
        
        // Add floor_map_table metadata to table object
        tableObj.floor_map_Table_id = floorMapTable.floor_map_Table_id;
        tableObj.Row_No = floorMapTable.Row_No !== undefined ? floorMapTable.Row_No : null;
        tableObj.Status = floorMapTable.Status;
        tableObj.CreateBy = createByUser ? 
          { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        tableObj.UpdatedBy = updatedByUser ? 
          { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        tableObj.CreateAt = floorMapTable.CreateAt;
        tableObj.UpdatedAt = floorMapTable.UpdatedAt;
      }

      return {
        table: tableObj,
        rowNo: floorMapTable.Row_No !== undefined ? floorMapTable.Row_No : null
      };
    }));

    // Group tables by Row_No
    const groupedByRowNo = {};
    tablesResponse.forEach((item) => {
      const rowNoKey = item.rowNo !== null && item.rowNo !== undefined ? `Row_No_${item.rowNo}` : 'Row_No_null';
      
      if (!groupedByRowNo[rowNoKey]) {
        groupedByRowNo[rowNoKey] = {
          Floor: floorObj,
          tables: []
        };
      }
      
      if (item.table) {
        groupedByRowNo[rowNoKey].tables.push(item.table);
      }
    });

    // Sort Row_No keys numerically
    const sortedKeys = Object.keys(groupedByRowNo).sort((a, b) => {
      const numA = a === 'Row_No_null' ? 999999 : parseInt(a.replace('Row_No_', ''));
      const numB = b === 'Row_No_null' ? 999999 : parseInt(b.replace('Row_No_', ''));
      return numA - numB;
    });

    // Create sorted response object
    const sortedResponse = {};
    sortedKeys.forEach(key => {
      sortedResponse[key] = groupedByRowNo[key];
    });

    res.status(200).json({
      success: true,
      count: floorMapTables.length,
      data: sortedResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tables by floor ID',
      error: error.message
    });
  }
};

// Delete Floor Map Table
const deleteFloorMapTable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const floorMapTable = await Floor_map_Table.findOne({ floor_map_Table_id: parseInt(id) });
    
    if (!floorMapTable) {
      return res.status(404).json({
        success: false,
        message: 'Floor map table not found'
      });
    }

    await Floor_map_Table.deleteOne({ floor_map_Table_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Floor map table deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting floor map table',
      error: error.message
    });
  }
};

// Get Floor Map Tables by Auth (current logged in user)
const getFloorMapTableByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const floorMapTables = await Floor_map_Table.find({ CreateBy: userId }).sort({ CreateAt: -1 });

    if (!floorMapTables || floorMapTables.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Floor map tables not found for current user'
      });
    }

    // Manually fetch related data for all floor map tables
    const floorMapTablesResponse = await Promise.all(floorMapTables.map(async (floorMapTable) => {
      const [createByUser, updatedByUser, floorData, tableData] = await Promise.all([
        floorMapTable.CreateBy ? User.findOne({ user_id: floorMapTable.CreateBy }) : null,
        floorMapTable.UpdatedBy ? User.findOne({ user_id: floorMapTable.UpdatedBy }) : null,
        floorMapTable.floor_id ? Floor.findOne({ Floor_id: floorMapTable.floor_id }) : null,
        floorMapTable.table_id ? Table.findOne({ Table_id: floorMapTable.table_id }) : null
      ]);

      // Fetch nested data for floor (Floor_Type) and table (Table_types and Table-Booking-Status)
      const [floorTypeData, tableTypeData, tableBookingStatusData] = await Promise.all([
        floorData && floorData.Floor_Type_id ? Floor_Type.findOne({ Floor_Type_id: floorData.Floor_Type_id }) : null,
        tableData && tableData.Table_types_id ? Table_types.findOne({ Table_types_id: tableData.Table_types_id }) : null,
        tableData && tableData['Table-Booking-Status_id'] ? Table_Booking_Status.findOne({ 'Table-Booking-Status_id': tableData['Table-Booking-Status_id'] }) : null
      ]);

      const floorMapTableObj = floorMapTable.toObject();
      
      // Ensure Row_No is included in response
      floorMapTableObj.Row_No = floorMapTable.Row_No !== undefined ? floorMapTable.Row_No : null;
      
      floorMapTableObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      floorMapTableObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
      
      // Populate floor_id with full floor data including nested Floor_Type
      if (floorData) {
        const floorObj = floorData.toObject();
        floorObj.Floor_Type_id = floorTypeData ? 
          { Floor_Type_id: floorTypeData.Floor_Type_id, Floor_Type_Name: floorTypeData.Floor_Type_Name, emozi: floorTypeData.emozi } : null;
        floorMapTableObj.floor_id = floorObj;
      } else {
        floorMapTableObj.floor_id = null;
      }
      
      // Populate table_id with full table data including nested Table_types and Table-Booking-Status
      if (tableData) {
        const tableObj = tableData.toObject();
        tableObj.Table_types_id = tableTypeData ? 
          { Table_types_id: tableTypeData.Table_types_id, Name: tableTypeData.Name, emozi: tableTypeData.emozi } : null;
        tableObj['Table-Booking-Status_id'] = tableBookingStatusData ? 
          { 'Table-Booking-Status_id': tableBookingStatusData['Table-Booking-Status_id'], Name: tableBookingStatusData.Name } : null;
        
        // Check for active orders and bookings
        const tableId = tableData.Table_id;
        const currentDate = new Date();
        
        // Check for active Quick Orders (exclude Completed, Served, and Cancelled)
        const activeQuickOrder = await Quick_Order.findOne({
          Table_id: tableId,
          Order_Status: { $nin: ['Cancelled', 'Served', 'Completed'] },
          Status: true
        });
        
        // Check for active POS Orders (exclude Completed, Served, and Cancelled)
        const activePosOrder = await Pos_Point_sales_Order.findOne({
          Table_id: tableId,
          Order_Status: { $nin: ['Cancelled', 'Served', 'Completed'] },
          Status: true
        });
        
        // Check for active Reservations (current or future)
        const activeReservation = await Reservations.findOne({
          $or: [
            { Table_id: tableId },
            { Addone_Table_id: tableId }
          ],
          Status: true,
          Date_time: { $gte: currentDate }
        });
        
        // Set table_status from Table-Booking-Status name
        let table_status = 'Available'; // Default status
        
        // First, get status from Table-Booking-Status
        if (tableBookingStatusData) {
          table_status = tableBookingStatusData.Name || 'Available';
        }
        
        // Override status if there are active orders (but not if order is Completed/Served/Cancelled)
        if (!tableData.Status) {
          table_status = 'Inactive';
        } else if (activeQuickOrder || activePosOrder) {
          // Only set to Occupied if there's an active order (not completed)
          table_status = 'Occupied';
        } else if (activeReservation) {
          table_status = 'Reserved';
        } else {
          // If no active orders/reservations, use the Table-Booking-Status name
          table_status = tableBookingStatusData ? tableBookingStatusData.Name : 'Available';
        }
        
        // Add table_status to table object (from Table-Booking-Status)
        tableObj.table_status = table_status;
        tableObj.has_active_order = !!(activeQuickOrder || activePosOrder);
        tableObj.has_active_booking = !!activeReservation;
        
        floorMapTableObj.table_id = tableObj;
      } else {
        floorMapTableObj.table_id = null;
      }

      return floorMapTableObj;
    }));

    res.status(200).json({
      success: true,
      count: floorMapTablesResponse.length,
      data: floorMapTablesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor map tables by auth',
      error: error.message
    });
  }
};

module.exports = {
  createFloorMapTable,
  updateFloorMapTable,
  getFloorMapTableById,
  getAllFloorMapTables,
  getTableByFloorId,
  deleteFloorMapTable,
  getFloorMapTableByAuth
};

