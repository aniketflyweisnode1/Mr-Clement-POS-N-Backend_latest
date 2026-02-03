const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const Admin_Plan_Buy_Restaurant = require('../../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../../models/Admin_Plan.model');
const User = require('../../models/User.model');
const Transaction = require('../../models/Transaction.model');
const Support_Ticket = require('../../models/support_ticket.model');

// Admin Main Dashboard
router.get('/main-dashboard', auth, async (req, res) => {
  try {
    // Get all active clients (unique users with active status)
    const totalClients = await User.countDocuments({
      Status: true,
      Role_id: { $ne: 1 } // Exclude admins
    });

    // Get total revenue (sum of all successful transactions)
    const totalRevenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          payment_state: true
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = totalRevenueData[0]?.totalAmount || 0;

    // Get monthly securing revenue (active subscriptions * plan price for current month)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(0);

    const activePlanData = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: {
          isActive: true,
          paymentStatus: true,
          expiry_date: { $gt: new Date() }
        }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan_info'
        }
      },
      {
        $unwind: { path: '$plan_info', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: null,
          totalMonthlyRevenue: { $sum: '$plan_info.Price' }
        }
      }
    ]);

    const monthlySecurity = activePlanData[0]?.totalMonthlyRevenue || 0;

    // Get total POS Clients count
    const totalPOSClients = totalClients;

    // Daily Activity (Last 7 days) - New Clients vs Renewal Clients
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyActivity = await User.aggregate([
      {
        $match: {
          Status: true,
          CreateAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$CreateAt' }
          },
          newClients: {
            $sum: 1
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get renewal clients for the same period
    const renewalClients = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: {
          CreateAt: { $gte: sevenDaysAgo },
          paymentStatus: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$CreateAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map day of week names
    const getDayName = (dateString) => {
      const date = new Date(dateString);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dayNames[date.getDay()];
    };

    // Merge daily activity with renewal data
    const mergedDailyData = dailyActivity.map(day => {
      const renewal = renewalClients.find(r => r._id === day._id);
      return {
        day: getDayName(day._id),
        newClients: day.newClients,
        existingClientsRenewal: renewal?.count || 0
      };
    });

    // Ensure all 7 days are represented
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const completeDaily = dayNames.map(day => {
      const found = mergedDailyData.find(d => d.day === day);
      return found || { day, newClients: 0, existingClientsRenewal: 0 };
    });

    // Monthly Growth (Last 6 months) - New Clients vs Renewal Clients
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await User.aggregate([
      {
        $match: {
          Status: true,
          CreateAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$CreateAt' }
          },
          newClients: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get monthly renewal data
    const monthlyRenewal = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: {
          CreateAt: { $gte: sixMonthsAgo },
          paymentStatus: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$CreateAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map month names
    const getMonthName = (dateString) => {
      const date = new Date(dateString + '-01');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[date.getMonth()];
    };

    // Merge monthly data
    const mergedMonthlyData = monthlyGrowth.map(month => {
      const renewal = monthlyRenewal.find(r => r._id === month._id);
      return {
        month: getMonthName(month._id),
        newClients: month.newClients,
        existingClientsRenewal: renewal?.count || 0
      };
    });

    // Trend message for monthly growth
    const lastMonthRenewal = mergedMonthlyData[mergedMonthlyData.length - 1]?.existingClientsRenewal || 0;
    const prevMonthRenewal = mergedMonthlyData[mergedMonthlyData.length - 2]?.existingClientsRenewal || 0;
    const renewalTrend = lastMonthRenewal >= prevMonthRenewal ? 'increase' : 'decrease';
    const trendPercentage = prevMonthRenewal > 0 
      ? Math.abs(((lastMonthRenewal - prevMonthRenewal) / prevMonthRenewal) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      message: 'Admin main dashboard retrieved successfully',
      data: {
        kpis: {
          totalRevenue: totalRevenue,
          monthlySecurity: monthlySecurity,
          totalPOSClients: totalPOSClients
        },
        dailyActivity: {
          title: 'Daily Activity',
          subtitle: 'New Clients vs Clients Renewal',
          data: completeDaily
        },
        monthlyGrowth: {
          title: 'Monthly Growth',
          subtitle: `New Clients vs Clients Renewal - You have done ${renewalTrend} ${trendPercentage}% better from ${mergedMonthlyData[mergedMonthlyData.length - 2]?.month || 'Last'} and ${mergedMonthlyData[mergedMonthlyData.length - 1]?.month || 'This'}`,
          data: mergedMonthlyData
        },
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin main dashboard',
      error: error.message
    });
  }
});

// Admin Dashboard Summary (Quick Stats)
router.get('/summary', auth, async (req, res) => {
  try {
    // Total active subscriptions
    const activeSubscriptions = await Admin_Plan_Buy_Restaurant.countDocuments({
      isActive: true,
      paymentStatus: true
    });

    // Total inactive subscriptions
    const inactiveSubscriptions = await Admin_Plan_Buy_Restaurant.countDocuments({
      isActive: false
    });

    // Total clients
    const totalClients = await User.countDocuments({
      Status: true,
      Role_id: { $ne: 1 }
    });

    // Total revenue (today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          created_at: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Pending payments
    const pendingPayments = await Transaction.countDocuments({
      status: 'Pending'
    });

    // Failed transactions
    const failedTransactions = await Transaction.countDocuments({
      status: 'failed'
    });

    res.status(200).json({
      success: true,
      message: 'Admin dashboard summary retrieved successfully',
      data: {
        activeSubscriptions,
        inactiveSubscriptions,
        totalClients,
        todayRevenue: todayRevenue[0]?.total || 0,
        pendingPayments,
        failedTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
});

// Admin Dashboard Quick Stats with Charts
router.get('/stats', auth, async (req, res) => {
  try {
    // Revenue breakdown by plan
    const revenueByPlan = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: { paymentStatus: true, Status: true }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan_info'
        }
      },
      {
        $unwind: { path: '$plan_info', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: {
            planId: '$Admin_Plan_id',
            planName: '$plan_info.PlanName'
          },
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$plan_info.Price', 0] } }
        }
      },
      {
        $project: {
          _id: '$_id.planName',
          count: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Client growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newClientsLastMonth = await User.countDocuments({
      Status: true,
      CreateAt: { $gte: thirtyDaysAgo }
    });

    // Subscription growth (last 30 days)
    const newSubscriptionsLastMonth = await Admin_Plan_Buy_Restaurant.countDocuments({
      CreateAt: { $gte: thirtyDaysAgo },
      paymentStatus: true,
      Status: true
    });

    // Success rate
    const totalTransactions = await Transaction.countDocuments();
    const successfulTransactions = await Transaction.countDocuments({
      status: 'success'
    });
    const successRate = totalTransactions > 0 
      ? ((successfulTransactions / totalTransactions) * 100).toFixed(2)
      : 0;

    // Top performing plans
    const topPlans = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: { paymentStatus: true, Status: true }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan_info'
        }
      },
      {
        $unwind: { path: '$plan_info', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$plan_info.PlanName',
          purchases: { $sum: 1 }
        }
      },
      { $sort: { purchases: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Admin dashboard stats retrieved successfully',
      data: {
        revenueByPlan: revenueByPlan || [],
        newClientsLastMonth,
        newSubscriptionsLastMonth,
        successRate: `${successRate}%`,
        topPlans: topPlans || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

// Admin Complete Dashboard with all sections
router.get('/complete-dashboard', auth, async (req, res) => {
  try {
    // Get all Subscriptions Purchased - Last 10
    const subscriptions = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: { Status: true }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'planInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          Admin_Plan_Buy_Restaurant_id: '$Admin_Plan_Buy_Restaurant_id',
          Admin_Plan_id: '$Admin_Plan_id',
          Plan_Name: '$planInfo.PlanName',
          Price: '$planInfo.Price',
          PurchasedDate: '$PurchasedDate',
          ExpiryDate: '$ExpiryDate',
          paymentStatus: '$paymentStatus',
          isActive: '$isActive',
          Business_Name: '$userInfo.Name',
          email: '$userInfo.email'
        }
      },
      {
        $sort: { PurchasedDate: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get Heat Map Data - City wise usage (from User aggregation)
    const heatMapData = await User.aggregate([
      {
        $match: { Status: true }
      },
      {
        $group: {
          _id: '$City_id',
          restaurant_count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'cities',
          localField: '_id',
          foreignField: 'City_id',
          as: 'cityInfo'
        }
      },
      {
        $unwind: { path: '$cityInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          City_id: '$_id',
          city: '$cityInfo.City_name',
          restaurant_count: '$restaurant_count'
        }
      },
      {
        $sort: { restaurant_count: -1 }
      }
    ]);

    // Get Support Tickets - Last 5
    const tickets = await Support_Ticket.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'CreateBy',
          foreignField: 'user_id',
          as: 'createdByInfo'
        }
      },
      {
        $unwind: { path: '$createdByInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          Support_Ticket_id: '$support_ticket_id',
          TicketNumber: { $concat: ['TICKET', { $toString: '$support_ticket_id' }] },
          Subject: '$question',
          Description: '$question',
          Status: '$Ticket_status',
          Priority: 'Normal',
          CreatedDate: '$CreateAt',
          UpdatedDate: '$UpdatedAt',
          CreatedBy: '$createdByInfo.Name'
        }
      },
      {
        $sort: { CreatedDate: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get Subscription Renewal Alerts - Expiring in 30 days
    const renewalAlerts = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: {
          Status: true,
          ExpiryDate: {
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            $gte: new Date()
          }
        }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'planInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          Admin_Plan_Buy_Restaurant_id: '$Admin_Plan_Buy_Restaurant_id',
          Business_Name: '$userInfo.Name',
          email: '$userInfo.email',
          Plan_Name: '$planInfo.PlanName',
          ExpiryDate: '$ExpiryDate',
          days_remaining: {
            $ceil: {
              $divide: [
                { $subtract: ['$ExpiryDate', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          paymentStatus: '$paymentStatus',
          alert_status: {
            $cond: [
              { $lte: ['$ExpiryDate', new Date()] },
              'Expired',
              {
                $cond: [
                  { $lte: ['$ExpiryDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                  'Critical',
                  'Warning'
                ]
              }
            ]
          }
        }
      },
      {
        $sort: { ExpiryDate: 1 }
      },
      {
        $limit: 10
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin complete dashboard data retrieved successfully',
      data: {
        subscriptionsPurchased: subscriptions,
        heatMap: {
          title: 'Heat Map (Cities)',
          data: heatMapData
        },
        supportTickets: {
          title: 'Support Tickets',
          count: tickets.length,
          data: tickets
        },
        renewalAlerts: {
          title: 'Subscription Renewal Alert',
          count: renewalAlerts.length,
          data: renewalAlerts
        }
      }
    });
  } catch (error) {
    console.error('Complete dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving complete dashboard data',
      error: error.message
    });
  }
});

// Get All Subscriptions Purchased with Pagination
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const subscriptions = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: { Status: true }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'planInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          Admin_Plan_Buy_Restaurant_id: '$Admin_Plan_Buy_Restaurant_id',
          Admin_Plan_id: '$Admin_Plan_id',
          Plan_Name: '$planInfo.PlanName',
          Price: '$planInfo.Price',
          PurchasedDate: '$PurchasedDate',
          ExpiryDate: '$ExpiryDate',
          paymentStatus: '$paymentStatus',
          isActive: '$isActive',
          Business_Name: '$userInfo.Name',
          email: '$userInfo.email',
          Phone: '$userInfo.Phone'
        }
      },
      {
        $sort: { PurchasedDate: -1 }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ]);

    const total = subscriptions[0]?.metadata[0]?.total || 0;
    const data = subscriptions[0]?.data || [];

    return res.status(200).json({
      success: true,
      message: 'Subscriptions purchased retrieved successfully',
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Subscriptions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving subscriptions',
      error: error.message
    });
  }
});

// Get City Wise Heat Map Data
router.get('/heatmap', auth, async (req, res) => {
  try {
    const heatMapData = await User.aggregate([
      {
        $match: { Status: true }
      },
      {
        $group: {
          _id: '$City_id',
          restaurant_count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'cities',
          localField: '_id',
          foreignField: 'City_id',
          as: 'cityInfo'
        }
      },
      {
        $unwind: { path: '$cityInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          City_id: '$_id',
          city: '$cityInfo.City_name',
          restaurant_count: '$restaurant_count'
        }
      },
      {
        $sort: { restaurant_count: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Heat map data retrieved successfully',
      data: {
        title: 'Heat Map (Cities)',
        subtitle: 'Distribution of restaurants by city',
        data: heatMapData
      }
    });
  } catch (error) {
    console.error('Heat map error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving heat map data',
      error: error.message
    });
  }
});

// Get Support Tickets with Pagination
router.get('/support-tickets', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const status = req.query.status || null;

    let matchStage = {};
    if (status) {
      matchStage = { Ticket_status: status };
    }

    const tickets = await Support_Ticket.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'CreateBy',
          foreignField: 'user_id',
          as: 'createdByInfo'
        }
      },
      {
        $unwind: { path: '$createdByInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          Support_Ticket_id: '$support_ticket_id',
          TicketNumber: { $concat: ['TICKET', { $toString: '$support_ticket_id' }] },
          Subject: '$question',
          Description: '$question',
          Status: '$Ticket_status',
          Priority: 'Normal',
          CreatedDate: '$CreateAt',
          UpdatedDate: '$UpdatedAt',
          CreatedBy: '$createdByInfo.Name',
          email: '$createdByInfo.email'
        }
      },
      {
        $sort: { CreatedDate: -1 }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ]);

    const total = tickets[0]?.metadata[0]?.total || 0;
    const data = tickets[0]?.data || [];

    return res.status(200).json({
      success: true,
      message: 'Support tickets retrieved successfully',
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Support tickets error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving support tickets',
      error: error.message
    });
  }
});

// Get Subscription Renewal Alerts
router.get('/renewal-alerts', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const renewalAlerts = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: {
          Status: true,
          ExpiryDate: {
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            $gte: new Date()
          }
        }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'planInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          Admin_Plan_Buy_Restaurant_id: '$Admin_Plan_Buy_Restaurant_id',
          Business_Name: '$userInfo.Name',
          email: '$userInfo.email',
          Plan_Name: '$planInfo.PlanName',
          ExpiryDate: '$ExpiryDate',
          days_remaining: {
            $ceil: {
              $divide: [
                { $subtract: ['$ExpiryDate', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          paymentStatus: '$paymentStatus',
          alert_status: {
            $cond: [
              { $lte: ['$ExpiryDate', new Date()] },
              'Expired',
              {
                $cond: [
                  { $lte: ['$ExpiryDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                  'Critical',
                  'Warning'
                ]
              }
            ]
          }
        }
      },
      {
        $sort: { ExpiryDate: 1 }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ]);

    const total = renewalAlerts[0]?.metadata[0]?.total || 0;
    const data = renewalAlerts[0]?.data || [];

    return res.status(200).json({
      success: true,
      message: 'Renewal alerts retrieved successfully',
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Renewal alerts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving renewal alerts',
      error: error.message
    });
  }
});

// Get Profit After Tax
router.get('/profit-after-tax', auth, async (req, res) => {
  try {
    // Get current month's revenue
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(0);
    currentMonthEnd.setHours(23, 59, 59, 999);

    const currentMonthRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          created_at: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get last month's revenue
    const lastMonthStart = new Date();
    lastMonthStart.setDate(1);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const lastMonthRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          created_at: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;

    // Calculate profit (assuming 80% profit margin for display)
    const currentProfit = Math.round(currentRevenue * 0.8);
    const lastProfit = Math.round(lastRevenue * 0.8);

    // Calculate month-over-month percentage
    const percentageChange = lastProfit > 0 
      ? Math.round(((currentProfit - lastProfit) / lastProfit) * 100)
      : 0;

    // Calculate gauge percentage (0-100)
    const gaugePercentage = Math.min(100, Math.round((currentProfit / (currentRevenue * 1.2)) * 100));

    return res.status(200).json({
      success: true,
      message: 'Profit after tax retrieved successfully',
      data: {
        netProfit: currentProfit,
        currency: 'XOF',
        gaugePercentage,
        monthlyComparison: {
          message: `You have Made ${percentageChange >= 0 ? '' : '-'}${Math.abs(percentageChange)}% ${percentageChange >= 0 ? 'better' : 'worse'} than Last Month`,
          percentageChange,
          isPositive: percentageChange >= 0
        },
        revenue: {
          currentMonth: currentRevenue,
          lastMonth: lastRevenue
        }
      }
    });
  } catch (error) {
    console.error('Profit after tax error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving profit after tax',
      error: error.message
    });
  }
});

// Get Top Performers
router.get('/top-performers', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const topPerformers = await Admin_Plan_Buy_Restaurant.aggregate([
      {
        $match: {
          Status: true,
          paymentStatus: true,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'Admin_Plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'planInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$User_id',
          companyName: { $first: '$userInfo.Name' },
          totalSales: { $sum: '$planInfo.Price' },
          renewalDate: { $max: '$ExpiryDate' },
          subscriptionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSales: -1 }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                rank: { $add: [skip, { $indexOfArray: [{ $range: [0, limit] }, '$$ROOT'] }] },
                companyName: 1,
                totalSales: 1,
                salesFormatted: {
                  $concat: [
                    { $toString: { $divide: ['$totalSales', 1000] } },
                    ' XOF'
                  ]
                },
                renewalDate: {
                  $dateToString: { format: '%B %d, %Y', date: '$renewalDate' }
                },
                subscriptionCount: 1
              }
            }
          ]
        }
      }
    ]);

    const total = topPerformers[0]?.metadata[0]?.total || 0;
    const data = topPerformers[0]?.data || [];

    // Add sequential numbering
    const numberedData = data.map((item, index) => ({
      ...item,
      '#': String(skip + index + 1).padStart(2, '0')
    }));

    return res.status(200).json({
      success: true,
      message: 'Top performers retrieved successfully',
      data: numberedData,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Top performers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving top performers',
      error: error.message
    });
  }
});

module.exports = router;
