const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const mongoose = require('mongoose');

// Import models
const User = require('../../models/User.model');
const Admin_Plan_buy_Restaurant = require('../../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../../models/Admin_Plan.model');
const City = require('../../models/City.model');
const Support_Ticket = require('../../models/support_ticket.model');

// Get Employee Dashboard with all required data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const restaurant_id = req.user.restaurant_id;

    // Get employee info
    const employee = await User.findOne({
      user_id: user_id,
      Status: true
    }).select('user_id Name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get Subscriptions Purchased by this Restaurant
    const subscriptions = await Admin_Plan_buy_Restaurant.aggregate([
      {
        $match: {
          Status: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'admin_plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $unwind: '$plan'
      },
      {
        $project: {
          Admin_Plan_Buy_Restaurant_id: 1,
          Admin_Plan_id: 1,
          Plan_Name: '$plan.PlanName',
          Price: '$plan.Price',
          PurchasedDate: 1,
          ExpiryDate: 1,
          paymentStatus: 1,
          isActive: 1,
          Business_Name: '$user.Name',
          email: '$user.email'
        }
      },
      {
        $sort: { PurchasedDate: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get Heat Map Data - City wise usage for this restaurant
    const heatMapData = await User.aggregate([
      {
        $match: {
          Status: true
        }
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'City_id',
          foreignField: 'City_id',
          as: 'city'
        }
      },
      {
        $lookup: {
          from: 'admin_plan_buy_restaurants',
          localField: 'user_id',
          foreignField: 'User_id',
          as: 'subscriptions'
        }
      },
      {
        $unwind: '$city'
      },
      {
        $unwind: {
          path: '$subscriptions',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'admin_plans',
          localField: 'subscriptions.Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan'
        }
      },
      {
        $unwind: {
          path: '$plan',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            city_id: '$city.City_id',
            city_name: '$city.City_name'
          },
          restaurant_count: { $addToSet: '$user_id' },
          total_revenue: {
            $sum: {
              $cond: [
                { $and: ['$subscriptions.Status', '$plan'] },
                '$plan.Price',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          City_id: '$_id.city_id',
          city: '$_id.city_name',
          restaurant_count: { $size: '$restaurant_count' },
          total_revenue: 1
        }
      },
      {
        $sort: { restaurant_count: -1 }
      }
    ]);

    // Get Support Tickets
    const tickets = await Support_Ticket.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'CreatedBy_user_id',
          foreignField: 'user_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: '$createdBy'
      },
      {
        $project: {
          Support_Ticket_id: 1,
          TicketNumber: 1,
          Subject: 1,
          Description: 1,
          Status: 1,
          Priority: 1,
          CreatedDate: 1,
          UpdatedDate: 1,
          CreatedBy: '$createdBy.Name'
        }
      },
      {
        $sort: { CreatedDate: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get Subscription Renewal Alerts
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const renewalAlerts = await Admin_Plan_buy_Restaurant.aggregate([
      {
        $match: {
          Status: true,
          ExpiryDate: { $lte: thirtyDaysFromNow }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'admin_plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $unwind: '$plan'
      },
      {
        $project: {
          Admin_Plan_Buy_Restaurant_id: 1,
          Business_Name: '$user.Name',
          email: '$user.email',
          Plan_Name: '$plan.PlanName',
          ExpiryDate: 1,
          days_remaining: {
            $floor: {
              $divide: [
                { $subtract: ['$ExpiryDate', now] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          paymentStatus: 1
        }
      },
      {
        $addFields: {
          alert_status: {
            $switch: {
              branches: [
                { case: { $lte: ['$days_remaining', 0] }, then: 'Expired' },
                { case: { $lte: ['$days_remaining', 7] }, then: 'Critical' },
                { case: { $lte: ['$days_remaining', 30] }, then: 'Warning' }
              ],
              default: 'Active'
            }
          }
        }
      },
      {
        $match: {
          days_remaining: { $lte: 30 }
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
      message: 'Employee dashboard data retrieved successfully',
      data: {
        employee: {
          user_id: employee.user_id,
          name: employee.Name,
          email: employee.email
        },
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
    console.error('Dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data',
      error: error.message
    });
  }
});

// Get Subscriptions Purchased with Pagination
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await Admin_Plan_buy_Restaurant.countDocuments({
      Status: true
    });

    const subscriptions = await Admin_Plan_buy_Restaurant.aggregate([
      {
        $match: {
          Status: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'admin_plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $unwind: '$plan'
      },
      {
        $project: {
          Admin_Plan_Buy_Restaurant_id: 1,
          Admin_Plan_id: 1,
          Plan_Name: '$plan.PlanName',
          Price: '$plan.Price',
          PurchasedDate: 1,
          ExpiryDate: 1,
          paymentStatus: 1,
          isActive: 1,
          Business_Name: '$user.Name',
          email: '$user.email',
          Phone: '$user.phone'
        }
      },
      {
        $sort: { PurchasedDate: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Subscriptions purchased retrieved successfully',
      data: subscriptions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
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
    const restaurant_id = req.user.restaurant_id;

    const heatMapData = await User.aggregate([
      {
        $match: {
          Status: true
        }
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'City_id',
          foreignField: 'City_id',
          as: 'city'
        }
      },
      {
        $lookup: {
          from: 'admin_plan_buy_restaurants',
          localField: 'user_id',
          foreignField: 'User_id',
          as: 'subscriptions'
        }
      },
      {
        $unwind: '$city'
      },
      {
        $unwind: {
          path: '$subscriptions',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'admin_plans',
          localField: 'subscriptions.Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan'
        }
      },
      {
        $unwind: {
          path: '$plan',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            city_id: '$city.City_id',
            city_name: '$city.City_name'
          },
          restaurant_count: { $addToSet: '$user_id' },
          total_revenue: {
            $sum: {
              $cond: [
                { $and: ['$subscriptions.Status', '$plan'] },
                '$plan.Price',
                0
              ]
            }
          },
          subscription_count: {
            $sum: {
              $cond: [
                '$subscriptions.Admin_Plan_Buy_Restaurant_id',
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          City_id: '$_id.city_id',
          city: '$_id.city_name',
          restaurant_count: { $size: '$restaurant_count' },
          total_revenue: 1,
          subscription_count: 1
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
    const restaurant_id = req.user.restaurant_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const status = req.query.status || null;

    let matchConditions = {};
    if (status) {
      matchConditions.Status = status;
    }

    // Get total count
    const totalCount = await Support_Ticket.countDocuments(matchConditions);

    const tickets = await Support_Ticket.aggregate([
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'users',
          localField: 'CreatedBy_user_id',
          foreignField: 'user_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: '$createdBy'
      },
      {
        $project: {
          Support_Ticket_id: 1,
          TicketNumber: 1,
          Subject: 1,
          Description: 1,
          Status: 1,
          Priority: 1,
          CreatedDate: 1,
          UpdatedDate: 1,
          CreatedBy: '$createdBy.Name',
          email: '$createdBy.email'
        }
      },
      {
        $sort: { CreatedDate: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Support tickets retrieved successfully',
      data: tickets,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
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
    const restaurant_id = req.user.restaurant_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Get total count
    const totalCount = await Admin_Plan_buy_Restaurant.aggregate([
      {
        $match: {
          Status: true,
          ExpiryDate: { $lte: thirtyDaysFromNow }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          days_remaining: {
            $floor: {
              $divide: [
                { $subtract: ['$ExpiryDate', now] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $match: {
          days_remaining: { $lte: 30 }
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    const renewalAlerts = await Admin_Plan_buy_Restaurant.aggregate([
      {
        $match: {
          Status: true,
          ExpiryDate: { $lte: thirtyDaysFromNow }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'User_id',
          foreignField: 'user_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'admin_plans',
          localField: 'Admin_Plan_id',
          foreignField: 'Admin_Plan_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $unwind: '$plan'
      },
      {
        $project: {
          Admin_Plan_Buy_Restaurant_id: 1,
          Business_Name: '$user.Name',
          email: '$user.email',
          Plan_Name: '$plan.PlanName',
          ExpiryDate: 1,
          days_remaining: {
            $floor: {
              $divide: [
                { $subtract: ['$ExpiryDate', now] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          paymentStatus: 1
        }
      },
      {
        $addFields: {
          alert_status: {
            $switch: {
              branches: [
                { case: { $lte: ['$days_remaining', 0] }, then: 'Expired' },
                { case: { $lte: ['$days_remaining', 7] }, then: 'Critical' },
                { case: { $lte: ['$days_remaining', 30] }, then: 'Warning' }
              ],
              default: 'Active'
            }
          }
        }
      },
      {
        $match: {
          days_remaining: { $lte: 30 }
        }
      },
      {
        $sort: { ExpiryDate: 1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Renewal alerts retrieved successfully',
      data: renewalAlerts,
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

module.exports = router;
