const Quick_Order = require('../models/Quick_Order.model');
const User = require('../models/User.model');
const Items = require('../models/Items.model');
const Floor = require('../models/Floor.model');
const Table = require('../models/Table.model');
const TableBookingStatus = require('../models/Table-Booking-Status.model');

// Get Order History with detailed information
const getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { Status: true };
    if (search) {
      query.$or = [
        { 'client_mobile_no': { $regex: search, $options: 'i' } },
        { 'Order_Status': { $regex: search, $options: 'i' } }
      ];
    }

    // Get orders with pagination
    const orders = await Quick_Order.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalOrders = await Quick_Order.countDocuments(query);

    // Process orders to include detailed information
    const processedOrders = await Promise.all(orders.map(async (order) => {
      // Calculate late time (difference between current time and order creation time)
      const currentTime = new Date();
      const orderTime = new Date(order.CreateAt);
      const lateTime = Math.floor((currentTime - orderTime) / (1000 * 60)); // in minutes

      // Get related data manually
      const [floorData, tableData, tableBookingStatusData, employeeData] = await Promise.all([
        Floor.findOne({ Floor_id: order.Floor_id, Status: true }),
        Table.findOne({ Table_id: order.Table_id, Status: true }),
        TableBookingStatus.findOne({ Table_Booking_Status_id: order.Table_Booking_Status_id, Status: true }),
        User.findOne({ user_id: order.get_order_Employee_id, Status: true })
      ]);

      // Get detailed item information
      const itemDetails = await Promise.all(order.item_ids.map(async (item) => {
        const itemData = await Items.findOne({ Items_id: item.item_id });
        return {
          item_id: item.item_id,
          name: itemData ? itemData['item-name'] : 'Unknown Item',
          quantity: item.quantity,
          price: itemData ? itemData['item-price'] : 0,
          total_item_price: itemData ? (itemData['item-price'] * item.quantity) : 0
        };
      }));

      // Calculate total items in order
      const totalItemsInOrder = itemDetails.reduce((sum, item) => sum + item.quantity, 0);

      return {
        order: {
          order_id: order.Quick_Order_id,
          order_status: order.Order_Status,
          persons_count: order.Persons_Count,
          late_time: lateTime,
          waiting_time: order.Wating_Time,
          created_at: order.CreateAt
        },
        client: {
          mobile_no: order.client_mobile_no
        },
        table: {
          table_id: tableData?.Table_id,
          table_name: tableData?.['Table-name'],
          table_code: tableData?.['Table-code']
        },
        floor: {
          floor_id: floorData?.Floor_id,
          floor_name: floorData?.Floor_Name
        },
        products: {
          total_items_in_order: totalItemsInOrder,
          items: itemDetails
        },
        tax: {
          tax_percentage: order.Tax,
          tax_amount: Math.round((order.SubTotal * order.Tax) / 100)
        },
        subtotal: order.SubTotal,
        total: order.Total,
        employee: {
          employee_id: employeeData?.Employee_id,
          name: employeeData?.Name || 'Unknown Employee'
        }
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Order history retrieved successfully',
      data: {
        orders: processedOrders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalOrders / limit),
          total_orders: totalOrders,
          orders_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getOrderHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Order History by Date Range
const getOrderHistoryByDateRange = async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    const query = {
      Status: true,
      CreateAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    const orders = await Quick_Order.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Quick_Order.countDocuments(query);

    // Process orders similar to main function
    const processedOrders = await Promise.all(orders.map(async (order) => {
      const currentTime = new Date();
      const orderTime = new Date(order.CreateAt);
      const lateTime = Math.floor((currentTime - orderTime) / (1000 * 60));

      // Get related data manually
      const [floorData, tableData, tableBookingStatusData, employeeData] = await Promise.all([
        Floor.findOne({ Floor_id: order.Floor_id, Status: true }),
        Table.findOne({ Table_id: order.Table_id, Status: true }),
        TableBookingStatus.findOne({ Table_Booking_Status_id: order.Table_Booking_Status_id, Status: true }),
        User.findOne({ user_id: order.get_order_Employee_id, Status: true })
      ]);

      const itemDetails = await Promise.all(order.item_ids.map(async (item) => {
        const itemData = await Items.findOne({ Items_id: item.item_id });
        return {
          item_id: item.item_id,
          name: itemData ? itemData['item-name'] : 'Unknown Item',
          quantity: item.quantity,
          price: itemData ? itemData['item-price'] : 0,
          total_item_price: itemData ? (itemData['item-price'] * item.quantity) : 0
        };
      }));

      const totalItemsInOrder = itemDetails.reduce((sum, item) => sum + item.quantity, 0);

      return {
        order: {
          order_id: order.Quick_Order_id,
          order_status: order.Order_Status,
          persons_count: order.Persons_Count,
          late_time: lateTime,
          waiting_time: order.Wating_Time,
          created_at: order.CreateAt
        },
        client: {
          mobile_no: order.client_mobile_no
        },
        table: {
          table_id: tableData?.Table_id,
          table_name: tableData?.['Table-name'],
          table_code: tableData?.['Table-code']
        },
        floor: {
          floor_id: floorData?.Floor_id,
          floor_name: floorData?.Floor_Name
        },
        products: {
          total_items_in_order: totalItemsInOrder,
          items: itemDetails
        },
        tax: {
          tax_percentage: order.Tax,
          tax_amount: Math.round((order.SubTotal * order.Tax) / 100)
        },
        subtotal: order.SubTotal,
        total: order.Total,
        employee: {
          employee_id: employeeData?.Employee_id,
          name: employeeData?.Name || 'Unknown Employee'
        }
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Order history by date range retrieved successfully',
      data: {
        orders: processedOrders,
        date_range: {
          start_date: startDate,
          end_date: endDate
        },
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalOrders / limit),
          total_orders: totalOrders,
          orders_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getOrderHistoryByDateRange:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Order History by Status
const getOrderHistoryByStatus = async (req, res) => {
  try {
    const { order_status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      Status: true,
      Order_Status: order_status
    };

    const orders = await Quick_Order.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Quick_Order.countDocuments(query);

    // Process orders similar to main function
    const processedOrders = await Promise.all(orders.map(async (order) => {
      const currentTime = new Date();
      const orderTime = new Date(order.CreateAt);
      const lateTime = Math.floor((currentTime - orderTime) / (1000 * 60));

      // Get related data manually
      const [floorData, tableData, tableBookingStatusData, employeeData] = await Promise.all([
        Floor.findOne({ Floor_id: order.Floor_id, Status: true }),
        Table.findOne({ Table_id: order.Table_id, Status: true }),
        TableBookingStatus.findOne({ Table_Booking_Status_id: order.Table_Booking_Status_id, Status: true }),
        User.findOne({ user_id: order.get_order_Employee_id, Status: true })
      ]);

      const itemDetails = await Promise.all(order.item_ids.map(async (item) => {
        const itemData = await Items.findOne({ Items_id: item.item_id });
        return {
          item_id: item.item_id,
          name: itemData ? itemData['item-name'] : 'Unknown Item',
          quantity: item.quantity,
          price: itemData ? itemData['item-price'] : 0,
          total_item_price: itemData ? (itemData['item-price'] * item.quantity) : 0
        };
      }));

      const totalItemsInOrder = itemDetails.reduce((sum, item) => sum + item.quantity, 0);

      return {
        order: {
          order_id: order.Quick_Order_id,
          order_status: order.Order_Status,
          persons_count: order.Persons_Count,
          late_time: lateTime,
          waiting_time: order.Wating_Time,
          created_at: order.CreateAt
        },
        client: {
          mobile_no: order.client_mobile_no
        },
        table: {
          table_id: tableData?.Table_id,
          table_name: tableData?.['Table-name'],
          table_code: tableData?.['Table-code']
        },
        floor: {
          floor_id: floorData?.Floor_id,
          floor_name: floorData?.Floor_Name
        },
        products: {
          total_items_in_order: totalItemsInOrder,
          items: itemDetails
        },
        tax: {
          tax_percentage: order.Tax,
          tax_amount: Math.round((order.SubTotal * order.Tax) / 100)
        },
        subtotal: order.SubTotal,
        total: order.Total,
        employee: {
          employee_id: employeeData?.Employee_id,
          name: employeeData?.Name || 'Unknown Employee'
        }
      };
    }));

    res.status(200).json({
      success: true,
      message: `Order history for status '${order_status}' retrieved successfully`,
      data: {
        order_status: order_status,
        orders: processedOrders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalOrders / limit),
          total_orders: totalOrders,
          orders_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getOrderHistoryByStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Order History by Table
const getOrderHistoryByTable = async (req, res) => {
  try {
    const { table_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      Status: true,
      Table_id: table_id
    };

    const orders = await Quick_Order.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Quick_Order.countDocuments(query);

    // Process orders similar to main function
    const processedOrders = await Promise.all(orders.map(async (order) => {
      const currentTime = new Date();
      const orderTime = new Date(order.CreateAt);
      const lateTime = Math.floor((currentTime - orderTime) / (1000 * 60));

      // Get related data manually
      const [floorData, tableData, tableBookingStatusData, employeeData] = await Promise.all([
        Floor.findOne({ Floor_id: order.Floor_id, Status: true }),
        Table.findOne({ Table_id: order.Table_id, Status: true }),
        TableBookingStatus.findOne({ Table_Booking_Status_id: order.Table_Booking_Status_id, Status: true }),
        User.findOne({ user_id: order.get_order_Employee_id, Status: true })
      ]);

      const itemDetails = await Promise.all(order.item_ids.map(async (item) => {
        const itemData = await Items.findOne({ Items_id: item.item_id });
        return {
          item_id: item.item_id,
          name: itemData ? itemData['item-name'] : 'Unknown Item',
          quantity: item.quantity,
          price: itemData ? itemData['item-price'] : 0,
          total_item_price: itemData ? (itemData['item-price'] * item.quantity) : 0
        };
      }));

      const totalItemsInOrder = itemDetails.reduce((sum, item) => sum + item.quantity, 0);

      return {
        order: {
          order_id: order.Quick_Order_id,
          order_status: order.Order_Status,
          persons_count: order.Persons_Count,
          late_time: lateTime,
          waiting_time: order.Wating_Time,
          created_at: order.CreateAt
        },
        client: {
          mobile_no: order.client_mobile_no
        },
        table: {
          table_id: tableData?.Table_id,
          table_name: tableData?.['Table-name'],
          table_code: tableData?.['Table-code']
        },
        floor: {
          floor_id: floorData?.Floor_id,
          floor_name: floorData?.Floor_Name
        },
        products: {
          total_items_in_order: totalItemsInOrder,
          items: itemDetails
        },
        tax: {
          tax_percentage: order.Tax,
          tax_amount: Math.round((order.SubTotal * order.Tax) / 100)
        },
        subtotal: order.SubTotal,
        total: order.Total,
        employee: {
          employee_id: employeeData?.Employee_id,
          name: employeeData?.Name || 'Unknown Employee'
        }
      };
    }));

    res.status(200).json({
      success: true,
      message: `Order history for table ${table_id} retrieved successfully`,
      data: {
        table_id: table_id,
        orders: processedOrders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalOrders / limit),
          total_orders: totalOrders,
          orders_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getOrderHistoryByTable:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Order History by Client Mobile Number
const getOrderHistoryByClientMobileNo = async (req, res) => {
  try {
    const { mobile_no } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!mobile_no) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    const query = {
      Status: true,
      client_mobile_no: mobile_no
    };

    const orders = await Quick_Order.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Quick_Order.countDocuments(query);

    if (totalOrders === 0) {
      return res.status(200).json({
        success: true,
        message: `No orders found for mobile number ${mobile_no}`,
        data: {
          mobile_no: mobile_no,
          orders: [],
          pagination: {
            current_page: parseInt(page),
            total_pages: 0,
            total_orders: 0,
            orders_per_page: parseInt(limit)
          }
        }
      });
    }

    // Process orders similar to main function
    const processedOrders = await Promise.all(orders.map(async (order) => {
      const currentTime = new Date();
      const orderTime = new Date(order.CreateAt);
      const lateTime = Math.floor((currentTime - orderTime) / (1000 * 60));

      // Get related data manually
      const [floorData, tableData, tableBookingStatusData, employeeData] = await Promise.all([
        Floor.findOne({ Floor_id: order.Floor_id, Status: true }),
        Table.findOne({ Table_id: order.Table_id, Status: true }),
        TableBookingStatus.findOne({ Table_Booking_Status_id: order.Table_Booking_Status_id, Status: true }),
        User.findOne({ user_id: order.get_order_Employee_id, Status: true })
      ]);

      const itemDetails = await Promise.all(order.item_ids.map(async (item) => {
        const itemData = await Items.findOne({ Items_id: item.item_id });
        return {
          item_id: item.item_id,
          name: itemData ? itemData['item-name'] : 'Unknown Item',
          quantity: item.quantity,
          price: itemData ? itemData['item-price'] : 0,
          total_item_price: itemData ? (itemData['item-price'] * item.quantity) : 0
        };
      }));

      const totalItemsInOrder = itemDetails.reduce((sum, item) => sum + item.quantity, 0);

      return {
        order: {
          order_id: order.Quick_Order_id,
          order_status: order.Order_Status,
          persons_count: order.Persons_Count,
          late_time: lateTime,
          waiting_time: order.Wating_Time,
          created_at: order.CreateAt
        },
        client: {
          mobile_no: order.client_mobile_no
        },
        table: {
          table_id: tableData?.Table_id,
          table_name: tableData?.['Table-name'],
          table_code: tableData?.['Table-code']
        },
        floor: {
          floor_id: floorData?.Floor_id,
          floor_name: floorData?.Floor_Name
        },
        products: {
          total_items_in_order: totalItemsInOrder,
          items: itemDetails
        },
        tax: {
          tax_percentage: order.Tax,
          tax_amount: Math.round((order.SubTotal * order.Tax) / 100)
        },
        subtotal: order.SubTotal,
        total: order.Total,
        employee: {
          employee_id: employeeData?.Employee_id,
          name: employeeData?.Name || 'Unknown Employee'
        }
      };
    }));

    res.status(200).json({
      success: true,
      message: `Order history for mobile number ${mobile_no} retrieved successfully`,
      data: {
        mobile_no: mobile_no,
        orders: processedOrders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalOrders / limit),
          total_orders: totalOrders,
          orders_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getOrderHistoryByClientMobileNo:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Order History by Employee ID
const getOrderHistoryByEmployeeId = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const query = {
      Status: true,
      get_order_Employee_id: employee_id
    };

    const orders = await Quick_Order.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Quick_Order.countDocuments(query);

    if (totalOrders === 0) {
      return res.status(200).json({
        success: true,
        message: `No orders found for employee ID ${employee_id}`,
        data: {
          employee_id: employee_id,
          orders: [],
          pagination: {
            current_page: parseInt(page),
            total_pages: 0,
            total_orders: 0,
            orders_per_page: parseInt(limit)
          }
        }
      });
    }

    // Process orders similar to main function
    const processedOrders = await Promise.all(orders.map(async (order) => {
      const currentTime = new Date();
      const orderTime = new Date(order.CreateAt);
      const lateTime = Math.floor((currentTime - orderTime) / (1000 * 60));

      // Get related data manually
      const [floorData, tableData, tableBookingStatusData, employeeData] = await Promise.all([
        Floor.findOne({ Floor_id: order.Floor_id, Status: true }),
        Table.findOne({ Table_id: order.Table_id, Status: true }),
        TableBookingStatus.findOne({ Table_Booking_Status_id: order.Table_Booking_Status_id, Status: true }),
        User.findOne({ user_id: order.get_order_Employee_id, Status: true })
      ]);

      const itemDetails = await Promise.all(order.item_ids.map(async (item) => {
        const itemData = await Items.findOne({ Items_id: item.item_id });
        return {
          item_id: item.item_id,
          name: itemData ? itemData['item-name'] : 'Unknown Item',
          quantity: item.quantity,
          price: itemData ? itemData['item-price'] : 0,
          total_item_price: itemData ? (itemData['item-price'] * item.quantity) : 0
        };
      }));

      const totalItemsInOrder = itemDetails.reduce((sum, item) => sum + item.quantity, 0);

      return {
        order: {
          order_id: order.Quick_Order_id,
          order_status: order.Order_Status,
          persons_count: order.Persons_Count,
          late_time: lateTime,
          waiting_time: order.Wating_Time,
          created_at: order.CreateAt
        },
        client: {
          mobile_no: order.client_mobile_no
        },
        table: {
          table_id: tableData?.Table_id,
          table_name: tableData?.['Table-name'],
          table_code: tableData?.['Table-code']
        },
        floor: {
          floor_id: floorData?.Floor_id,
          floor_name: floorData?.Floor_Name
        },
        products: {
          total_items_in_order: totalItemsInOrder,
          items: itemDetails
        },
        tax: {
          tax_percentage: order.Tax,
          tax_amount: Math.round((order.SubTotal * order.Tax) / 100)
        },
        subtotal: order.SubTotal,
        total: order.Total,
        employee: {
          employee_id: employeeData?.Employee_id,
          name: employeeData?.Name || 'Unknown Employee'
        }
      };
    }));

    res.status(200).json({
      success: true,
      message: `Order history for employee ID ${employee_id} retrieved successfully`,
      data: {
        employee_id: employee_id,
        orders: processedOrders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalOrders / limit),
          total_orders: totalOrders,
          orders_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getOrderHistoryByEmployeeId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Order History by Auth (current logged in user)
const getOrderHistoryByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const orderHistories = await Order_History.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!orderHistories || orderHistories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order histories not found for current user'
      });
    }

    // Manually fetch related data for all order histories
    const orderHistoriesResponse = await Promise.all(orderHistories.map(async (orderHistory) => {
      const [createByUser, updatedByUser] = await Promise.all([
        orderHistory.CreateBy ? User.findOne({ user_id: orderHistory.CreateBy }) : null,
        orderHistory.UpdatedBy ? User.findOne({ user_id: orderHistory.UpdatedBy }) : null
      ]);

      const orderHistoryObj = orderHistory.toObject();
      orderHistoryObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      orderHistoryObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return orderHistoryObj;
    }));

    res.status(200).json({
      success: true,
      count: orderHistoriesResponse.length,
      data: orderHistoriesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order histories',
      error: error.message
    });
  }
};

// Weekly orders summary for chart
const getWeeklyOrdersSummary = async (req, res) => {
  try {
    const { employee_id } = req.query;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    const weekday = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - weekday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const matchQuery = {
      Status: true,
      CreateAt: {
        $gte: startOfWeek,
        $lt: endOfWeek
      }
    };

    if (employee_id) {
      matchQuery.get_order_Employee_id = employee_id;
    }

    const dayKeyMap = {
      1: { key: 'S', label: 'Sunday' },
      2: { key: 'M', label: 'Monday' },
      3: { key: 'T', label: 'Tuesday' },
      4: { key: 'W', label: 'Wednesday' },
      5: { key: 'T2', label: 'Thursday' },
      6: { key: 'F', label: 'Friday' },
      7: { key: 'S2', label: 'Saturday' }
    };

    const baseWeekData = Object.values(dayKeyMap).reduce((acc, day) => {
      acc[day.key] = {
        day: day.label,
        orders: 0
      };
      return acc;
    }, {});

    const dayAggregation = await Quick_Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { dayOfWeek: { $dayOfWeek: '$CreateAt' } },
          orders: { $sum: 1 }
        }
      }
    ]);

    dayAggregation.forEach((entry) => {
      const mapKey = dayKeyMap[entry._id.dayOfWeek]?.key;
      if (mapKey) {
        baseWeekData[mapKey].orders = entry.orders;
      }
    });

    const employeeAggregation = await Quick_Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$get_order_Employee_id',
          orders: { $sum: 1 }
        }
      },
      { $sort: { orders: -1 } }
    ]);

    const employeeIds = employeeAggregation.map((item) => item._id).filter(Boolean);
    const employees = await User.find({ user_id: { $in: employeeIds } })
      .select({ user_id: 1, Name: 1 })
      .lean();

    const employeeMap = employees.reduce((acc, emp) => {
      acc[emp.user_id] = emp;
      return acc;
    }, {});

    const employeeTotals = employeeAggregation.map((item) => ({
      employee_id: item._id,
      employee_name: employeeMap[item._id]?.Name || 'Unknown Employee',
      orders: item.orders
    }));

    const totalOrders = employeeAggregation.reduce((sum, item) => sum + item.orders, 0);

    const uniqueCustomersAgg = await Quick_Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$client_mobile_no'
        }
      },
      { $count: 'uniqueCustomers' }
    ]);
    const totalCustomers = uniqueCustomersAgg[0]?.uniqueCustomers || 0;

    const totalOrdersServed = await Quick_Order.countDocuments({
      ...matchQuery,
      Order_Status: 'Served'
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayMatchQuery = {
      ...matchQuery,
      CreateAt: {
        $gte: todayStart,
        $lt: todayEnd
      }
    };

    const firstOrderToday = await Quick_Order.findOne(todayMatchQuery)
      .sort({ CreateAt: 1 })
      .select({ CreateAt: 1 })
      .lean();
    const lastOrderToday = await Quick_Order.findOne(todayMatchQuery)
      .sort({ CreateAt: -1 })
      .select({ CreateAt: 1 })
      .lean();

    let todayWorkingHours = 0;
    if (firstOrderToday && lastOrderToday) {
      const diffMs = new Date(lastOrderToday.CreateAt) - new Date(firstOrderToday.CreateAt);
      todayWorkingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    res.status(200).json({
      success: true,
      message: 'Weekly orders summary retrieved successfully',
      data: {
        week_range: {
          start: startOfWeek,
          end: endOfWeek
        },
        filter: {
          employee_id: employee_id || null
        },
        chart: baseWeekData,
        employees: employeeTotals,
        total_orders: totalOrders,
        summary: {
          totalCustomer: totalCustomers,
          totalOrderServed: totalOrdersServed,
          todayWorkingHour: todayWorkingHours
        }
      }
    });
  } catch (error) {
    console.error('Error in getWeeklyOrdersSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getOrderHistory,
  getOrderHistoryByDateRange,
  getOrderHistoryByStatus,
  getOrderHistoryByTable,
  getOrderHistoryByClientMobileNo,
  getOrderHistoryByEmployeeId,
  getOrderHistoryByAuth,
  getWeeklyOrdersSummary
};
