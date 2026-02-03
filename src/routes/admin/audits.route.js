const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const Audits = require('../../models/Audits.model');
const User = require('../../models/User.model');
const {
  createAudit,
  updateAudit,
  getAuditById,
  getAllAudits,
  getAuditLogs,
  getAuditByAuth
} = require('../../controllers/Audits.Controller');

// Create audit (with auth)
router.post('/create', auth, createAudit);

// Update audit (with auth)
router.put('/update', auth, updateAudit);

// Get audit by ID (with auth)
router.get('/getbyid/:id', auth, getAuditById);

// Get all audits (with auth)
router.get('/getall', auth, getAllAudits);

// Get audit by auth (with auth)
router.get('/getbyauth', auth, getAuditByAuth);

// Get audit logs (with auth)
router.get('/getAuditLogs', auth, getAuditLogs);

// Audit Dashboard - Overview with statistics
router.get('/dashboard/overview', auth, async (req, res) => {
  try {
    const totalAudits = await Audits.countDocuments({ Status: true });
    const todayAudits = await Audits.countDocuments({
      Status: true,
      CreateAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Group by environment
    const auditsByEnvironment = await Audits.aggregate([
      { $match: { Status: true } },
      { $group: { _id: '$environment', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Group by action type
    const auditsByAction = await Audits.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: {
            $cond: [
              { $ne: ['$Reservations', null] },
              'Reservations',
              { $cond: [{ $ne: ['$file', null] }, 'File', 'Other'] }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Last 7 days audit trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const auditTrend = await Audits.aggregate([
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
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Audit dashboard overview retrieved successfully',
      data: {
        totalAudits,
        todayAudits,
        auditsByEnvironment,
        auditsByAction,
        auditTrend,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit dashboard',
      error: error.message
    });
  }
});

// Audit Activity Report - Filtered by date range, environment, action
router.get('/report/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, environment, action, ipAddress, employeeId } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const query = { Status: true };

    // Date range filter
    if (startDate || endDate) {
      query.CreateAt = {};
      if (startDate) query.CreateAt.$gte = new Date(startDate);
      if (endDate) query.CreateAt.$lte = new Date(endDate);
    }

    // Environment filter
    if (environment) {
      query.environment = environment;
    }

    // IP Address filter
    if (ipAddress) {
      query.ipAddress = { $regex: ipAddress, $options: 'i' };
    }

    // Employee filter
    if (employeeId) {
      query.Employee_id = parseInt(employeeId);
    }

    // Action filter (Reservations, file, ChineseRamen)
    if (action) {
      if (action === 'Reservations') query.Reservations = { $ne: null };
      else if (action === 'File') query.file = { $ne: null };
      else if (action === 'Other') query.ChineseRamen = { $ne: null };
    }

    const audits = await Audits.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Audits.countDocuments(query);

    // Enrich with user data
    const auditResponse = await Promise.all(audits.map(async (audit) => {
      const [createByUser, employee] = await Promise.all([
        audit.CreateBy ? User.findOne({ user_id: audit.CreateBy }) : null,
        audit.Employee_id ? User.findOne({ user_id: audit.Employee_id }) : null
      ]);

      return {
        Audits_id: audit.Audits_id,
        action: audit.Reservations || audit.file || audit.ChineseRamen || 'Unknown',
        environment: audit.environment,
        ipAddress: audit.ipAddress,
        employee: employee ? { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null,
        createdBy: createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name } : null,
        timestamp: audit.CreateAt,
        details: {
          Reservations: audit.Reservations,
          File: audit.file,
          Other: audit.ChineseRamen
        }
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Audit activity report retrieved successfully',
      data: auditResponse,
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
      message: 'Error fetching audit activity report',
      error: error.message
    });
  }
});

// Audit User Activity - Track specific user's actions
router.get('/report/user-activity/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const userIdNum = parseInt(userId);

    const audits = await Audits.find({
      $or: [{ CreateBy: userIdNum }, { Employee_id: userIdNum }],
      Status: true
    })
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Audits.countDocuments({
      $or: [{ CreateBy: userIdNum }, { Employee_id: userIdNum }],
      Status: true
    });

    // Get user details
    const user = await User.findOne({ user_id: userIdNum });

    // Enrich audit data
    const auditResponse = audits.map(audit => ({
      Audits_id: audit.Audits_id,
      action: audit.Reservations || audit.file || audit.ChineseRamen || 'Unknown',
      environment: audit.environment,
      ipAddress: audit.ipAddress,
      timestamp: audit.CreateAt,
      type: audit.Reservations ? 'Reservations' : (audit.file ? 'File' : 'Other')
    }));

    res.status(200).json({
      success: true,
      message: 'User activity audit retrieved successfully',
      user: user ? {
        user_id: user.user_id,
        Name: user.Name,
        email: user.email
      } : null,
      totalActions: total,
      data: auditResponse,
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
      message: 'Error fetching user activity',
      error: error.message
    });
  }
});

// Audit Summary by Environment
router.get('/report/environment-summary', auth, async (req, res) => {
  try {
    const summary = await Audits.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: '$environment',
          totalAudits: { $sum: 1 },
          uniqueUsers: { $addToSet: '$CreateBy' },
          uniqueEmployees: { $addToSet: '$Employee_id' },
          lastActivity: { $max: '$CreateAt' }
        }
      },
      {
        $project: {
          environment: '$_id',
          totalAudits: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' },
          uniqueEmployeesCount: { $size: '$uniqueEmployees' },
          lastActivity: 1,
          _id: 0
        }
      },
      { $sort: { totalAudits: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Audit environment summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching environment summary',
      error: error.message
    });
  }
});

// Audit Search by IP Address
router.get('/report/ip-address-log', auth, async (req, res) => {
  try {
    const { ipAddress, page = 1, limit = 20 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    if (!ipAddress) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }

    const audits = await Audits.find({
      ipAddress: { $regex: ipAddress, $options: 'i' },
      Status: true
    })
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Audits.countDocuments({
      ipAddress: { $regex: ipAddress, $options: 'i' },
      Status: true
    });

    // Group by time
    const ipActivityPattern = await Audits.aggregate([
      {
        $match: {
          ipAddress: { $regex: ipAddress, $options: 'i' },
          Status: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$CreateAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'IP address audit log retrieved successfully',
      ipAddress,
      totalActivities: total,
      activityPattern: ipActivityPattern,
      data: audits,
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
      message: 'Error fetching IP address log',
      error: error.message
    });
  }
});

// Export audit logs (summary for reporting)
router.get('/report/export-summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { Status: true };
    if (startDate || endDate) {
      query.CreateAt = {};
      if (startDate) query.CreateAt.$gte = new Date(startDate);
      if (endDate) query.CreateAt.$lte = new Date(endDate);
    }

    const totalAudits = await Audits.countDocuments(query);
    const uniqueUsers = await Audits.aggregate([
      { $match: query },
      { $group: { _id: '$CreateBy' } },
      { $count: 'uniqueUsers' }
    ]);

    const uniqueIPs = await Audits.aggregate([
      { $match: query },
      { $group: { _id: '$ipAddress' } },
      { $count: 'uniqueIPs' }
    ]);

    const actionBreakdown = await Audits.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $cond: [
              { $ne: ['$Reservations', null] },
              'Reservations',
              { $cond: [{ $ne: ['$file', null] }, 'File', 'Other'] }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Audit export summary generated successfully',
      data: {
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Now'
        },
        totalAudits,
        uniqueUsers: uniqueUsers[0]?.uniqueUsers || 0,
        uniqueIPs: uniqueIPs[0]?.uniqueIPs || 0,
        actionBreakdown,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating export summary',
      error: error.message
    });
  }
});

module.exports = router;
