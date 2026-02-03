const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const Admin_Plan_Buy_Restaurant = require('../../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../../models/Admin_Plan.model');
const User = require('../../models/User.model');
const Clients = require('../../models/Clients.model');
const Transaction = require('../../models/Transaction.model');
const support_ticket = require('../../models/support_ticket.model');
const City = require('../../models/City.model');

// KPI Dashboard - Active Clients, Inactive Clients, Renewal Rate
router.get('/kpi-dashboard', auth, async (req, res) => {
  try {
    // Get all clients
    const allClients = await User.find({ Status: true });
    const inactiveClients = await User.find({ Status: false });

    // Get all active subscriptions
    const activeSubscriptions = await Admin_Plan_Buy_Restaurant.find({ isActive: true, paymentStatus: true });
    const totalSubscriptions = await Admin_Plan_Buy_Restaurant.find({ paymentStatus: true });

    // Calculate renewal rate
    const renewalCount = await Admin_Plan_Buy_Restaurant.countDocuments({
      isActive: true,
      paymentStatus: true,
      expiry_date: { $gt: new Date() }
    });

    const renewalRate = totalSubscriptions.length > 0 
      ? ((renewalCount / totalSubscriptions.length) * 100).toFixed(2)
      : 0;

    // Get total revenue
    const subscriptionPlans = await Admin_Plan.find({ Status: true });
    const planMap = {};
    subscriptionPlans.forEach(p => {
      planMap[p.Admin_Plan_id] = p.Price;
    });

    let totalRevenue = 0;
    activeSubscriptions.forEach(sub => {
      totalRevenue += planMap[sub.Admin_Plan_id] || 0;
    });

    // Count new vs renewed clients (subscriptions from last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newSubscriptions = await Admin_Plan_Buy_Restaurant.countDocuments({
      CreateAt: { $gte: thirtyDaysAgo },
      paymentStatus: true
    });

    const renewedSubscriptions = activeSubscriptions.length - newSubscriptions;

    res.status(200).json({
      success: true,
      message: 'KPI dashboard data retrieved',
      data: {
        kpiMetrics: {
          totalActiveClients: allClients.length,
          totalInactiveClients: inactiveClients.length,
          totalRenewalRate: parseFloat(renewalRate),
          totalActiveSubscriptions: activeSubscriptions.length,
          totalRevenue: totalRevenue,
          newSubscriptionsThisMonth: newSubscriptions,
          renewedSubscriptionsThisMonth: renewedSubscriptions,
          conversionRate: allClients.length > 0 
            ? ((activeSubscriptions.length / allClients.length) * 100).toFixed(2)
            : 0
        },
        charts: {
          activeClientsBreakdown: {
            newClients: newSubscriptions,
            renewedClients: renewedSubscriptions
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching KPI dashboard',
      error: error.message
    });
  }
});

// Active Clients Report
router.get('/active-clients', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    const searchFilter = {};
    if (search) {
      searchFilter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get active clients with subscriptions
    const activeClients = await User.find({ Status: true, ...searchFilter })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments({ Status: true, ...searchFilter });

    // Get subscription details for each client
    const enrichedClients = await Promise.all(
      activeClients.map(async (client) => {
        const subscriptions = await Admin_Plan_Buy_Restaurant.find({ 
          CreateBy: client.user_id,
          paymentStatus: true 
        }).sort({ CreateAt: -1 });

        const latestSub = subscriptions[0];
        const plan = latestSub ? await Admin_Plan.findOne({ Admin_Plan_id: latestSub.Admin_Plan_id }) : null;

        return {
          user_id: client.user_id,
          businessName: client.Name,
          email: client.email,
          phone: client.phone,
          planPurchased: plan ? plan.PlanName : 'No Plan',
          purchasedDate: latestSub ? latestSub.CreateAt : null,
          expiryDate: latestSub ? latestSub.expiry_date : null,
          subscriptionCount: subscriptions.length,
          status: 'Active'
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Active clients report retrieved',
      data: enrichedClients,
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
      message: 'Error fetching active clients report',
      error: error.message
    });
  }
});

// Inactive Clients Report
router.get('/inactive-clients', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    const searchFilter = {};
    if (search) {
      searchFilter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get inactive clients
    const inactiveClients = await User.find({ Status: false, ...searchFilter })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments({ Status: false, ...searchFilter });

    // Get subscription details for each client
    const enrichedClients = await Promise.all(
      inactiveClients.map(async (client) => {
        const subscriptions = await Admin_Plan_Buy_Restaurant.find({ 
          CreateBy: client.user_id 
        }).sort({ CreateAt: -1 });

        const latestSub = subscriptions[0];
        const plan = latestSub ? await Admin_Plan.findOne({ Admin_Plan_id: latestSub.Admin_Plan_id }) : null;

        return {
          user_id: client.user_id,
          businessName: client.Name,
          email: client.email,
          phone: client.phone,
          planPurchased: plan ? plan.PlanName : 'No Plan',
          purchasedDate: latestSub ? latestSub.CreateAt : null,
          expiryDate: latestSub ? latestSub.expiry_date : null,
          lastSubscriptionDate: latestSub ? latestSub.CreateAt : null,
          status: 'Inactive'
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Inactive clients report retrieved',
      data: enrichedClients,
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
      message: 'Error fetching inactive clients report',
      error: error.message
    });
  }
});

// Subscription Sales Report
router.get('/subscription-sales', auth, async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get sales for each day of the month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const salesByDay = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const startOfDay = new Date(currentYear, currentMonth - 1, day, 0, 0, 0);
      const endOfDay = new Date(currentYear, currentMonth - 1, day, 23, 59, 59);

      const daySales = await Admin_Plan_Buy_Restaurant.find({
        CreateAt: { $gte: startOfDay, $lte: endOfDay },
        paymentStatus: true
      });

      let dayRevenue = 0;
      for (const sale of daySales) {
        const plan = await Admin_Plan.findOne({ Admin_Plan_id: sale.Admin_Plan_id });
        dayRevenue += plan ? plan.Price : 0;
      }

      salesByDay[day] = {
        date: startOfDay.toISOString().split('T')[0],
        sales: daySales.length,
        revenue: dayRevenue
      };
    }

    // Get top selling plans this month
    const monthStart = new Date(currentYear, currentMonth - 1, 1);
    const monthEnd = new Date(currentYear, currentMonth, 0);

    const monthlySales = await Admin_Plan_Buy_Restaurant.find({
      CreateAt: { $gte: monthStart, $lte: monthEnd },
      paymentStatus: true
    });

    const planSalesMap = {};
    let totalRevenue = 0;

    for (const sale of monthlySales) {
      const plan = await Admin_Plan.findOne({ Admin_Plan_id: sale.Admin_Plan_id });
      if (!planSalesMap[sale.Admin_Plan_id]) {
        planSalesMap[sale.Admin_Plan_id] = {
          planId: sale.Admin_Plan_id,
          planName: plan?.PlanName,
          price: plan?.Price,
          sales: 0,
          revenue: 0
        };
      }
      planSalesMap[sale.Admin_Plan_id].sales += 1;
      planSalesMap[sale.Admin_Plan_id].revenue += plan?.Price || 0;
      totalRevenue += plan?.Price || 0;
    }

    // Get top sales with client details
    const topSales = await Admin_Plan_Buy_Restaurant.find({
      CreateAt: { $gte: monthStart, $lte: monthEnd },
      paymentStatus: true
    })
      .sort({ CreateAt: -1 })
      .limit(5);

    const topSalesEnriched = await Promise.all(
      topSales.map(async (sale) => {
        const client = await User.findOne({ user_id: sale.CreateBy });
        const plan = await Admin_Plan.findOne({ Admin_Plan_id: sale.Admin_Plan_id });
        return {
          id: sale.Admin_Plan_buy_Restaurant_id,
          businessName: client?.Name,
          planPurchased: plan?.PlanName,
          purchasedDate: sale.CreateAt,
          amount: plan?.Price
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Subscription sales report retrieved',
      data: {
        period: {
          month: currentMonth,
          year: currentYear
        },
        summary: {
          totalSales: monthlySales.length,
          totalRevenue: totalRevenue,
          averageOrderValue: monthlySales.length > 0 ? (totalRevenue / monthlySales.length).toFixed(2) : 0
        },
        chartData: {
          salesByDay: salesByDay
        },
        topPlans: Object.values(planSalesMap).sort((a, b) => b.revenue - a.revenue),
        topSales: topSalesEnriched
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription sales report',
      error: error.message
    });
  }
});

// Renewal Status Report
router.get('/renewal-status', auth, async (req, res) => {
  try {
    // Get subscriptions expiring soon (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const expiringSubscriptions = await Admin_Plan_Buy_Restaurant.find({
      expiry_date: { $gte: today, $lte: thirtyDaysLater },
      isActive: true
    });

    const expiredSubscriptions = await Admin_Plan_Buy_Restaurant.find({
      expiry_date: { $lt: today },
      isActive: true
    });

    const activeSubscriptions = await Admin_Plan_Buy_Restaurant.find({
      expiry_date: { $gt: thirtyDaysLater },
      isActive: true
    });

    // Enrich with client and plan details
    const enrichSubscriptions = async (subs) => {
      return Promise.all(
        subs.map(async (sub) => {
          const client = await User.findOne({ user_id: sub.CreateBy });
          const plan = await Admin_Plan.findOne({ Admin_Plan_id: sub.Admin_Plan_id });
          return {
            subscriptionId: sub.Admin_Plan_buy_Restaurant_id,
            businessName: client?.Name,
            planName: plan?.PlanName,
            expiryDate: sub.expiry_date,
            daysRemaining: Math.ceil((sub.expiry_date - today) / (1000 * 60 * 60 * 24))
          };
        })
      );
    };

    const [expiring, expired, active] = await Promise.all([
      enrichSubscriptions(expiringSubscriptions),
      enrichSubscriptions(expiredSubscriptions),
      enrichSubscriptions(activeSubscriptions)
    ]);

    res.status(200).json({
      success: true,
      message: 'Renewal status report retrieved',
      data: {
        summary: {
          activeSubscriptions: activeSubscriptions.length,
          expiringIn30Days: expiringSubscriptions.length,
          expiredSubscriptions: expiredSubscriptions.length
        },
        expiringSubscriptions: expiring,
        expiredSubscriptions: expired,
        activeSubscriptions: active
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching renewal status report',
      error: error.message
    });
  }
});

// Support Tickets Report
router.get('/support-tickets', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.Status = status;

    // Count tickets
    const total = await support_ticket.countDocuments(filter);

    // Get tickets
    const tickets = await support_ticket.find(filter)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const client = await User.findOne({ user_id: ticket.CreateBy });
        return {
          ticketId: ticket._id || ticket.ticket_id,
          businessName: client?.Name,
          subject: ticket.subject || ticket.issue_description,
          status: ticket.Status,
          priority: ticket.priority || 'Medium',
          createdDate: ticket.CreateAt,
          updatedDate: ticket.UpdatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Support tickets report retrieved',
      data: enrichedTickets,
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
      message: 'Error fetching support tickets report',
      error: error.message
    });
  }
});

// Latest Transactions
router.get('/latest-transactions', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.aggregate([
      {
        $lookup: {
          from: 'Users',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'user_info'
        }
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'created_by',
          foreignField: 'user_id',
          as: 'created_by_info'
        }
      },
      {
        $sort: { created_at: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limitNum
      },
      {
        $project: {
          _id: 1,
          transagtion_id: 1,
          amount: 1,
          status: 1,
          payment_method: 1,
          transactionType: 1,
          transaction_date: 1,
          created_at: 1,
          reference_number: 1,
          user_id: { $arrayElemAt: ['$user_info', 0] },
          created_by: { $arrayElemAt: ['$created_by_info', 0] }
        }
      }
    ]);

    const total = await Transaction.countDocuments();

    // Calculate summary stats
    const totalAmount = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const transactionsByStatus = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Latest transactions fetched successfully',
      data: transactions,
      summary: {
        totalAmount: totalAmount[0]?.totalAmount || 0,
        byStatus: transactionsByStatus,
        totalTransactions: total
      },
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
      message: 'Error fetching latest transactions',
      error: error.message
    });
  }
});

// Transaction Graph Report - Daily transaction volume and amount
router.get('/transaction-graph', auth, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthsNum = parseInt(months);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsNum);

    // Daily transaction graph data
    const dailyData = await Transaction.aggregate([
      {
        $match: {
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Monthly breakdown
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$created_at' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top payment methods
    const topPaymentMethods = await Transaction.aggregate([
      {
        $match: {
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$payment_method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Transaction graph report fetched successfully',
      data: {
        daily: dailyData,
        monthly: monthlyData,
        topPaymentMethods: topPaymentMethods,
        period: {
          months: monthsNum,
          from: startDate,
          to: new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction graph report',
      error: error.message
    });
  }
});

// City Wise Usage Report - Subscription usage by city
router.get('/city-wise-usage', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Get all restaurants grouped by city with subscription details
    const cityWiseData = await Clients.aggregate([
      {
        $lookup: {
          from: 'Admin_Plan_Buy_Restaurants',
          localField: 'Clients_id',
          foreignField: 'CreateBy',
          as: 'subscriptions'
        }
      },
      {
        $lookup: {
          from: 'Cities',
          localField: 'City_id',
          foreignField: 'City_id',
          as: 'cityInfo'
        }
      },
      {
        $group: {
          _id: '$City_id',
          cityName: { $first: { $arrayElemAt: ['$cityInfo.CityName', 0] } },
          totalRestaurants: { $sum: 1 },
          totalSubscriptions: {
            $sum: { $size: '$subscriptions' }
          },
          activeSubscriptions: {
            $sum: {
              $size: {
                $filter: {
                  input: '$subscriptions',
                  as: 'sub',
                  cond: { $eq: ['$$sub.isActive', true] }
                }
              }
            }
          },
          totalRevenue: {
            $sum: {
              $sum: {
                $map: {
                  input: '$subscriptions',
                  as: 'sub',
                  in: {
                    $cond: [
                      { $eq: ['$$sub.paymentStatus', true] },
                      100,
                      0
                    ]
                  }
                }
              }
            }
          }
        }
      },
      {
        $sort: { totalSubscriptions: -1 }
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          total: [
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const data = cityWiseData[0]?.data || [];
    const total = cityWiseData[0]?.total[0]?.count || 0;

    // Summary statistics
    const cityStats = await Clients.aggregate([
      {
        $group: {
          _id: '$City_id',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalCities: { $sum: 1 },
          totalRestaurants: { $sum: '$count' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'City wise usage report fetched successfully',
      data: data,
      summary: {
        totalCities: cityStats[0]?.totalCities || 0,
        totalRestaurants: cityStats[0]?.totalRestaurants || 0,
        avgRestaurantsPerCity: cityStats[0]?.totalRestaurants 
          ? (cityStats[0].totalRestaurants / cityStats[0].totalCities).toFixed(2)
          : 0
      },
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
      message: 'Error fetching city wise usage report',
      error: error.message
    });
  }
});

module.exports = router;
