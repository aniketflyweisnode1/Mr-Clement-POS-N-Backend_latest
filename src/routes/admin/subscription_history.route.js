const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const Admin_Plan_Buy_Restaurant = require('../../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../../models/Admin_Plan.model');
const User = require('../../models/User.model');
const Clients = require('../../models/Clients.model');

// Get Subscription Purchase History - All Clients with Relations
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, clientId, planId, Status } = req.query;

    // Build filter
    const filter = {};
    if (clientId) filter.CreateBy = parseInt(clientId);
    if (planId) filter.Admin_Plan_id = parseInt(planId);
    if (Status !== undefined) filter.Status = Status === 'true';

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Admin_Plan_Buy_Restaurant.countDocuments(filter);

    // Fetch subscription history with relations
    const history = await Admin_Plan_Buy_Restaurant.find(filter)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Populate relations
    const enrichedHistory = await Promise.all(
      history.map(async (record) => {
        const [plan, client, user, transaction] = await Promise.all([
          Admin_Plan.findOne({ Admin_Plan_id: record.Admin_Plan_id }),
          record.CreateBy ? User.findOne({ user_id: record.CreateBy }) : null,
          record.UpdatedBy ? User.findOne({ user_id: record.UpdatedBy }) : null,
          record.Trangection_id ? null : null // Add transaction query if needed
        ]);

        return {
          Admin_Plan_buy_Restaurant_id: record.Admin_Plan_buy_Restaurant_id,
          Plan: plan ? {
            Admin_Plan_id: plan.Admin_Plan_id,
            PlanName: plan.PlanName,
            Price: plan.Price,
            expiry_day: plan.expiry_day
          } : null,
          Client: client ? {
            user_id: client.user_id,
            Name: client.Name,
            email: client.email,
            phone: client.phone
          } : null,
          isActive: record.isActive,
          paymentStatus: record.paymentStatus,
          expiry_date: record.expiry_date,
          paymentSuccessDate: record.paymentSuccessDate,
          Status: record.Status,
          CreatedAt: record.CreateAt,
          UpdatedAt: record.UpdatedAt,
          UpdatedBy: user ? {
            user_id: user.user_id,
            Name: user.Name,
            email: user.email
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Subscription purchase history retrieved successfully',
      data: enrichedHistory,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription history',
      error: error.message
    });
  }
});

// Get Subscription Report - Which Client Purchased Which Plan
router.get('/report', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      if (!dateFilter.$gte) dateFilter.$gte = new Date('2020-01-01');
      dateFilter.$lte = new Date(endDate);
    }

    const matchStage = {};
    if (Object.keys(dateFilter).length > 0) {
      matchStage.CreateAt = dateFilter;
    }

    // Fetch all purchases
    const allPurchases = await Admin_Plan_Buy_Restaurant.find(matchStage);

    // Get all unique plans and clients
    const planIds = [...new Set(allPurchases.map(p => p.Admin_Plan_id))];
    const clientIds = [...new Set(allPurchases.map(p => p.CreateBy))];

    const plans = await Admin_Plan.find({ Admin_Plan_id: { $in: planIds } });
    const clients = await User.find({ user_id: { $in: clientIds } });

    // Create lookup maps
    const planMap = {};
    const clientMap = {};

    plans.forEach(p => {
      planMap[p.Admin_Plan_id] = {
        Admin_Plan_id: p.Admin_Plan_id,
        PlanName: p.PlanName,
        Price: p.Price
      };
    });

    clients.forEach(c => {
      clientMap[c.user_id] = {
        user_id: c.user_id,
        Name: c.Name,
        email: c.email
      };
    });

    // Group by Plan
    const reportByPlan = {};
    plans.forEach(plan => {
      reportByPlan[plan.Admin_Plan_id] = {
        ...planMap[plan.Admin_Plan_id],
        totalPurchases: 0,
        totalRevenue: 0,
        buyers: []
      };
    });

    allPurchases.forEach(purchase => {
      if (reportByPlan[purchase.Admin_Plan_id]) {
        reportByPlan[purchase.Admin_Plan_id].totalPurchases += 1;
        reportByPlan[purchase.Admin_Plan_id].totalRevenue += planMap[purchase.Admin_Plan_id]?.Price || 0;

        reportByPlan[purchase.Admin_Plan_id].buyers.push({
          ...clientMap[purchase.CreateBy],
          purchaseDate: purchase.CreateAt,
          paymentStatus: purchase.paymentStatus,
          expiryDate: purchase.expiry_date,
          isActive: purchase.isActive
        });
      }
    });

    // Group by Client
    const reportByClient = {};
    clients.forEach(client => {
      reportByClient[client.user_id] = {
        ...clientMap[client.user_id],
        totalSubscriptions: 0,
        totalSpent: 0,
        plans: []
      };
    });

    allPurchases.forEach(purchase => {
      if (reportByClient[purchase.CreateBy]) {
        reportByClient[purchase.CreateBy].totalSubscriptions += 1;
        reportByClient[purchase.CreateBy].totalSpent += planMap[purchase.Admin_Plan_id]?.Price || 0;

        reportByClient[purchase.CreateBy].plans.push({
          ...planMap[purchase.Admin_Plan_id],
          purchaseDate: purchase.CreateAt,
          paymentStatus: purchase.paymentStatus,
          expiryDate: purchase.expiry_date
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Subscription report generated successfully',
      data: {
        summary: {
          totalPurchases: allPurchases.length,
          totalUniquePlans: planIds.length,
          totalUniqueClients: clientIds.length,
          totalRevenue: allPurchases.reduce((sum, p) => {
            const plan = planMap[p.Admin_Plan_id];
            return sum + (plan?.Price || 0);
          }, 0)
        },
        reportByPlan: Object.values(reportByPlan),
        reportByClient: Object.values(reportByClient),
        dateRange: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Today'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating subscription report',
      error: error.message
    });
  }
});

// Get Subscription Details by Client ID
router.get('/client-subscriptions/:clientId', auth, async (req, res) => {
  try {
    const { clientId } = req.params;

    // Get all subscriptions for this client
    const subscriptions = await Admin_Plan_Buy_Restaurant.find({ CreateBy: parseInt(clientId) })
      .sort({ CreateAt: -1 });

    // Populate relations
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await Admin_Plan.findOne({ Admin_Plan_id: sub.Admin_Plan_id });
        return {
          Admin_Plan_buy_Restaurant_id: sub.Admin_Plan_buy_Restaurant_id,
          Plan: plan ? {
            Admin_Plan_id: plan.Admin_Plan_id,
            PlanName: plan.PlanName,
            Price: plan.Price,
            Description: plan.Description
          } : null,
          isActive: sub.isActive,
          paymentStatus: sub.paymentStatus,
          paymentSuccessDate: sub.paymentSuccessDate,
          expiry_date: sub.expiry_date,
          Status: sub.Status,
          purchaseDate: sub.CreateAt
        };
      })
    );

    // Get client details
    const client = await User.findOne({ user_id: parseInt(clientId) });

    res.status(200).json({
      success: true,
      message: 'Client subscriptions retrieved successfully',
      data: {
        Client: client ? {
          user_id: client.user_id,
          Name: client.Name,
          email: client.email,
          phone: client.phone
        } : null,
        subscriptionCount: subscriptions.length,
        activeSubscriptions: subscriptions.filter(s => s.isActive).length,
        subscriptions: enrichedSubscriptions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client subscriptions',
      error: error.message
    });
  }
});

// Get Plan Purchase Analytics
router.get('/plan-analytics/:planId', auth, async (req, res) => {
  try {
    const { planId } = req.params;

    // Get all purchases for this plan
    const purchases = await Admin_Plan_Buy_Restaurant.find({ Admin_Plan_id: parseInt(planId) });

    // Get plan details
    const plan = await Admin_Plan.findOne({ Admin_Plan_id: parseInt(planId) });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Calculate analytics
    const analytics = {
      totalPurchases: purchases.length,
      activePlans: purchases.filter(p => p.isActive).length,
      inactivePlans: purchases.filter(p => !p.isActive).length,
      paidPurchases: purchases.filter(p => p.paymentStatus).length,
      pendingPurchases: purchases.filter(p => !p.paymentStatus).length,
      totalRevenue: purchases.filter(p => p.paymentStatus).length * plan.Price,
      averagePricePerPurchase: plan.Price
    };

    // Get top buyers
    const buyers = await Promise.all(
      purchases.map(async (p) => {
        const user = await User.findOne({ user_id: p.CreateBy });
        return {
          user_id: user?.user_id,
          Name: user?.Name,
          email: user?.email,
          purchaseDate: p.CreateAt,
          paymentStatus: p.paymentStatus,
          expiryDate: p.expiry_date
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Plan analytics retrieved successfully',
      data: {
        Plan: {
          Admin_Plan_id: plan.Admin_Plan_id,
          PlanName: plan.PlanName,
          Price: plan.Price,
          Description: plan.Description
        },
        Analytics: analytics,
        TopBuyers: buyers.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plan analytics',
      error: error.message
    });
  }
});

module.exports = router;
