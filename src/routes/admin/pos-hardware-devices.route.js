const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const Admin_POS_MyDevices_sold = require('../../models/Admin_POS_MyDevices_sold_in_restaurant.model');
const MyDevices = require('../../models/MyDevices.model');
const User = require('../../models/User.model');

// POS Hardware Devices Dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get total clients (unique users who bought hardware)
    const totalClients = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true } },
      { $group: { _id: '$user_id' } },
      { $count: 'count' }
    ]);

    // Get total printers count
    const totalPrinters = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true } },
      { $group: { _id: null, total: { $sum: '$PrintersCount' } } }
    ]);

    // Get total POS systems count
    const totalSystems = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true } },
      { $group: { _id: null, total: { $sum: '$SystemsCount' } } }
    ]);

    // Get total hardware sold amount (from transaction/price)
    const totalHardwareSold = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true, paymentState: true } },
      { $count: 'count' }
    ]);

    // Monthly breakdown for chart
    const monthlyHardwareSales = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true, paymentState: true } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$CreateAt' }
          },
          count: { $sum: 1 },
          printers: { $sum: '$PrintersCount' },
          systems: { $sum: '$SystemsCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Year-to-date sales comparison
    const currentYear = new Date().getFullYear();
    const ytdSales = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      paymentState: true,
      CreateAt: { $gte: new Date(`${currentYear}-01-01`) }
    });

    const previousYearSales = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      paymentState: true,
      CreateAt: {
        $gte: new Date(`${currentYear - 1}-01-01`),
        $lt: new Date(`${currentYear}-01-01`)
      }
    });

    const percentageChange = previousYearSales > 0 
      ? (((ytdSales - previousYearSales) / previousYearSales) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      message: 'POS Hardware Devices Dashboard retrieved successfully',
      data: {
        totalClients: totalClients[0]?.count || 0,
        totalPrinters: totalPrinters[0]?.total || 0,
        totalSystems: totalSystems[0]?.total || 0,
        totalHardwareSold: totalHardwareSold[0]?.count || 0,
        hardwareSalesChange: `${percentageChange}%`,
        monthlyBreakdown: monthlyHardwareSales,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching POS hardware devices dashboard',
      error: error.message
    });
  }
});

// Get Hardware Sold List/Table
router.get('/hardware-sold', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, deviceType } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const query = { Status: true, paymentState: true };

    // Build aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'Users',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'client_info'
        }
      },
      {
        $lookup: {
          from: 'MyDevices',
          localField: 'MyDevices_id',
          foreignField: 'MyDevices_id',
          as: 'device_info'
        }
      },
      {
        $unwind: { path: '$client_info', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$device_info', preserveNullAndEmptyArrays: true }
      }
    ];

    // Search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'client_info.Name': { $regex: search, $options: 'i' } },
            { 'client_info.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Device type filter (System or Printer)
    if (deviceType) {
      pipeline.push({
        $match: {
          $expr: {
            $cond: [
              { $eq: [deviceType.toLowerCase(), 'system'] },
              { $gt: ['$SystemsCount', 0] },
              { $gt: ['$PrintersCount', 0] }
            ]
          }
        }
      });
    }

    // Project final fields
    pipeline.push({
      $project: {
        Admin_MyDevices_sold_in_restaurant_id: 1,
        businessName: { $ifNull: ['$client_info.Name', 'N/A'] },
        email: { $ifNull: ['$client_info.email', 'N/A'] },
        planPurchased: { $cond: [
          { $gt: ['$SystemsCount', 0] },
          'POS System',
          'Printer'
        ]},
        purchasedDate: { $dateToString: { format: '%d/%m/%Y', date: '$CreateAt' } },
        device: { $cond: [
          { $gt: ['$SystemsCount', 0] },
          'System',
          'Printer'
        ]},
        printersCount: '$PrintersCount',
        systemsCount: '$SystemsCount',
        isActive: '$isAcitve',
        paymentStatus: '$paymentState',
        CreateAt: 1
      }
    });

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Admin_POS_MyDevices_sold.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Get paginated results
    pipeline.push(
      { $sort: { CreateAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    const hardwareSold = await Admin_POS_MyDevices_sold.aggregate(pipeline);

    res.status(200).json({
      success: true,
      message: 'Hardware sold list retrieved successfully',
      data: hardwareSold,
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
      message: 'Error fetching hardware sold list',
      error: error.message
    });
  }
});

// Hardware Sales Report by Device Type
router.get('/sales-report', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const reportMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const reportYear = year ? parseInt(year) : currentDate.getFullYear();

    // Date range for the month
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0);

    // Total sales for the month
    const monthlySales = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      paymentState: true,
      CreateAt: { $gte: startDate, $lte: endDate }
    });

    // Breakdown by device type
    const systemsSold = await Admin_POS_MyDevices_sold.aggregate([
      {
        $match: {
          Status: true,
          paymentState: true,
          SystemsCount: { $gt: 0 },
          CreateAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$SystemsCount' } } }
    ]);

    const printersSold = await Admin_POS_MyDevices_sold.aggregate([
      {
        $match: {
          Status: true,
          paymentState: true,
          PrintersCount: { $gt: 0 },
          CreateAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$PrintersCount' } } }
    ]);

    // Daily breakdown
    const dailyBreakdown = await Admin_POS_MyDevices_sold.aggregate([
      {
        $match: {
          Status: true,
          paymentState: true,
          CreateAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$CreateAt' }
          },
          count: { $sum: 1 },
          systems: { $sum: '$SystemsCount' },
          printers: { $sum: '$PrintersCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top selling clients
    const topClients = await Admin_POS_MyDevices_sold.aggregate([
      {
        $match: {
          Status: true,
          paymentState: true,
          CreateAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'client_info'
        }
      },
      {
        $unwind: { path: '$client_info', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$user_id',
          businessName: { $first: '$client_info.Name' },
          count: { $sum: 1 },
          totalSystems: { $sum: '$SystemsCount' },
          totalPrinters: { $sum: '$PrintersCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Hardware sales report retrieved successfully',
      data: {
        period: {
          month: reportMonth,
          year: reportYear,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        summary: {
          totalSales: monthlySales,
          systemsSold: systemsSold[0]?.total || 0,
          systemsCount: systemsSold[0]?.count || 0,
          printersSold: printersSold[0]?.total || 0,
          printersCount: printersSold[0]?.count || 0
        },
        dailyBreakdown,
        topClients
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hardware sales report',
      error: error.message
    });
  }
});

// Hardware Inventory Status
router.get('/inventory-status', auth, async (req, res) => {
  try {
    // Active hardware (still in use)
    const activeHardware = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      isAcitve: true
    });

    // Inactive hardware
    const inactiveHardware = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      isAcitve: false
    });

    // Unpaid hardware
    const unpaidHardware = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      paymentState: false
    });

    // Hardware by status breakdown
    const statusBreakdown = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: {
            active: '$isAcitve',
            paid: '$paymentState'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top devices installed
    const topDevices = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true } },
      {
        $lookup: {
          from: 'MyDevices',
          localField: 'MyDevices_id',
          foreignField: 'MyDevices_id',
          as: 'device_info'
        }
      },
      {
        $unwind: { path: '$device_info', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$device_info.Name',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isAcitve', 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Hardware inventory status retrieved successfully',
      data: {
        inventory: {
          activeHardware,
          inactiveHardware,
          unpaidHardware,
          totalHardware: activeHardware + inactiveHardware
        },
        statusBreakdown,
        topDevices
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hardware inventory status',
      error: error.message
    });
  }
});

// Hardware Performance Metrics
router.get('/performance-metrics', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // This month vs last month
    const thisMonthSales = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      paymentState: true,
      CreateAt: { $gte: thirtyDaysAgo }
    });

    const lastMonthDate = new Date(thirtyDaysAgo);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const lastMonthSales = await Admin_POS_MyDevices_sold.countDocuments({
      Status: true,
      paymentState: true,
      CreateAt: {
        $gte: lastMonthDate,
        $lt: thirtyDaysAgo
      }
    });

    const monthlyGrowth = lastMonthSales > 0
      ? (((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(2)
      : 0;

    // Average devices per client
    const clientStats = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: '$user_id',
          devicesCount: { $sum: 1 },
          totalSystems: { $sum: '$SystemsCount' },
          totalPrinters: { $sum: '$PrintersCount' }
        }
      },
      {
        $group: {
          _id: null,
          avgDevices: { $avg: '$devicesCount' },
          avgSystems: { $avg: '$totalSystems' },
          avgPrinters: { $avg: '$totalPrinters' }
        }
      }
    ]);

    // Payment status metrics
    const paymentMetrics = await Admin_POS_MyDevices_sold.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: null,
          totalHardware: { $sum: 1 },
          paidHardware: { $sum: { $cond: ['$paymentState', 1, 0] } },
          unpaidHardware: { $sum: { $cond: ['$paymentState', 0, 1] } }
        }
      },
      {
        $project: {
          totalHardware: 1,
          paidHardware: 1,
          unpaidHardware: 1,
          paymentRate: {
            $multiply: [
              { $divide: ['$paidHardware', '$totalHardware'] },
              100
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Hardware performance metrics retrieved successfully',
      data: {
        sales: {
          thisMonth: thisMonthSales,
          lastMonth: lastMonthSales,
          monthlyGrowth: `${monthlyGrowth}%`
        },
        clientMetrics: {
          avgDevicesPerClient: clientStats[0]?.avgDevices.toFixed(2) || 0,
          avgSystemsPerClient: clientStats[0]?.avgSystems.toFixed(2) || 0,
          avgPrintersPerClient: clientStats[0]?.avgPrinters.toFixed(2) || 0
        },
        paymentMetrics: paymentMetrics[0] || {
          totalHardware: 0,
          paidHardware: 0,
          unpaidHardware: 0,
          paymentRate: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hardware performance metrics',
      error: error.message
    });
  }
});

module.exports = router;
