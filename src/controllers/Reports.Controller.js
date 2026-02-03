const Pos_Point_sales_Order = require('../models/Pos_Point_sales_Order.model');
const Quick_Order = require('../models/Quick_Order.model');
const Customer = require('../models/Customer.model');
const Items = require('../models/Items.model');
const Tokens = require('../models/Tokens.model');
const Invoices = require('../models/Invoices.model');
const Clients = require('../models/Clients.model');
const User = require('../models/User.model');
const Role = require('../models/Role.model');
const Admin_Plan_buy_Restaurant = require('../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../models/Admin_Plan.model');
const City = require('../models/City.model');
const Clock = require('../models/Clock.model');
const Reservations = require('../models/Reservations.model');
const Table = require('../models/Table.model');
const Employee_Feedback = require('../models/Employee_Feedback.model');
const Currency = require('../models/currency.model');
const Transaction = require('../models/Transaction.model');

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'six_month':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'one_year':
      return {
        start: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    default:
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
  }
};

// Helper function to get top sellers
const getTopSellers = async (dateRange) => {
  try {
    // Get POS orders in date range
    const posOrders = await Pos_Point_sales_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    }).populate('items.item_id', 'item-name');

    // Get Quick orders in date range
    const quickOrders = await Quick_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    }).populate('item_ids.item_id', 'item-name');

    // Combine and count items
    const itemCounts = {};

    // Process POS orders
    posOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.item_id) {
          const itemName = item.item_id['item-name'];
          const quantity = item.item_Quentry || 0;
          itemCounts[itemName] = (itemCounts[itemName] || 0) + quantity;
        }
      });
    });

    // Process Quick orders
    quickOrders.forEach(order => {
      order.item_ids.forEach(item => {
        if (item.item_id) {
          const itemName = item.item_id['item-name'];
          const quantity = item.quantity || 0;
          itemCounts[itemName] = (itemCounts[itemName] || 0) + quantity;
        }
      });
    });

    // Convert to array and sort by quantity
    const topSellers = Object.entries(itemCounts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10); // Top 10

    return topSellers;
  } catch (error) {
    console.error('Error getting top sellers:', error);
    return [];
  }
};

// Helper function to get payment breakdown
const getPaymentBreakdown = async (dateRange) => {
  try {
    // Get tokens used in date range
    const tokens = await Tokens.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Count payment types
    const paymentCounts = {
      card: 0,
      cash: 0,
      'Apple pay': 0,
      'G pay': 0,
      'Gift Coupon': 0
    };

    tokens.forEach(token => {
      const tokenName = token.TokenName.toLowerCase();
      if (tokenName.includes('card')) {
        paymentCounts.card++;
      } else if (tokenName.includes('cash')) {
        paymentCounts.cash++;
      } else if (tokenName.includes('apple')) {
        paymentCounts['Apple pay']++;
      } else if (tokenName.includes('google') || tokenName.includes('g pay')) {
        paymentCounts['G pay']++;
      } else if (tokenName.includes('gift') || tokenName.includes('coupon')) {
        paymentCounts['Gift Coupon']++;
      }
    });

    return paymentCounts;
  } catch (error) {
    console.error('Error getting payment breakdown:', error);
    return {
      card: 0,
      cash: 0,
      'Apple pay': 0,
      'G pay': 0,
      'Gift Coupon': 0
    };
  }
};

// Reports Today
const reportsToday = async (req, res) => {
  try {
    const dateRange = getDateRange('today');
    
    // Get orders in date range
    const posOrders = await Pos_Point_sales_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    const quickOrders = await Quick_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get customers in date range
    const customers = await Customer.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get all customers for repeat customer calculation
    const allCustomers = await Customer.find({ Status: true });
    const customerOrderCounts = {};

    // Count orders per customer
    [...posOrders, ...quickOrders].forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const newCustomers = customers.length;

    // Calculate totals
    const totalOrders = posOrders.length + quickOrders.length;
    const totalSales = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Total || 0), 0);
    const totalTax = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Tax || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get top sellers and payment breakdown
    const topSellers = await getTopSellers(dateRange);
    const paymentBreakdown = await getPaymentBreakdown(dateRange);

    const report = {
      period: 'Today',
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      },
      topSellers,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalCustomers: allCustomers.length,
      newCustomers,
      repeatCustomers,
      netSales: totalSales,
      tax: totalTax,
      payment: paymentBreakdown
    };

    res.status(200).json({
      success: true,
      message: 'Today\'s report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error generating today\'s report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating today\'s report',
      error: error.message
    });
  }
};

// Reports Month
const reportsMonth = async (req, res) => {
  try {
    const dateRange = getDateRange('month');
    
    // Get orders in date range
    const posOrders = await Pos_Point_sales_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    const quickOrders = await Quick_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get customers in date range
    const customers = await Customer.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get all customers for repeat customer calculation
    const allCustomers = await Customer.find({ Status: true });
    const customerOrderCounts = {};

    // Count orders per customer
    [...posOrders, ...quickOrders].forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const newCustomers = customers.length;

    // Calculate totals
    const totalOrders = posOrders.length + quickOrders.length;
    const totalSales = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Total || 0), 0);
    const totalTax = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Tax || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get top sellers and payment breakdown
    const topSellers = await getTopSellers(dateRange);
    const paymentBreakdown = await getPaymentBreakdown(dateRange);

    const report = {
      period: 'This Month',
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      },
      topSellers,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalCustomers: allCustomers.length,
      newCustomers,
      repeatCustomers,
      netSales: totalSales,
      tax: totalTax,
      payment: paymentBreakdown
    };

    res.status(200).json({
      success: true,
      message: 'Monthly report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating monthly report',
      error: error.message
    });
  }
};

// Reports Six Month
const reportsSixMonth = async (req, res) => {
  try {
    const dateRange = getDateRange('six_month');
    
    // Get orders in date range
    const posOrders = await Pos_Point_sales_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    const quickOrders = await Quick_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get customers in date range
    const customers = await Customer.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get all customers for repeat customer calculation
    const allCustomers = await Customer.find({ Status: true });
    const customerOrderCounts = {};

    // Count orders per customer
    [...posOrders, ...quickOrders].forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const newCustomers = customers.length;

    // Calculate totals
    const totalOrders = posOrders.length + quickOrders.length;
    const totalSales = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Total || 0), 0);
    const totalTax = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Tax || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get top sellers and payment breakdown
    const topSellers = await getTopSellers(dateRange);
    const paymentBreakdown = await getPaymentBreakdown(dateRange);

    const report = {
      period: 'Last Six Months',
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      },
      topSellers,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalCustomers: allCustomers.length,
      newCustomers,
      repeatCustomers,
      netSales: totalSales,
      tax: totalTax,
      payment: paymentBreakdown
    };

    res.status(200).json({
      success: true,
      message: 'Six months report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error generating six months report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating six months report',
      error: error.message
    });
  }
};

// Reports One Year
const reportsOneYear = async (req, res) => {
  try {
    const dateRange = getDateRange('one_year');
    
    // Get orders in date range
    const posOrders = await Pos_Point_sales_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    const quickOrders = await Quick_Order.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get customers in date range
    const customers = await Customer.find({
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true
    });

    // Get all customers for repeat customer calculation
    const allCustomers = await Customer.find({ Status: true });
    const customerOrderCounts = {};

    // Count orders per customer
    [...posOrders, ...quickOrders].forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const newCustomers = customers.length;

    // Calculate totals
    const totalOrders = posOrders.length + quickOrders.length;
    const totalSales = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Total || 0), 0);
    const totalTax = [...posOrders, ...quickOrders].reduce((sum, order) => sum + (order.Tax || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get top sellers and payment breakdown
    const topSellers = await getTopSellers(dateRange);
    const paymentBreakdown = await getPaymentBreakdown(dateRange);

    const report = {
      period: 'Last One Year',
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      },
      topSellers,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalCustomers: allCustomers.length,
      newCustomers,
      repeatCustomers,
      netSales: totalSales,
      tax: totalTax,
      payment: paymentBreakdown
    };

    res.status(200).json({
      success: true,
      message: 'One year report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error generating one year report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating one year report',
      error: error.message
    });
  }
};

// Restaurant Performance API
const restaurantPerformance = async (req, res) => {
  try {
    // Get restaurant ID from route parameter
    const { id } = req.params;
    const parsedRestaurantId = parseInt(id);

    if (!id || isNaN(parsedRestaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    // Verify restaurant user exists and has restaurant role
    const restaurantUser = await User.findOne({ user_id: parsedRestaurantId });
    
    if (!restaurantUser) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurantRole = await Role.findOne({ Role_id: restaurantUser.Role_id });
    if (!restaurantRole || restaurantRole.role_name?.toLowerCase() !== 'restaurant') {
      return res.status(400).json({
        success: false,
        message: 'Provided user is not associated with a restaurant role'
      });
    }

    // Get all employees created by this restaurant
    const employees = await User.find({ 
      CreateBy: parsedRestaurantId, 
      Status: true 
    });
    const employeeIds = employees.map(emp => emp.user_id);

    // Get orders filtered by restaurant
    const posOrderQuery = { 
      Restaurant_id: parsedRestaurantId,
      Status: true 
    };
    
    const quickOrderQuery = { 
      Status: true 
    };
    
    if (employeeIds.length > 0) {
      quickOrderQuery['get_order_Employee_id'] = { $in: employeeIds };
    } else {
      // If no employees found, return empty result for Quick Orders
      quickOrderQuery['get_order_Employee_id'] = { $in: [-1] };
    }

    const [posOrders, quickOrders] = await Promise.all([
      Pos_Point_sales_Order.find(posOrderQuery),
      Quick_Order.find(quickOrderQuery)
    ]);

    // Calculate TotalSalesCount (total revenue)
    const totalSalesCount = [...posOrders, ...quickOrders].reduce(
      (sum, order) => sum + (order.Total || 0), 
      0
    );

    // Calculate TotalOrderCount
    const totalOrderCount = posOrders.length + quickOrders.length;

    // Get TotalActiveClientsCount - filter clients created by restaurant or its employees
    const clientCreators = [parsedRestaurantId, ...employeeIds];
    const totalActiveClientsCount = await Clients.countDocuments({ 
      CreateBy: { $in: clientCreators },
      Status: true 
    });

    // Get customers - filter by restaurant employees
    const customerFilter = { 
      Status: true 
    };
    if (employeeIds.length > 0) {
      customerFilter.CreateBy = { $in: employeeIds };
    }
    const allCustomers = await Customer.find(customerFilter);

    // Calculate new customers (customers created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomerFilter = {
      CreateAt: { $gte: thirtyDaysAgo },
      Status: true
    };
    if (employeeIds.length > 0) {
      newCustomerFilter.CreateBy = { $in: employeeIds };
    }
    
    const newCustomers = await Customer.countDocuments(newCustomerFilter);

    // Calculate repeat customers (customers with more than 1 order)
    const customerOrderCounts = {};
    
    // Count orders per customer from POS orders
    posOrders.forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    // Count orders per customer from Quick orders by matching phone to Customer_id
    quickOrders.forEach(order => {
      if (order.client_mobile_no) {
        // Try to match Quick Order phone with Customer record
        const customer = allCustomers.find(c => c.phone === order.client_mobile_no);
        if (customer) {
          customerOrderCounts[customer.Customer_id] = (customerOrderCounts[customer.Customer_id] || 0) + 1;
        }
      }
    });

    // Count repeat customers (customers with more than 1 order)
    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;

    // Calculate Average Order Value
    const avgOrderValue = totalOrderCount > 0 
      ? parseFloat((totalSalesCount / totalOrderCount).toFixed(2))
      : 0;

    // Prepare response
    const performanceData = {
      TotalSalesCount: totalSalesCount,
      TotalOrderCount: totalOrderCount,
      TotalActiveClientsCount: totalActiveClientsCount,
      getNewCustomers: newCustomers,
      getRepeatCustomers: repeatCustomers,
      getAvgOrderValue: avgOrderValue,
      Chart: null,
      Restaurant: {
        Restaurant_id: restaurantUser.user_id,
        Name: restaurantUser.Name,
        email: restaurantUser.email
      }
    };

    res.status(200).json({
      success: true,
      message: 'Restaurant performance data retrieved successfully',
      data: performanceData
    });
  } catch (error) {
    console.error('Error fetching restaurant performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant performance data',
      error: error.message
    });
  }
};

// Helper function to get date range for restaurant performance
const getRestaurantPerformanceDateRange = (filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'Day':
    case 'day':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'Week':
    case 'week':
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - dayOfWeek);
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'Month':
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case '6 Month':
    case '6month':
    case '6Month':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    default:
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
  }
};

// Restaurant Performance API with filters and chart
const restaurant_performoance = async (req, res) => {
  try {
    const { filter = 'Day' } = req.query; // filter: Day, Week, Month, 6 Month
    const { id } = req.params; // restaurant ID
    const parsedRestaurantId = parseInt(id);

    if (!id || isNaN(parsedRestaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    // Verify restaurant user exists and has restaurant role
    const restaurantUser = await User.findOne({ user_id: parsedRestaurantId });
    
    if (!restaurantUser) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurantRole = await Role.findOne({ Role_id: restaurantUser.Role_id });
    if (!restaurantRole || restaurantRole.role_name?.toLowerCase() !== 'restaurant') {
      return res.status(400).json({
        success: false,
        message: 'Provided user is not associated with a restaurant role'
      });
    }

    // Get date range based on filter
    const dateRange = getRestaurantPerformanceDateRange(filter);

    // Get all employees created by this restaurant
    const employees = await User.find({ 
      CreateBy: parsedRestaurantId, 
      Status: true 
    });
    const employeeIds = employees.map(emp => emp.user_id);

    // Get orders filtered by restaurant and date range
    const posOrderQuery = { 
      Restaurant_id: parsedRestaurantId,
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true 
    };
    
    const quickOrderQuery = { 
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true 
    };
    
    if (employeeIds.length > 0) {
      quickOrderQuery['get_order_Employee_id'] = { $in: employeeIds };
    } else {
      quickOrderQuery['get_order_Employee_id'] = { $in: [-1] };
    }

    const [posOrders, quickOrders] = await Promise.all([
      Pos_Point_sales_Order.find(posOrderQuery),
      Quick_Order.find(quickOrderQuery)
    ]);

    // Calculate TotalSales (total revenue)
    const totalSales = [...posOrders, ...quickOrders].reduce(
      (sum, order) => sum + (order.Total || 0), 
      0
    );

    // Calculate TotalOrders
    const totalOrders = posOrders.length + quickOrders.length;

    // Get TotalActiveRestourentClient - filter clients created by restaurant or its employees within date range
    const clientCreators = [parsedRestaurantId, ...employeeIds];
    const totalActiveRestourentClient = await Clients.countDocuments({ 
      CreateBy: { $in: clientCreators },
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true 
    });

    // Get customers - filter by restaurant employees and date range
    const customerFilter = { 
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end },
      Status: true 
    };
    if (employeeIds.length > 0) {
      customerFilter.CreateBy = { $in: employeeIds };
    }
    const allCustomers = await Customer.find(customerFilter);

    // Calculate new customers (customers created in the date range)
    const newCustomers = allCustomers.length;

    // Calculate repeat customers (customers with more than 1 order in the date range)
    const customerOrderCounts = {};
    
    // Count orders per customer from POS orders
    posOrders.forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    // Count orders per customer from Quick orders
    quickOrders.forEach(order => {
      if (order.client_mobile_no) {
        const customer = allCustomers.find(c => c.phone === order.client_mobile_no);
        if (customer) {
          customerOrderCounts[customer.Customer_id] = (customerOrderCounts[customer.Customer_id] || 0) + 1;
        }
      }
    });

    // Count repeat customers (customers with more than 1 order)
    const repeactCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;

    // Calculate Average Order Value
    const avgOrderValue = totalOrders > 0 
      ? parseFloat((totalSales / totalOrders).toFixed(2))
      : 0;

    // Create Restaurant_performoance_chart with [Earning, Hour] format
    const Restaurant_performoance_chart = [];
    
    // Initialize earnings for each hour (0-23)
    const hourlyEarnings = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyEarnings[hour] = 0;
    }

    // Calculate earnings by hour from all orders
    [...posOrders, ...quickOrders].forEach(order => {
      if (order.CreateAt) {
        const orderDate = new Date(order.CreateAt);
        const hour = orderDate.getHours();
        hourlyEarnings[hour] = (hourlyEarnings[hour] || 0) + (order.Total || 0);
      }
    });

    // Format chart data as [Earning, Hour]
    for (let hour = 0; hour < 24; hour++) {
      Restaurant_performoance_chart.push({
        Hour: hour,
        Earning: parseFloat(hourlyEarnings[hour].toFixed(2))
      });
    }

    // Prepare response
    const performanceData = {
      TotalSales: parseFloat(totalSales.toFixed(2)),
      TotalOrders: totalOrders,
      TotalActiveRestourentClient: totalActiveRestourentClient,
      NewCustomers: newCustomers,
      repeactCustomers: repeactCustomers,
      AvgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      Restaurant_performoance_chart: Restaurant_performoance_chart,
      filter: filter,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      }
    };

    res.status(200).json({
      success: true,
      message: 'Restaurant performance data retrieved successfully',
      data: performanceData
    });
  } catch (error) {
    console.error('Error fetching restaurant performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant performance data',
      error: error.message
    });
  }
};

// Restaurant Top Performers API
const restaurant_Top_Performer = async (req, res) => {
  try {
    // Get restaurant role
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    // Get all restaurant users
    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    if (restaurantUsers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No restaurants found',
        count: 0,
        data: []
      });
    }

    // Process each restaurant to calculate total sales and get renewal date
    const restaurantPerformers = await Promise.all(
      restaurantUsers.map(async (restaurant) => {
        const restaurantId = restaurant.user_id;

        // Get all employees created by this restaurant
        const employees = await User.find({
          CreateBy: restaurantId,
          Status: true
        });
        const employeeIds = employees.map(emp => emp.user_id);

        // Get POS orders for this restaurant
        const posOrders = await Pos_Point_sales_Order.find({
          Restaurant_id: restaurantId,
          Status: true
        });

        // Get Quick orders for this restaurant (via employees)
        let quickOrders = [];
        if (employeeIds.length > 0) {
          quickOrders = await Quick_Order.find({
            get_order_Employee_id: { $in: employeeIds },
            Status: true
          });
        }

        // Calculate total sales
        const totalSales = [...posOrders, ...quickOrders].reduce(
          (sum, order) => sum + (order.Total || 0),
          0
        );

        // Get renewal date from Admin_Plan_buy_Restaurant
        // Get the most recent active plan with successful payment
        const activePlan = await Admin_Plan_buy_Restaurant.findOne({
          CreateBy: restaurantId,
          isActive: true,
          paymentStatus: true,
          Status: true
        }).sort({ expiry_date: -1 });

        const renewalDate = activePlan?.expiry_date || null;

        return {
          restourent_id: restaurantId,
          totalesale: parseFloat(totalSales.toFixed(2)),
          renewaldate: renewalDate
        };
      })
    );

    // Sort by total sales descending (top performers first)
    restaurantPerformers.sort((a, b) => b.totalesale - a.totalesale);

    res.status(200).json({
      success: true,
      message: 'Restaurant top performers retrieved successfully',
      count: restaurantPerformers.length,
      data: restaurantPerformers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant top performers',
      error: error.message
    });
  }
};

// Reports API with Active/Inactive Restaurants and Charts
const reports = async (req, res) => {
  try {
    // Get restaurant role
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    // Get all restaurant users
    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate active and inactive restaurants
    let TotalActiverestaurant = 0;
    let TotalInacitverestaurant = 0;
    let totalRenewals = 0;

    const activeRestaurants = [];
    const inactiveRestaurants = [];

    for (const restaurant of restaurantUsers) {
      const activePlan = await Admin_Plan_buy_Restaurant.findOne({
        CreateBy: restaurant.user_id,
        isActive: true,
        paymentStatus: true,
        Status: true
      }).sort({ CreateAt: -1 });

      let isActive = false;
      if (activePlan && activePlan.expiry_date) {
        const expiryDate = new Date(activePlan.expiry_date);
        if (expiryDate > now) {
          isActive = true;
        }
      } else if (activePlan && !activePlan.expiry_date) {
        isActive = true; // No expiry means active
      }

      if (isActive) {
        TotalActiverestaurant++;
        activeRestaurants.push(restaurant.user_id);
      } else {
        TotalInacitverestaurant++;
        inactiveRestaurants.push(restaurant.user_id);
      }

      // Count renewals (plans with paymentStatus = true)
      const renewals = await Admin_Plan_buy_Restaurant.countDocuments({
        CreateBy: restaurant.user_id,
        paymentStatus: true,
        Status: true
      });
      if (renewals > 1) {
        totalRenewals += renewals - 1; // Subtract 1 for initial purchase
      }
    }

    const TotalRenewalRate = restaurantUsers.length > 0 
      ? parseFloat((totalRenewals / restaurantUsers.length).toFixed(2))
      : 0;

    // Helper function to calculate date ranges
    const getDateRange = (period) => {
      const start = new Date(today);
      const end = new Date(today);
      
      switch (period) {
        case 'week':
          start.setDate(today.getDate() - 7);
          break;
        case 'month':
          start.setMonth(today.getMonth() - 1);
          break;
        case 'halfYear':
          start.setMonth(today.getMonth() - 6);
          break;
        case 'year':
          start.setFullYear(today.getFullYear() - 1);
          break;
        default:
          start.setDate(today.getDate() - 7);
      }
      return { start, end };
    };

    // Helper function to calculate percentage change
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(2));
    };

    // Calculate active chart data
    const calculateActiveChart = async (period) => {
      const { start, end } = getDateRange(period);
      const previousStart = new Date(start);
      previousStart.setTime(previousStart.getTime() - (end - start));

      // Get new clients (restaurants created in period)
      const newClients = await User.countDocuments({
        Role_id: restaurantRole.Role_id,
        Status: true,
        CreateAt: { $gte: start, $lt: end }
      });

      // Get renewed clients (restaurants with plan purchases in period)
      const renewedClients = await Admin_Plan_buy_Restaurant.distinct('CreateBy', {
        paymentStatus: true,
        Status: true,
        CreateAt: { $gte: start, $lt: end }
      });

      // Previous period data
      const previousNewClients = await User.countDocuments({
        Role_id: restaurantRole.Role_id,
        Status: true,
        CreateAt: { $gte: previousStart, $lt: start }
      });

      const previousRenewedClients = await Admin_Plan_buy_Restaurant.distinct('CreateBy', {
        paymentStatus: true,
        Status: true,
        CreateAt: { $gte: previousStart, $lt: start }
      });

      const newClientsPercentage = calculatePercentageChange(newClients, previousNewClients);
      const renewedClientsPercentage = calculatePercentageChange(renewedClients.length, previousRenewedClients.length);

      return {
        newClients,
        renewedClients: renewedClients.length,
        percentageChange: parseFloat(((newClientsPercentage + renewedClientsPercentage) / 2).toFixed(2))
      };
    };

    // Calculate inactive chart data
    const calculateInactiveChart = async (period) => {
      const { start, end } = getDateRange(period);
      const previousStart = new Date(start);
      previousStart.setTime(previousStart.getTime() - (end - start));

      // Get inactive clients (restaurants with expired or no active plans)
      let inactiveClients = 0;
      const restaurantsInPeriod = await User.find({
        Role_id: restaurantRole.Role_id,
        Status: true,
        CreateAt: { $gte: start, $lt: end }
      });

      for (const restaurant of restaurantsInPeriod) {
        const activePlan = await Admin_Plan_buy_Restaurant.findOne({
          CreateBy: restaurant.user_id,
          isActive: true,
          paymentStatus: true,
          Status: true
        }).sort({ CreateAt: -1 });

        let isActive = false;
        if (activePlan && activePlan.expiry_date) {
          const expiryDate = new Date(activePlan.expiry_date);
          if (expiryDate > now) {
            isActive = true;
          }
        } else if (activePlan && !activePlan.expiry_date) {
          isActive = true;
        }

        if (!isActive) {
          inactiveClients++;
        }
      }

      // Previous period
      const previousRestaurants = await User.find({
        Role_id: restaurantRole.Role_id,
        Status: true,
        CreateAt: { $gte: previousStart, $lt: start }
      });

      let previousInactiveClients = 0;
      for (const restaurant of previousRestaurants) {
        const activePlan = await Admin_Plan_buy_Restaurant.findOne({
          CreateBy: restaurant.user_id,
          isActive: true,
          paymentStatus: true,
          Status: true
        }).sort({ CreateAt: -1 });

        let isActive = false;
        if (activePlan && activePlan.expiry_date) {
          const expiryDate = new Date(activePlan.expiry_date);
          if (expiryDate > now) {
            isActive = true;
          }
        } else if (activePlan && !activePlan.expiry_date) {
          isActive = true;
        }

        if (!isActive) {
          previousInactiveClients++;
        }
      }

      const percentageChange = calculatePercentageChange(inactiveClients, previousInactiveClients);

      return {
        inactiveClients,
        percentageChange
      };
    };

    // Generate chart data
    const [activeWeek, activeMonth, activeHalfYear, activeYear] = await Promise.all([
      calculateActiveChart('week'),
      calculateActiveChart('month'),
      calculateActiveChart('halfYear'),
      calculateActiveChart('year')
    ]);

    const [inactiveWeek, inactiveMonth, inactiveHalfYear, inactiveYear] = await Promise.all([
      calculateInactiveChart('week'),
      calculateInactiveChart('month'),
      calculateInactiveChart('halfYear'),
      calculateInactiveChart('year')
    ]);

    res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      reports: {
        TotalActiverestaurant,
        TotalInacitverestaurant,
        TotalRenewalRate
      },
      Chart: {
        active: {
          week: activeWeek,
          month: activeMonth,
          halfYear: activeHalfYear,
          year: activeYear
        },
        inactive: {
          week: inactiveWeek,
          month: inactiveMonth,
          halfYear: inactiveHalfYear,
          year: inactiveYear
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// City Wise Usage Report
const cityWiseUsageReport = async (req, res) => {
  try {
    // Get restaurant role
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    // Get all restaurant users (clients)
    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    // Group restaurants by city
    const cityRestaurantCount = {};
    restaurantUsers.forEach(restaurant => {
      const cityId = restaurant.City_id;
      if (!cityRestaurantCount[cityId]) {
        cityRestaurantCount[cityId] = 0;
      }
      cityRestaurantCount[cityId]++;
    });

    // Get city details
    const cityIds = Object.keys(cityRestaurantCount).map(id => parseInt(id));
    const cities = await City.find({
      City_id: { $in: cityIds },
      Status: true
    });

    const cityMap = cities.reduce((map, city) => {
      map[city.City_id] = city;
      return map;
    }, {});

    // Build response
    const cityWiseData = Object.entries(cityRestaurantCount).map(([cityId, count]) => {
      const city = cityMap[parseInt(cityId)];
      return {
        City_id: parseInt(cityId),
        City_name: city ? city.City_name : 'Unknown',
        City_code: city ? city.Code : null,
        restaurants_count: count
      };
    }).sort((a, b) => b.restaurants_count - a.restaurants_count);

    res.status(200).json({
      success: true,
      message: 'City wise usage report retrieved successfully',
      count: cityWiseData.length,
      data: cityWiseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching city wise usage report',
      error: error.message
    });
  }
};

// Employee Performance API
const employeePerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const parsedEmployeeId = parseInt(employeeId);

    if (!employeeId || isNaN(parsedEmployeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    // Verify employee exists
    const employee = await User.findOne({ user_id: parsedEmployeeId, Status: true });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get employee role
    const role = await Role.findOne({ Role_id: employee.Role_id });

    // Get today's clock record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayClock = await Clock.findOne({
      user_id: parsedEmployeeId,
      date: { $gte: today, $lt: tomorrow },
      Status: true
    });

    // Calculate WorkedToday (hours worked today)
    let WorkedToday = 0;
    let clockin = null;
    if (todayClock && todayClock.in_time && todayClock.out_time) {
      const inTime = new Date(todayClock.in_time);
      const outTime = new Date(todayClock.out_time);
      WorkedToday = parseFloat(((outTime - inTime) / (1000 * 60 * 60)).toFixed(2));
      clockin = todayClock.in_time;
    } else if (todayClock && todayClock.in_time) {
      // Clocked in but not out yet
      const inTime = new Date(todayClock.in_time);
      const currentTime = new Date();
      WorkedToday = parseFloat(((currentTime - inTime) / (1000 * 60 * 60)).toFixed(2));
      clockin = todayClock.in_time;
    }

    // Calculate MinsBreak (break time in minutes) - assuming 1 hour break for 8+ hour shifts
    let MinsBreak = 0;
    if (WorkedToday >= 8) {
      MinsBreak = 60; // 1 hour break
    } else if (WorkedToday >= 4) {
      MinsBreak = 30; // 30 minutes break
    }

    // Calculate LeavesLeft (using same logic as getEmployeeDetailsById)
    const onboardingDate = new Date(employee.OnboardingDate);
    const currentDate = new Date();
    const experienceInMs = currentDate - onboardingDate;
    const experienceInYears = Math.floor(experienceInMs / (1000 * 60 * 60 * 24 * 365));
    const experienceInMonths = Math.floor((experienceInMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    const standardLeavePerYear = 20;
    const totalLeaves = Math.floor(experienceInYears * standardLeavePerYear) + 
                       Math.floor((experienceInMonths / 12) * standardLeavePerYear);
    
    const clockRecords = await Clock.find({ 
      user_id: parsedEmployeeId, 
      Status: true 
    }).sort({ date: -1 });

    const currentYearStart = new Date(currentDate.getFullYear(), 0, 1);
    const currentYearEnd = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);
    
    const workingDaysThisYear = clockRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= currentYearStart && recordDate <= currentYearEnd && record.in_time;
    }).length;

    const daysInYearSoFar = Math.ceil((currentDate - currentYearStart) / (1000 * 60 * 60 * 24));
    const estimatedWorkingDays = Math.floor(daysInYearSoFar * 0.7);
    const takenLeave = Math.max(0, estimatedWorkingDays - workingDaysThisYear);
    const LeavesLeft = Math.max(0, totalLeaves - takenLeave);

    // Employee Details
    const employeeDetails = {
      Name: `${employee.Name} ${employee.last_name}`.trim(),
      image: employee.user_image || null,
      role: role ? role.role_name : null,
      clockin: clockin,
      WorkedToday: WorkedToday,
      MinsBreak: MinsBreak,
      LeavesLeft: LeavesLeft
    };

    // Calculate AvgWorkingHrs by day of week (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClockRecords = await Clock.find({
      user_id: parsedEmployeeId,
      Status: true,
      in_time: { $exists: true },
      out_time: { $exists: true },
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    // Helper function to get day name
    const getDayName = (date) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    };

    // Group by day of week
    const hoursByDayOfWeek = {
      'Mon': { serving: [], helping: [] },
      'Tue': { serving: [], helping: [] },
      'Wed': { serving: [], helping: [] },
      'Thu': { serving: [], helping: [] },
      'Fri': { serving: [], helping: [] },
      'Sat': { serving: [], helping: [] },
      'Sun': { serving: [], helping: [] }
    };

    recentClockRecords.forEach(record => {
      const dayName = getDayName(new Date(record.date));
      const inTime = new Date(record.in_time);
      const outTime = new Date(record.out_time);
      const hours = (outTime - inTime) / (1000 * 60 * 60);
      
      // For now, we'll use the same hours for both serving and helping
      // You can customize this logic based on your business rules
      hoursByDayOfWeek[dayName].serving.push(hours);
      hoursByDayOfWeek[dayName].helping.push(hours * 0.35); // Assuming 35% helping time
    });

    // Calculate averages - order: Sat, Sun, Mon, Tue, Wed, Thu, Fri
    const AvgWorkingHrs = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
      const servingHours = hoursByDayOfWeek[day].serving;
      const helpingHours = hoursByDayOfWeek[day].helping;
      
      // Calculate average serving hours (actual working hours)
      const servingAvg = servingHours.length > 0
        ? parseFloat((servingHours.reduce((a, b) => a + b, 0) / servingHours.length).toFixed(1))
        : 10; // Default to 10 if no data
      
      // Calculate average helping hours (35% of serving time or separate calculation)
      const helpingAvg = helpingHours.length > 0
        ? parseFloat((helpingHours.reduce((a, b) => a + b, 0) / helpingHours.length).toFixed(1))
        : parseFloat((servingAvg * 0.35).toFixed(1)); // Default to 35% of serving if no data
      
      return {
        day: day,
        serving: servingAvg,
        helping: helpingAvg
      };
    });

    // Calculate totalTipsEarned (last 30 days)
    const posOrders = await Pos_Point_sales_Order.find({
      CreateBy: parsedEmployeeId,
      Status: true,
      CreateAt: { $gte: thirtyDaysAgo }
    });

    const quickOrders = await Quick_Order.find({
      get_order_Employee_id: parsedEmployeeId,
      Status: true,
      CreateAt: { $gte: thirtyDaysAgo }
    });

    // Calculate tips from orders (assuming tip field exists or calculate from amount)
    let totalTips = 0;
    const tipAmounts = [];
    [...posOrders, ...quickOrders].forEach(order => {
      // If tip field exists, use it; otherwise estimate 10% of total as tip
      const tip = order.tip || order.Tip || (order.Total * 0.1);
      if (tip > 0) {
        totalTips += parseFloat(tip);
        tipAmounts.push(parseFloat(tip));
      }
    });

    // Get employee currency
    const employeeCurrency = employee.currency_id 
      ? await Currency.findOne({ currency_id: employee.currency_id })
      : null;

    const avgTipMin = tipAmounts.length > 0 ? Math.min(...tipAmounts) : 0;
    const avgTipMax = tipAmounts.length > 0 ? Math.max(...tipAmounts) : 0;
    const avgTip = tipAmounts.length > 0 ? totalTips / tipAmounts.length : 0;
    const percentage = tipAmounts.length > 0 ? Math.round((avgTip / avgTipMax) * 100) : 0;

    const totalTipsEarned = {
      totalTips: Math.round(totalTips),
      currency: employeeCurrency ? employeeCurrency.name : 'XOF',
      avgTipMin: Math.round(avgTipMin),
      avgTipMax: Math.round(avgTipMax),
      period: '30 days',
      percentage: percentage
    };

    // Get feedbacks
    const employeeFeedbacks = await Employee_Feedback.find({
      employee_id: parsedEmployeeId,
      Status: true
    }).sort({ date: -1 }).limit(10);

    const feedbacks = await Promise.all(employeeFeedbacks.map(async (feedback) => {
      // Get order to find amount and currency
      const order = await Pos_Point_sales_Order.findOne({ POS_Order_id: feedback.order_id }) ||
                    await Quick_Order.findOne({ Quick_Order_id: feedback.order_id });
      
      const orderAmount = order ? order.Total : feedback.amount;
      const orderCurrency = employeeCurrency ? employeeCurrency.name : 'XOF';

      return {
        feedbackId: feedback.Employee_Feedback_id,
        comment: feedback.feedback || '',
        orderId: feedback.order_id.toString(),
        date: feedback.date ? feedback.date.toISOString().split('T')[0] : null,
        amount: Math.round(orderAmount),
        currency: orderCurrency,
        rating: feedback.ratings || 0,
        willRecommend: feedback.willRecommendothers || false
      };
    }));

    // Calculate overallFeedback
    const allFeedbacks = await Employee_Feedback.find({
      employee_id: parsedEmployeeId,
      Status: true
    });

    const overallFeedback = {
      lovedIt: 0,
      good: 0,
      average: 0,
      bad: 0,
      worst: 0
    };

    allFeedbacks.forEach(feedback => {
      const feedbackType = feedback.OveralFeedback?.toLowerCase();
      if (feedbackType === 'lovedit') overallFeedback.lovedIt++;
      else if (feedbackType === 'good') overallFeedback.good++;
      else if (feedbackType === 'averoge') overallFeedback.average++;
      else if (feedbackType === 'bad') overallFeedback.bad++;
      else if (feedbackType === 'warst') overallFeedback.worst++;
    });

    // Calculate staffBehavior and waitingTime
    const validStaffBehavior = allFeedbacks.filter(f => f.staffBehavier && f.staffBehavier.trim() !== '');
    let staffBehavior = 'Loved it';
    
    if (validStaffBehavior.length > 0) {
      const staffBehaviorCounts = {};
      validStaffBehavior.forEach(f => {
        const behavior = f.staffBehavier.trim();
        staffBehaviorCounts[behavior] = (staffBehaviorCounts[behavior] || 0) + 1;
      });

      const mostCommonBehavior = Object.keys(staffBehaviorCounts).reduce((a, b) => 
        staffBehaviorCounts[a] > staffBehaviorCounts[b] ? a : b
      );
      staffBehavior = mostCommonBehavior || 'Loved it';
    }

    const validWaitingTimes = allFeedbacks.filter(f => f.waitingTime > 0);
    const avgWaitingTime = validWaitingTimes.length > 0
      ? validWaitingTimes.reduce((sum, f) => sum + f.waitingTime, 0) / validWaitingTimes.length
      : 0;

    // Categorize waiting time based on average
    let waitingTime = 'Loved it';
    if (avgWaitingTime <= 5) waitingTime = 'Loved it';
    else if (avgWaitingTime <= 10) waitingTime = 'Good';
    else if (avgWaitingTime <= 20) waitingTime = 'Average';
    else if (avgWaitingTime <= 30) waitingTime = 'Bad';
    else waitingTime = 'Worst';

    res.status(200).json({
      success: true,
      message: 'Employee performance retrieved successfully',
      data: {
        employeeDetails,
        AvgWorkingHrs,
        totalTipsEarned,
        feedbacks,
        overallFeedback,
        staffBehavior,
        waitingTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee performance',
      error: error.message
    });
  }
};

// Helper function to get date range for restaurant dashboard
const getRestaurantDashboardDateRange = (filter) => {
  const now = new Date();
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'this_week':
      // Get start of current week (Monday)
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday is day 1
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return {
        start: startOfWeek,
        end: endOfWeek
      };
    case 'this_month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case '6_month':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'one_year':
      return {
        start: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    default:
      // Default to this week
      const defaultDayOfWeek = now.getDay();
      const defaultDiff = defaultDayOfWeek === 0 ? -6 : 1 - defaultDayOfWeek;
      const defaultStartOfWeek = new Date(currentDate);
      defaultStartOfWeek.setDate(currentDate.getDate() + defaultDiff);
      defaultStartOfWeek.setHours(0, 0, 0, 0);
      const defaultEndOfWeek = new Date(defaultStartOfWeek);
      defaultEndOfWeek.setDate(defaultStartOfWeek.getDate() + 7);
      return {
        start: defaultStartOfWeek,
        end: defaultEndOfWeek
      };
  }
};

// Restaurant Dashboard API
const restaurantDashboard = async (req, res) => {
  try {
    // Get filter from query parameter (this_week, this_month, 6_month, one_year)
    const { filter = 'this_week' } = req.query;
    
    // Get restaurant ID from authenticated user or params
    const restaurantId = req.user?.user_id;
    
    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    // Verify restaurant user exists and has restaurant role
    const restaurantUser = await User.findOne({ user_id: restaurantId });
    
    if (!restaurantUser) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurantRole = await Role.findOne({ Role_id: restaurantUser.Role_id });
    if (!restaurantRole || restaurantRole.role_name?.toLowerCase() !== 'restaurant') {
      return res.status(400).json({
        success: false,
        message: 'Provided user is not associated with a restaurant role'
      });
    }

    // Get date range based on filter
    const dateRange = getRestaurantDashboardDateRange(filter);

    // Get all employees created by this restaurant
    const employees = await User.find({ 
      CreateBy: restaurantId, 
      Status: true 
    });
    const employeeIds = employees.map(emp => emp.user_id);

    // Get all orders for this restaurant within date range
    const posOrderQuery = { 
      Restaurant_id: restaurantId,
      Status: true,
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end }
    };
    
    const quickOrderQuery = { 
      Status: true,
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end }
    };
    
    if (employeeIds.length > 0) {
      quickOrderQuery['get_order_Employee_id'] = { $in: employeeIds };
    } else {
      quickOrderQuery['get_order_Employee_id'] = { $in: [-1] };
    }

    const [posOrders, quickOrders, allCustomers] = await Promise.all([
      Pos_Point_sales_Order.find(posOrderQuery).sort({ CreateAt: -1 }),
      Quick_Order.find(quickOrderQuery).sort({ CreateAt: -1 }),
      employeeIds.length > 0 ? Customer.find({ 
        CreateBy: { $in: employeeIds }, 
        Status: true,
        CreateAt: { $gte: dateRange.start, $lt: dateRange.end }
      }) : []
    ]);

    // 1. TotalOrder
    const TotalOrder = posOrders.length + quickOrders.length;

    // 2. TotalSale
    const TotalSale = [...posOrders, ...quickOrders].reduce(
      (sum, order) => sum + (order.Total || 0),
      0
    );

    // Helper function to get day name from date (returns Mon-Sun)
    const getDayName = (date) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    };
    
    // Helper function to reorder days array to start with Monday
    const reorderDays = (data) => {
      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return dayOrder.map(day => data[day] || 0);
    };

    // Helper function to initialize week data
    const initializeWeekData = () => {
      return {
        'Mon': 0,
        'Tue': 0,
        'Wed': 0,
        'Thu': 0,
        'Fri': 0,
        'Sat': 0,
        'Sun': 0
      };
    };

    // Get days for chart data based on filter
    // For week/month/6month/year, we'll show the last 7 days within the range
    const daysForChart = [];
    const endDate = new Date(dateRange.end);
    const startDate = new Date(dateRange.start);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // If filter is this_week, show all 7 days of the week
    // Otherwise, show last 7 days within the range
    const daysToShow = filter === 'this_week' ? 7 : Math.min(7, daysDiff);
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      if (date >= startDate && date < endDate) {
        daysForChart.push(date);
      }
    }

    // 3. RepeatCustomersChart - customers with more than 1 order
    const repeatCustomersData = initializeWeekData();
    const customerOrderCounts = {};
    
    // Count orders per customer
    posOrders.forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    quickOrders.forEach(order => {
      if (order.client_mobile_no) {
        const customer = allCustomers.find(c => c.phone === order.client_mobile_no);
        if (customer) {
          customerOrderCounts[customer.Customer_id] = (customerOrderCounts[customer.Customer_id] || 0) + 1;
        }
      }
    });

    // Get repeat customers (more than 1 order)
    const repeatCustomerIds = Object.keys(customerOrderCounts).filter(
      customerId => customerOrderCounts[customerId] > 1
    ).map(id => parseInt(id));

    // Count repeat customers by day of week within date range
    const repeatCustomersByDay = {};
    daysForChart.forEach(day => {
      const dayName = getDayName(day);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayPosOrders = posOrders.filter(order => {
        const orderDate = new Date(order.CreateAt);
        return orderDate >= day && orderDate < nextDay && repeatCustomerIds.includes(order.Customer_id);
      });
      
      const dayQuickOrders = quickOrders.filter(order => {
        const orderDate = new Date(order.CreateAt);
        if (orderDate >= day && orderDate < nextDay) {
          const customer = allCustomers.find(c => c.phone === order.client_mobile_no);
          return customer && repeatCustomerIds.includes(customer.Customer_id);
        }
        return false;
      });
      
      repeatCustomersByDay[dayName] = (dayPosOrders.length + dayQuickOrders.length);
    });

    // Calculate percentages for RepeatCustomersChart
    const repeatCustomersOrdered = reorderDays(repeatCustomersByDay);
    const maxRepeatCustomers = Math.max(...repeatCustomersOrdered, 1);
    const RepeatCustomersChart = {
      percentage: repeatCustomersOrdered.map(count => 
        Math.round((count / maxRepeatCustomers) * 100)
      ),
      Days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };

    // 4. NewCustomersChart - first-time customers
    const newCustomersData = initializeWeekData();
    
    // Get customers created within date range by day
    daysForChart.forEach(day => {
      const dayName = getDayName(day);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const newCustomersCount = allCustomers.filter(customer => {
        const customerDate = new Date(customer.CreateAt);
        return customerDate >= day && customerDate < nextDay;
      }).length;
      
      newCustomersData[dayName] = newCustomersCount;
    });

    // Calculate percentages for NewCustomersChart
    const newCustomersOrdered = reorderDays(newCustomersData);
    const maxNewCustomers = Math.max(...newCustomersOrdered, 1);
    const NewCustomersChart = {
      percentage: newCustomersOrdered.map(count => 
        Math.round((count / maxNewCustomers) * 100)
      ),
      Days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };

    // 5. ReservationsOrderList - Get recent reservations within date range
    const reservationQuery = {
      Status: true,
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end }
    };
    
    // Include restaurant owner and all employees
    const reservationCreators = [restaurantId, ...employeeIds];
    if (reservationCreators.length > 0) {
      reservationQuery.CreateBy = { $in: reservationCreators };
    } else {
      reservationQuery.CreateBy = { $in: [restaurantId] };
    }
    
    const reservations = await Reservations.find(reservationQuery)
      .sort({ CreateAt: -1 })
      .limit(10);

    // Manually populate Customer and Table data
    const ReservationsOrderList = await Promise.all(reservations.map(async (reservation) => {
      const [customer, table] = await Promise.all([
        reservation.Customer_id ? Customer.findOne({ Customer_id: reservation.Customer_id }) : null,
        reservation.Table_id ? Table.findOne({ table_id: reservation.Table_id }) : null
      ]);

      return {
        Reservations_id: reservation.Reservations_id,
        Customer: customer ? {
          Customer_id: customer.Customer_id,
          Name: customer.Name,
          phone: customer.phone
        } : null,
        Table: table ? {
          Table_id: table.table_id,
          table_name: table.table_name
        } : null,
        slots: reservation.slots,
        slots_time: reservation.slots_time,
        Date_time: reservation.Date_time,
        people_count: reservation.people_count,
        PaymentStatus: reservation.PaymentStatus,
        Status: reservation.Status,
        CreateAt: reservation.CreateAt
      };
    }));

    // 6. TopSellersItemList - Top selling items
    const itemCounts = {};
    
    // Process POS orders
    posOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.item_id) {
            itemCounts[item.item_id] = (itemCounts[item.item_id] || 0) + (item.item_Quentry || 0);
          }
        });
      }
    });

    // Process Quick orders
    quickOrders.forEach(order => {
      if (order.item_ids && Array.isArray(order.item_ids)) {
        order.item_ids.forEach(item => {
          if (item.item_id) {
            itemCounts[item.item_id] = (itemCounts[item.item_id] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    // Get top 10 items
    const topItemIds = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([itemId]) => parseInt(itemId));

    const topItems = await Items.find({ Items_id: { $in: topItemIds }, Status: true });
    
    const TopSellersItemList = topItemIds.map(itemId => {
      const item = topItems.find(i => i.Items_id === itemId);
      return {
        Items_id: itemId,
        item_name: item ? item['item-name'] : 'Unknown',
        item_code: item ? item['item-code'] : null,
        total_quantity_sold: itemCounts[itemId],
        item_price: item ? item['item-price'] : 0,
        item_stock_quantity: item ? item['item-stock-quantity'] : 0
      };
    });

    // 7. StockAlertList - Items with low stock (less than 10 or threshold)
    const stockThreshold = 10; // You can make this configurable
    const lowStockItems = await Items.find({
      'item-stock-quantity': { $lt: stockThreshold },
      Status: true
    })
    .sort({ 'item-stock-quantity': 1 })
    .limit(20);

    const StockAlertList = lowStockItems.map(item => ({
      Items_id: item.Items_id,
      item_name: item['item-name'],
      item_code: item['item-code'],
      item_stock_quantity: item['item-stock-quantity'],
      item_price: item['item-price'],
      alert_level: item['item-stock-quantity'] < 5 ? 'Critical' : 'Low'
    }));

    // Prepare response
    const dashboardData = {
      TotalOrder,
      RepeatCustomersChart,
      NewCustomersChart,
      TotalSale: parseFloat(TotalSale.toFixed(2)),
      ReservationsOrderList,
      TopSellersItemList,
      StockAlertList,
      filter: filter,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      }
    };

    res.status(200).json({
      success: true,
      message: 'Restaurant dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant dashboard data',
      error: error.message
    });
  }
};

// Dashboard API - Simple dashboard with TotalOrders, TotalSales, TopSellers, StockAlerts
const dashboard = async (req, res) => {
  try {
    // Get restaurant ID from authenticated user
    const restaurantId = req.user?.user_id;
    
    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    // Verify restaurant user exists and has restaurant role
    const restaurantUser = await User.findOne({ user_id: restaurantId });
    
    if (!restaurantUser) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurantRole = await Role.findOne({ Role_id: restaurantUser.Role_id });
    if (!restaurantRole || restaurantRole.role_name?.toLowerCase() !== 'restaurant') {
      return res.status(400).json({
        success: false,
        message: 'Provided user is not associated with a restaurant role'
      });
    }

    // Get all employees created by this restaurant
    const employees = await User.find({ 
      CreateBy: restaurantId, 
      Status: true 
    });
    const employeeIds = employees.map(emp => emp.user_id);

    // Get all orders for this restaurant
    const posOrderQuery = { 
      Restaurant_id: restaurantId,
      Status: true
    };
    
    const quickOrderQuery = { 
      Status: true
    };
    
    if (employeeIds.length > 0) {
      quickOrderQuery['get_order_Employee_id'] = { $in: employeeIds };
    }

    const [posOrders, quickOrders] = await Promise.all([
      Pos_Point_sales_Order.find(posOrderQuery),
      Quick_Order.find(quickOrderQuery)
    ]);

    // 1. Calculate TotalOrders
    const TotalOrders = posOrders.length + quickOrders.length;

    // 2. Calculate TotalSales
    const TotalSales = [...posOrders, ...quickOrders].reduce(
      (sum, order) => sum + (order.Total || 0), 
      0
    );

    // 3. Get TopSellers (limit 10) - Top selling items
    const itemCounts = {};
    
    // Process POS orders
    posOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.item_id) {
            itemCounts[item.item_id] = (itemCounts[item.item_id] || 0) + (item.item_Quentry || 0);
          }
        });
      }
    });

    // Process Quick orders
    quickOrders.forEach(order => {
      if (order.item_ids && Array.isArray(order.item_ids)) {
        order.item_ids.forEach(item => {
          if (item.item_id) {
            itemCounts[item.item_id] = (itemCounts[item.item_id] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    // Get top 10 items
    const topItemIds = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([itemId]) => parseInt(itemId));

    const topItems = await Items.find({ Items_id: { $in: topItemIds }, Status: true });
    
    const TopSellers = topItemIds.map(itemId => {
      const item = topItems.find(i => i.Items_id === itemId);
      return {
        Items_id: itemId,
        item_name: item ? item['item-name'] : 'Unknown',
        item_code: item ? item['item-code'] : null,
        total_quantity_sold: itemCounts[itemId],
        item_price: item ? item['item-price'] : 0,
        item_stock_quantity: item ? item['item-stock-quantity'] : 0
      };
    });

    // 4. Get StockAlerts (limit 10) - Items with low stock
    const stockThreshold = 10; // Configurable threshold
    const lowStockItems = await Items.find({
      'item-stock-quantity': { $lt: stockThreshold },
      Status: true
    })
    .sort({ 'item-stock-quantity': 1 })
    .limit(10);

    const StockAlerts = lowStockItems.map(item => ({
      Items_id: item.Items_id,
      item_name: item['item-name'],
      item_code: item['item-code'],
      item_stock_quantity: item['item-stock-quantity'],
      item_price: item['item-price'],
      alert_level: item['item-stock-quantity'] < 5 ? 'Critical' : 'Low'
    }));

    // Prepare response
    const dashboardData = {
      TotalOrders,
      TotalSales: parseFloat(TotalSales.toFixed(2)),
      TopSellers,
      StockAlerts
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get Restaurant Performance API
const getRestaurantPerformance = async (req, res) => {
  try {
    // Get filter from query parameter (24H, 1 week, 1 Month, 6 Month)
    const { filter = '24H', restaurant_id } = req.query;
    
    // Get restaurant ID from query parameter or authenticated user
    const restaurantId = restaurant_id ? parseInt(restaurant_id) : req.user?.user_id;
    
    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    // Verify restaurant user exists and has restaurant role
    const restaurantUser = await User.findOne({ user_id: restaurantId });
    
    if (!restaurantUser) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurantRole = await Role.findOne({ Role_id: restaurantUser.Role_id });
    if (!restaurantRole || restaurantRole.role_name?.toLowerCase() !== 'restaurant') {
      return res.status(400).json({
        success: false,
        message: 'Provided user is not associated with a restaurant role'
      });
    }

    // Calculate date range based on filter
    const now = new Date();
    let dateRange = { start: now, end: now };
    
    switch (filter.toLowerCase()) {
      case '24h':
        dateRange.start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1 week':
      case '1week':
      case 'week':
        dateRange.start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1 month':
      case '1month':
      case 'month':
        dateRange.start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '6 month':
      case '6month':
        dateRange.start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      default:
        dateRange.start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    dateRange.end = now;

    // Get all employees created by this restaurant
    const employees = await User.find({ 
      CreateBy: restaurantId, 
      Status: true 
    });
    const employeeIds = employees.map(emp => emp.user_id);

    // Get orders filtered by restaurant and date range
    const posOrderQuery = { 
      Restaurant_id: restaurantId,
      Status: true,
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end }
    };
    
    const quickOrderQuery = { 
      Status: true,
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end }
    };
    
    if (employeeIds.length > 0) {
      quickOrderQuery['get_order_Employee_id'] = { $in: employeeIds };
    } else {
      quickOrderQuery['get_order_Employee_id'] = { $in: [-1] };
    }

    const [posOrders, quickOrders] = await Promise.all([
      Pos_Point_sales_Order.find(posOrderQuery),
      Quick_Order.find(quickOrderQuery)
    ]);

    // Calculate TotalSalesCount (total revenue)
    const totalSalesCount = [...posOrders, ...quickOrders].reduce(
      (sum, order) => sum + (order.Total || 0), 
      0
    );

    // Calculate TotalOrdersCount
    const totalOrdersCount = posOrders.length + quickOrders.length;

    // Get TotalActiveClientsCount - filter clients created by restaurant or its employees
    const clientCreators = [restaurantId, ...employeeIds];
    const totalActiveClientsCount = await Clients.countDocuments({ 
      CreateBy: { $in: clientCreators },
      Status: true 
    });

    // Get customers - filter by restaurant employees
    const customerFilter = { 
      Status: true 
    };
    if (employeeIds.length > 0) {
      customerFilter.CreateBy = { $in: employeeIds };
    }
    const allCustomers = await Customer.find(customerFilter);

    // Calculate new customers (customers created in the date range)
    const newCustomersCount = await Customer.countDocuments({
      ...customerFilter,
      CreateAt: { $gte: dateRange.start, $lt: dateRange.end }
    });

    // Calculate repeat customers (customers with more than 1 order)
    const customerOrderCounts = {};
    
    // Count orders per customer from POS orders
    posOrders.forEach(order => {
      if (order.Customer_id) {
        customerOrderCounts[order.Customer_id] = (customerOrderCounts[order.Customer_id] || 0) + 1;
      }
    });

    // Count orders per customer from Quick orders by matching phone to Customer_id
    quickOrders.forEach(order => {
      if (order.client_mobile_no) {
        const customer = allCustomers.find(c => c.phone === order.client_mobile_no);
        if (customer) {
          customerOrderCounts[customer.Customer_id] = (customerOrderCounts[customer.Customer_id] || 0) + 1;
        }
      }
    });

    // Count repeat customers (customers with more than 1 order)
    const repeatCustomersCount = Object.values(customerOrderCounts).filter(count => count > 1).length;

    // Calculate Average Order Value
    const avgOrderValueCount = totalOrdersCount > 0 
      ? parseFloat((totalSalesCount / totalOrdersCount).toFixed(2))
      : 0;

    // Generate Chart Data
    const chart = generateChartData([...posOrders, ...quickOrders], filter, dateRange);

    // Prepare response
    const performanceData = {
      TotalSalesCount: parseFloat(totalSalesCount.toFixed(2)),
      TotalOrdersCount: totalOrdersCount,
      TotalActiveClientsCount: totalActiveClientsCount,
      NewCustomersCount: newCustomersCount,
      RepeatCustomersCount: repeatCustomersCount,
      AvgOrderValueCount: avgOrderValueCount,
      Chart: chart,
      filter: filter
    };

    res.status(200).json({
      success: true,
      message: 'Restaurant performance data retrieved successfully',
      data: performanceData
    });
  } catch (error) {
    console.error('Error fetching restaurant performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant performance data',
      error: error.message
    });
  }
};

// Helper function to generate chart data
const generateChartData = (orders, filter, dateRange) => {
  const chart = [];
  
  if (orders.length === 0) {
    return chart;
  }

  const filterLower = filter.toLowerCase();
  
  // Group orders by time period based on filter
  if (filterLower === '24h') {
    // Group by actual order time (format: HH.MM)
    const hourlyData = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.CreateAt);
      const hour = orderDate.getHours();
      const minutes = orderDate.getMinutes();
      // Use actual minutes, format as HH.MM
      const timeKey = `${String(hour).padStart(2, '0')}.${String(minutes).padStart(2, '0')}`;
      
      if (!hourlyData[timeKey]) {
        hourlyData[timeKey] = 0;
      }
      hourlyData[timeKey] += (order.Total || 0);
    });

    // Sort time slots and add to chart (only show times with orders)
    const sortedTimeSlots = Object.keys(hourlyData).sort();
    
    sortedTimeSlots.forEach(timeSlot => {
      chart.push({
        xof: `${parseFloat(hourlyData[timeSlot].toFixed(2))} xof`,
        time: timeSlot
      });
    });
  } else if (filterLower === '1 week' || filterLower === '1week' || filterLower === 'week') {
    // Group by day
    const dailyData = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.CreateAt);
      const dayKey = `${String(orderDate.getDate()).padStart(2, '0')}.${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = 0;
      }
      dailyData[dayKey] += (order.Total || 0);
    });

    // Generate all days in the range (last 7 days)
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    while (currentDate <= endDate) {
      const dayKey = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const sales = dailyData[dayKey] || 0;
      chart.push({
        xof: `${parseFloat(sales.toFixed(2))} xof`,
        time: dayKey
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (filterLower === '1 month' || filterLower === '1month' || filterLower === 'month') {
    // Group by day
    const dailyData = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.CreateAt);
      const dayKey = `${String(orderDate.getDate()).padStart(2, '0')}.${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = 0;
      }
      dailyData[dayKey] += (order.Total || 0);
    });

    // Generate all days in the range
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    while (currentDate <= endDate) {
      const dayKey = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const sales = dailyData[dayKey] || 0;
      chart.push({
        xof: `${parseFloat(sales.toFixed(2))} xof`,
        time: dayKey
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (filterLower === '6 month' || filterLower === '6month') {
    // Group by month
    const monthlyData = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.CreateAt);
      const monthKey = `${String(orderDate.getMonth() + 1).padStart(2, '0')}.${orderDate.getFullYear()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += (order.Total || 0);
    });

    // Generate all months in the range
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    while (currentDate <= endDate) {
      const monthKey = `${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;
      const sales = monthlyData[monthKey] || 0;
      chart.push({
        xof: `${parseFloat(sales.toFixed(2))} xof`,
        time: monthKey
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return chart;
};

// ReportsStats API - Comprehensive statistics
const ReportsStats = async (req, res) => {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Get all orders (POS and Quick)
    const [allPosOrders, allQuickOrders] = await Promise.all([
      Pos_Point_sales_Order.find({ Status: true }),
      Quick_Order.find({ Status: true })
    ]);

    // Calculate TotalRevenueCount (all time)
    const TotalRevenueCount = [...allPosOrders, ...allQuickOrders].reduce(
      (sum, order) => sum + (order.Total || 0),
      0
    );

    // Calculate MonthlyRecurringCount (active subscriptions this month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRecurringPlans = await Admin_Plan_buy_Restaurant.find({
      paymentStatus: true,
      isActive: true,
      Status: true,
      expiry_date: { $gte: currentMonthStart }
    });
    const MonthyRecurringCount = monthlyRecurringPlans.length;

    // Get restaurant role
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });
    
    // Calculate TotalPosClientsRestaurant
    const restaurantUsers = restaurantRole ? await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    }) : [];
    const TotalPosClientsRestaurant = restaurantUsers.length;

    // WeekingActivityChartbyDay - Last 7 days
    const WeekingAcitvityChartbyDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      // New clients created on this day
      const newClients = await Clients.countDocuments({
        CreateAt: { $gte: dayStart, $lt: dayEnd },
        Status: true
      });

      // Client renewals (plan purchases) on this day
      const clientRenewals = await Admin_Plan_buy_Restaurant.countDocuments({
        CreateAt: { $gte: dayStart, $lt: dayEnd },
        paymentStatus: true,
        Status: true
      });

      WeekingAcitvityChartbyDay.push({
        NewclientCount: newClients,
        CleintsRenewalsCount: clientRenewals
      });
    }

    // MonthlyGrowthChartByMonth - Last 12 months
    const MonthlyGrowthChartByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const newClients = await Clients.countDocuments({
        CreateAt: { $gte: monthDate, $lt: monthEnd },
        Status: true
      });

      const clientRenewals = await Admin_Plan_buy_Restaurant.countDocuments({
        CreateAt: { $gte: monthDate, $lt: monthEnd },
        paymentStatus: true,
        Status: true
      });

      MonthlyGrowthChartByMonth.push({
        NewclientCount: newClients,
        CleintsRenewalsCount: clientRenewals
      });
    }

    // ProfitAfterTax - Calculate from transactions
    const allTransactions = await Transaction.find({
      status: 'success',
      Status: true
    });

    // Calculate profit (revenue - costs, simplified as revenue for now)
    // In a real scenario, you'd subtract costs, but we'll use revenue as profit
    const ProfitAfterTax = allTransactions.map(transaction => ({
      NetProfit: transaction.amount || 0
    }));

    // TopPerformersList - Top restaurants by sales
    const restaurantSales = {};
    
    for (const restaurant of restaurantUsers) {
      const restaurantId = restaurant.user_id;
      const posOrders = allPosOrders.filter(o => o.Restaurant_id === restaurantId);
      
      // Get employees created by this restaurant
      const employees = await User.find({
        CreateBy: restaurantId,
        Status: true
      });
      const employeeIds = employees.map(e => e.user_id);
      
      const quickOrders = employeeIds.length > 0
        ? allQuickOrders.filter(o => employeeIds.includes(o.get_order_Employee_id))
        : [];
      
      const totalSales = [...posOrders, ...quickOrders].reduce(
        (sum, order) => sum + (order.Total || 0),
        0
      );
      
      if (totalSales > 0) {
        restaurantSales[restaurantId] = {
          restaurant,
          totalSales
        };
      }
    }

    // Get renewal dates for top performers
    const topPerformersList = await Promise.all(
      Object.entries(restaurantSales)
        .sort((a, b) => b[1].totalSales - a[1].totalSales)
        .slice(0, 10)
        .map(async ([restaurantId, data]) => {
          const activePlan = await Admin_Plan_buy_Restaurant.findOne({
            CreateBy: parseInt(restaurantId),
            paymentStatus: true,
            isActive: true,
            Status: true
          }).sort({ expiry_date: -1 });

          return {
            CompnayName: data.restaurant.Name || 'Unknown',
            TotalSales: parseFloat(data.totalSales.toFixed(2)),
            RenewalDate: activePlan?.expiry_date || null
          };
        })
    );

    res.status(200).json({
      success: true,
      message: 'Reports stats retrieved successfully',
      data: {
        TotalRevenueCount: parseFloat(TotalRevenueCount.toFixed(2)),
        MonthyRecurringCount,
        TotalPosClientsRestaurant,
        WeekingAcitvityChartbyDay,
        MonthlyGrowthChartByMonth,
        ProfitAfterTax,
        TopPerformersList: topPerformersList
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports stats',
      error: error.message
    });
  }
};

// Restaurant By Chart By City
const RestaurantByChartByCity = async (req, res) => {
  try {
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    // Group restaurants by city
    const cityCounts = {};
    restaurantUsers.forEach(restaurant => {
      if (restaurant.City_id) {
        cityCounts[restaurant.City_id] = (cityCounts[restaurant.City_id] || 0) + 1;
      }
    });

    // Get city details
    const cityIds = Object.keys(cityCounts).map(id => parseInt(id));
    const cities = await City.find({
      City_id: { $in: cityIds },
      Status: true
    });

    const cityMap = cities.reduce((map, city) => {
      map[city.City_id] = city;
      return map;
    }, {});

    const chart = Object.entries(cityCounts).map(([cityId, count]) => ({
      City: cityMap[parseInt(cityId)] ? cityMap[parseInt(cityId)].City_name : 'Unknown',
      RestaurantCount: count
    })).sort((a, b) => b.RestaurantCount - a.RestaurantCount);

    res.status(200).json({
      success: true,
      message: 'Restaurant chart by city retrieved successfully',
      data: {
        chart
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant chart by city',
      error: error.message
    });
  }
};

module.exports = {
  reportsToday,
  reportsMonth,
  reportsSixMonth,
  reportsOneYear,
  restaurantPerformance,
  restaurant_performoance,
  restaurant_Top_Performer,
  reports,
  cityWiseUsageReport,
  employeePerformance,
  restaurantDashboard,
  dashboard,
  getRestaurantPerformance,
  ReportsStats,
  RestaurantByChartByCity
};
