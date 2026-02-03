const Quick_Order = require('../models/Quick_Order.model');
const User = require('../models/User.model');
const Items = require('../models/Items.model');
const Floor = require('../models/Floor.model');
const Table = require('../models/Table.model');
const TableBookingStatus = require('../models/Table-Booking-Status.model');

// Create Quick Order
const createQuickOrder = async (req, res) => {
  try {
    const {
      client_mobile_no,
      get_order_Employee_id,
      item_ids,
      Floor_id,
      Table_id,
      AddOnTable_id,
      Persons_Count,
      Table_Booking_Status_id,
      Wating_Time
    } = req.body;
    const userId = req.user.user_id;

    // Calculate SubTotal from item_ids with quantities and populate item names
    let SubTotal = 0;
    let processedItemIds = [];
    let tax = 6;
    if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
      // Extract item IDs from the array
      const itemIdArray = item_ids.map(item => 
        typeof item === 'object' ? item.item_id : item
      );
      
      const items = await Items.find({ Items_id: { $in: itemIdArray } });
      
      // Create a map for quick lookup
      const itemMap = items.reduce((map, item) => {
        map[item.Items_id] = item;
        return map;
      }, {});
      
      // Process items and calculate total with quantities
      processedItemIds = item_ids.map(item => {
        const itemId = typeof item === 'object' ? item.item_id : item;
        const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
        const itemData = itemMap[itemId];
        

        if (itemData) {
          SubTotal += (itemData['item-price'] || 0) * quantity;
          return {
            item_id: itemId,
            itemName: itemData['item-name'],
            quantity: quantity
          };
        }
        return {
          item_id: itemId,
          itemName: 'Unknown Item',
          quantity: quantity
        };
      });
    }

    // Calculate Tax (6% of SubTotal)
    const TotalTax = Math.round((SubTotal * tax) / 100);

    // Calculate Total
    const Total = SubTotal + TotalTax;

    const Order_Status = 'Preparing';
    const Status = true;

    const quickOrder = new Quick_Order({
      client_mobile_no,
      get_order_Employee_id,
      item_ids: processedItemIds,
      Floor_id,
      Table_id,
      AddOnTable_id,
      Persons_Count,
      Table_Booking_Status_id,
      Wating_Time,
      Tax : tax,
      SubTotal,
      Total,
      Order_Status,
      Status,
      CreateBy: userId
    });

    const savedQuickOrder = await quickOrder.save();

    // Update Table Booking Status
    if (Table_id) {
      await Table.findOneAndUpdate(
        { Table_id: Table_id },
        {
          'Table-Booking-Status_id': Table_Booking_Status_id,
          UpdatedBy: userId,
          UpdatedAt: new Date()
        }
      );
    }

    // Update AddOn Table Booking Status if exists
    if (AddOnTable_id) {
      await Table.findOneAndUpdate(
        { Table_id: AddOnTable_id },
        {
          'Table-Booking-Status_id': Table_Booking_Status_id,
          UpdatedBy: userId,
          UpdatedAt: new Date()
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Quick order created successfully',
      data: savedQuickOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quick order',
      error: error.message
    });
  }
};

// Update Quick Order
const updateQuickOrder = async (req, res) => {
  try {
    const {
      id,
      client_mobile_no,
      get_order_Employee_id,
      item_ids,
      Floor_id,
      Table_id,
      AddOnTable_id,
      Persons_Count,
      Table_Booking_Status_id,
      Wating_Time,
      Order_Status,
      Status
    } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Quick Order ID is required in request body'
      });
    }

    const quickOrder = await Quick_Order.findOne({ Quick_Order_id: parseInt(id) });
    if (!quickOrder) {
      return res.status(404).json({
        success: false,
        message: 'Quick order not found'
      });
    }

    if (client_mobile_no) quickOrder.client_mobile_no = client_mobile_no;
    if (get_order_Employee_id) quickOrder.get_order_Employee_id = get_order_Employee_id;
    if (Floor_id) quickOrder.Floor_id = Floor_id;
    if (Table_id) quickOrder.Table_id = Table_id;
    if (AddOnTable_id !== undefined) quickOrder.AddOnTable_id = AddOnTable_id;
    if (Persons_Count) quickOrder.Persons_Count = Persons_Count;
    if (Table_Booking_Status_id) quickOrder.Table_Booking_Status_id = Table_Booking_Status_id;
    if (Wating_Time !== undefined) quickOrder.Wating_Time = Wating_Time;
    if (Order_Status) quickOrder.Order_Status = Order_Status;
    if (Status !== undefined) quickOrder.Status = Status;

    // If Order_Status is changed to "Cancelled", automatically update table booking status to 1
    if (Order_Status === "Cancelled") {
      quickOrder.Table_Booking_Status_id = 1;
      
      // Update Table Booking Status to 1 (Available)
      if (quickOrder.Table_id) {
        await Table.findOneAndUpdate(
          { Table_id: quickOrder.Table_id },
          {
            'Table-Booking-Status_id': 1,
            UpdatedBy: userId,
            UpdatedAt: new Date()
          }
        );
      }

      // Update AddOn Table Booking Status to 1 (Available) if exists
      if (quickOrder.AddOnTable_id) {
        await Table.findOneAndUpdate(
          { Table_id: quickOrder.AddOnTable_id },
          {
            'Table-Booking-Status_id': 1,
            UpdatedBy: userId,
            UpdatedAt: new Date()
          }
        );
      }
    }

    // Recalculate totals if item_ids are updated
    if (item_ids) {
      // Calculate new SubTotal from updated item_ids with quantities and populate item names
      let newSubTotal = 0;
      let processedItemIds = [];
      let tax = 6;
      
      if (Array.isArray(item_ids) && item_ids.length > 0) {
        // Extract item IDs from the array
        const itemIdArray = item_ids.map(item => 
          typeof item === 'object' ? item.item_id : item
        );
        
        const items = await Items.find({ Items_id: { $in: itemIdArray } });
        
        // Create a map for quick lookup
        const itemMap = items.reduce((map, item) => {
          map[item.Items_id] = item;
          return map;
        }, {});
        
        // Process items and calculate total with quantities
        processedItemIds = item_ids.map(item => {
          const itemId = typeof item === 'object' ? item.item_id : item;
          const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
          const itemData = itemMap[itemId];
          
          
          if (itemData) {
            newSubTotal += (itemData['item-price'] || 0) * quantity;
            return {
              item_id: itemId,
              itemName: itemData['item-name'],
              quantity: quantity
            };
          }
          return {
            item_id: itemId,
            itemName: 'Unknown Item',
            quantity: quantity
          };
        });
      }
      
      quickOrder.item_ids = processedItemIds;
      quickOrder.SubTotal = newSubTotal;
      quickOrder.Tax = Math.round((newSubTotal * tax) / 100);
      quickOrder.Total = newSubTotal + quickOrder.Tax;
    } else if (SubTotal !== undefined || Tax !== undefined || Total !== undefined) {
      // If individual values are provided, use them
      if (SubTotal !== undefined) quickOrder.SubTotal = SubTotal;
      if (Tax !== undefined) quickOrder.Tax = Tax;
      if (Total !== undefined) quickOrder.Total = Total;
    }

    quickOrder.UpdatedBy = userId;
    quickOrder.UpdatedAt = new Date();

    const updatedQuickOrder = await quickOrder.save();

    // Update Table Booking Status if Table_Booking_Status_id is changed
    if (Table_Booking_Status_id && (Table_id || AddOnTable_id)) {
      if (Table_id) {
        await Table.findOneAndUpdate(
          { Table_id: Table_id },
          {
            'Table-Booking-Status_id': Table_Booking_Status_id,
            UpdatedBy: userId,
            UpdatedAt: new Date()
          }
        );
      }

      if (AddOnTable_id) {
        await Table.findOneAndUpdate(
          { Table_id: AddOnTable_id },
          {
            'Table-Booking-Status_id': Table_Booking_Status_id,
            UpdatedBy: userId,
            UpdatedAt: new Date()
          }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Quick order updated successfully',
      data: updatedQuickOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quick order',
      error: error.message
    });
  }
};

// Get Quick Order by ID
const getQuickOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const quickOrder = await Quick_Order.findOne({ Quick_Order_id: parseInt(id) });

    if (!quickOrder) {
      return res.status(404).json({
        success: false,
        message: 'Quick order not found'
      });
    }

    // Manually fetch related data
    const [getOrderEmployee, floor, table, addOnTable, tableBookingStatus, createByUser, updatedByUser] = await Promise.all([
      User.findOne({ Employee_id: quickOrder.get_order_Employee_id }),
      Floor.findOne({ Floor_id: quickOrder.Floor_id }),
      Table.findOne({ Table_id: quickOrder.Table_id }),
      quickOrder.AddOnTable_id ? Table.findOne({ Table_id: quickOrder.AddOnTable_id }) : null,
      TableBookingStatus.findOne({ 'Table-Booking-Status_id': quickOrder.Table_Booking_Status_id }),
      quickOrder.CreateBy ? User.findOne({ user_id: quickOrder.CreateBy }) : null,
      quickOrder.UpdatedBy ? User.findOne({ user_id: quickOrder.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const quickOrderResponse = quickOrder.toObject();
    quickOrderResponse.get_order_Employee_id = getOrderEmployee ? {
      user_id: getOrderEmployee.user_id,
      Name: getOrderEmployee.Name,
      Employee_id: getOrderEmployee.Employee_id,
      email: getOrderEmployee.email
    } : null;
    quickOrderResponse.Floor_id = floor ? {
      Floor_id: floor.Floor_id,
      Floor_Name: floor.Floor_Name
    } : null;
    quickOrderResponse.Table_id = table ? {
      Table_id: table.Table_id,
      'Table-name': table['Table-name']
    } : null;
    quickOrderResponse.AddOnTable_id = addOnTable ? {
      Table_id: addOnTable.Table_id,
      'Table-name': addOnTable['Table-name']
    } : null;
    quickOrderResponse.Table_Booking_Status_id = tableBookingStatus ? {
      'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'],
      Name: tableBookingStatus.Name
    } : null;
    quickOrderResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    quickOrderResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      data: quickOrderResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quick order',
      error: error.message
    });
  }
};

// Get All Quick Orders
const getAllQuickOrders = async (req, res) => {
  try {
    const quickOrders = await Quick_Order.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all quick orders
    const quickOrdersWithPopulatedData = await Promise.all(
      quickOrders.map(async (order) => {
        const [getOrderEmployee, floor, table, addOnTable, tableBookingStatus, createByUser, updatedByUser] = await Promise.all([
          User.findOne({ Employee_id: order.get_order_Employee_id }),
          Floor.findOne({ Floor_id: order.Floor_id }),
          Table.findOne({ Table_id: order.Table_id }),
          order.AddOnTable_id ? Table.findOne({ Table_id: order.AddOnTable_id }) : null,
          TableBookingStatus.findOne({ 'Table-Booking-Status_id': order.Table_Booking_Status_id }),
          order.CreateBy ? User.findOne({ user_id: order.CreateBy }) : null,
          order.UpdatedBy ? User.findOne({ user_id: order.UpdatedBy }) : null
        ]);

        const orderResponse = order.toObject();
        orderResponse.get_order_Employee_id = getOrderEmployee ? {
          user_id: getOrderEmployee.user_id,
          Name: getOrderEmployee.Name,
          Employee_id: getOrderEmployee.Employee_id,
          email: getOrderEmployee.email
        } : null;
        orderResponse.Floor_id = floor ? {
          Floor_id: floor.Floor_id,
          Floor_Name: floor.Floor_Name
        } : null;
        orderResponse.Table_id = table ? {
          Table_id: table.Table_id,
          'Table-name': table['Table-name']
        } : null;
        orderResponse.AddOnTable_id = addOnTable ? {
          Table_id: addOnTable.Table_id,
          'Table-name': addOnTable['Table-name']
        } : null;
        orderResponse.Table_Booking_Status_id = tableBookingStatus ? {
          'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'],
          Name: tableBookingStatus.Name
        } : null;
        orderResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        orderResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return orderResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: quickOrdersWithPopulatedData.length,
      data: quickOrdersWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quick orders',
      error: error.message
    });
  }
};

// Get Quick Orders by Authenticated User
const getQuickOrdersByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const quickOrders = await Quick_Order.find({ CreateBy: userId })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all quick orders
    const quickOrdersWithPopulatedData = await Promise.all(
      quickOrders.map(async (order) => {
        const [getOrderEmployee, floor, table, addOnTable, tableBookingStatus, createByUser, updatedByUser] = await Promise.all([
          User.findOne({ Employee_id: order.get_order_Employee_id }),
          Floor.findOne({ Floor_id: order.Floor_id }),
          Table.findOne({ Table_id: order.Table_id }),
          order.AddOnTable_id ? Table.findOne({ Table_id: order.AddOnTable_id }) : null,
          TableBookingStatus.findOne({ 'Table-Booking-Status_id': order.Table_Booking_Status_id }),
          order.CreateBy ? User.findOne({ user_id: order.CreateBy }) : null,
          order.UpdatedBy ? User.findOne({ user_id: order.UpdatedBy }) : null
        ]);

        const orderResponse = order.toObject();
        orderResponse.get_order_Employee_id = getOrderEmployee ? {
          user_id: getOrderEmployee.user_id,
          Name: getOrderEmployee.Name,
          Employee_id: getOrderEmployee.Employee_id,
          email: getOrderEmployee.email
        } : null;
        orderResponse.Floor_id = floor ? {
          Floor_id: floor.Floor_id,
          Floor_Name: floor.Floor_Name
        } : null;
        orderResponse.Table_id = table ? {
          Table_id: table.Table_id,
          'Table-name': table['Table-name']
        } : null;
        orderResponse.AddOnTable_id = addOnTable ? {
          Table_id: addOnTable.Table_id,
          'Table-name': addOnTable['Table-name']
        } : null;
        orderResponse.Table_Booking_Status_id = tableBookingStatus ? {
          'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'],
          Name: tableBookingStatus.Name
        } : null;
        orderResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        orderResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return orderResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: quickOrdersWithPopulatedData.length,
      data: quickOrdersWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quick orders',
      error: error.message
    });
  }
};

// Get Quick Orders by Order Status
const getQuickOrdersByOrderStatus = async (req, res) => {
  try {
    const { order_status } = req.params;

    // Validate order status
    const validStatuses = ['Preparing', 'Served', 'Cancelled'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status. Must be one of: Preparing, Served, Cancelled'
      });
    }

    const quickOrders = await Quick_Order.find({ Order_Status: order_status })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all quick orders
    const quickOrdersWithPopulatedData = await Promise.all(
      quickOrders.map(async (order) => {
        const [getOrderEmployee, floor, table, addOnTable, tableBookingStatus, createByUser, updatedByUser] = await Promise.all([
          User.findOne({ Employee_id: order.get_order_Employee_id }),
          Floor.findOne({ Floor_id: order.Floor_id }),
          Table.findOne({ Table_id: order.Table_id }),
          order.AddOnTable_id ? Table.findOne({ Table_id: order.AddOnTable_id }) : null,
          TableBookingStatus.findOne({ 'Table-Booking-Status_id': order.Table_Booking_Status_id }),
          order.CreateBy ? User.findOne({ user_id: order.CreateBy }) : null,
          order.UpdatedBy ? User.findOne({ user_id: order.UpdatedBy }) : null
        ]);

        const orderResponse = order.toObject();
        orderResponse.get_order_Employee_id = getOrderEmployee ? {
          user_id: getOrderEmployee.user_id,
          Name: getOrderEmployee.Name,
          Employee_id: getOrderEmployee.Employee_id,
          email: getOrderEmployee.email
        } : null;
        orderResponse.Floor_id = floor ? {
          Floor_id: floor.Floor_id,
          Floor_Name: floor.Floor_Name
        } : null;
        orderResponse.Table_id = table ? {
          Table_id: table.Table_id,
          'Table-name': table['Table-name']
        } : null;
        orderResponse.AddOnTable_id = addOnTable ? {
          Table_id: addOnTable.Table_id,
          'Table-name': addOnTable['Table-name']
        } : null;
        orderResponse.Table_Booking_Status_id = tableBookingStatus ? {
          'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'],
          Name: tableBookingStatus.Name
        } : null;
        orderResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        orderResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return orderResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: quickOrdersWithPopulatedData.length,
      data: quickOrdersWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quick orders by status',
      error: error.message
    });
  }
};

// Get Quick Orders by Table Booking Status
const getQuickOrdersByTableBookingStatus = async (req, res) => {
  try {
    const { table_booking_status_id } = req.params;

    // Validate table booking status ID
    if (!table_booking_status_id || isNaN(parseInt(table_booking_status_id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid table booking status ID is required'
      });
    }

    const quickOrders = await Quick_Order.find({
      Table_Booking_Status_id: parseInt(table_booking_status_id)
    }).sort({ CreateAt: -1 });

    // Manually fetch related data for all quick orders
    const quickOrdersWithPopulatedData = await Promise.all(
      quickOrders.map(async (order) => {
        const [getOrderEmployee, floor, table, addOnTable, tableBookingStatus, createByUser, updatedByUser] = await Promise.all([
          User.findOne({ Employee_id: order.get_order_Employee_id }),
          Floor.findOne({ Floor_id: order.Floor_id }),
          Table.findOne({ Table_id: order.Table_id }),
          order.AddOnTable_id ? Table.findOne({ Table_id: order.AddOnTable_id }) : null,
          TableBookingStatus.findOne({ 'Table-Booking-Status_id': order.Table_Booking_Status_id }),
          order.CreateBy ? User.findOne({ user_id: order.CreateBy }) : null,
          order.UpdatedBy ? User.findOne({ user_id: order.UpdatedBy }) : null
        ]);

        const orderResponse = order.toObject();
        orderResponse.get_order_Employee_id = getOrderEmployee ? {
          user_id: getOrderEmployee.user_id,
          Name: getOrderEmployee.Name,
          Employee_id: getOrderEmployee.Employee_id,
          email: getOrderEmployee.email
        } : null;
        orderResponse.Floor_id = floor ? {
          Floor_id: floor.Floor_id,
          Floor_Name: floor.Floor_Name
        } : null;
        orderResponse.Table_id = table ? {
          Table_id: table.Table_id,
          'Table-name': table['Table-name']
        } : null;
        orderResponse.AddOnTable_id = addOnTable ? {
          Table_id: addOnTable.Table_id,
          'Table-name': addOnTable['Table-name']
        } : null;
        orderResponse.Table_Booking_Status_id = tableBookingStatus ? {
          'Table-Booking-Status_id': tableBookingStatus['Table-Booking-Status_id'],
          Name: tableBookingStatus.Name
        } : null;
        orderResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        orderResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return orderResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: quickOrdersWithPopulatedData.length,
      data: quickOrdersWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quick orders by table booking status',
      error: error.message
    });
  }
};

module.exports = {
  createQuickOrder,
  updateQuickOrder,
  getQuickOrderById,
  getAllQuickOrders,
  getQuickOrdersByAuth,
  getQuickOrdersByOrderStatus,
  getQuickOrdersByTableBookingStatus
};
