const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const db = require('../../config/database');

// Get Employee Dashboard with all required data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const restaurant_id = req.user.restaurant_id;

    // Get employee info
    const employeeQuery = 'SELECT user_id, Name, email, Restaurant_id FROM users WHERE user_id = ? AND Restaurant_id = ?';
    const employee = await db.query(employeeQuery, [user_id, restaurant_id]);

    if (!employee || employee.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get Subscriptions Purchased by this Restaurant
    const subscriptionsQuery = `
      SELECT 
        apbr.Admin_Plan_Buy_Restaurant_id,
        apbr.Admin_Plan_id,
        ap.Name as Plan_Name,
        ap.Price,
        apbr.PurchasedDate,
        apbr.ExpiryDate,
        apbr.paymentStatus,
        apbr.isActive,
        u.Name as Business_Name,
        u.email
      FROM Admin_Plan_Buy_Restaurant apbr
      JOIN Admin_Plans ap ON apbr.Admin_Plan_id = ap.Admin_Plan_id
      JOIN users u ON apbr.User_id = u.user_id
      WHERE u.Restaurant_id = ? AND apbr.Status = true
      ORDER BY apbr.PurchasedDate DESC
      LIMIT 10
    `;
    const subscriptions = await db.query(subscriptionsQuery, [restaurant_id]);

    // Get Heat Map Data - City wise usage for this restaurant
    const heatMapQuery = `
      SELECT 
        c.City_id,
        c.City_Name as city,
        COUNT(DISTINCT u.user_id) as restaurant_count,
        SUM(ap.Price) as total_revenue
      FROM users u
      JOIN City c ON u.City_id = c.City_id
      LEFT JOIN Admin_Plan_Buy_Restaurant apbr ON u.user_id = apbr.User_id
      LEFT JOIN Admin_Plans ap ON apbr.Admin_Plan_id = ap.Admin_Plan_id
      WHERE u.Restaurant_id = ? AND u.Status = true
      GROUP BY c.City_id, c.City_Name
      ORDER BY restaurant_count DESC
    `;
    const heatMapData = await db.query(heatMapQuery, [restaurant_id]);

    // Get Support Tickets
    const ticketsQuery = `
      SELECT 
        t.Support_Ticket_id,
        t.TicketNumber,
        t.Subject,
        t.Description,
        t.Status,
        t.Priority,
        t.CreatedDate,
        t.UpdatedDate,
        u.Name as CreatedBy
      FROM Support_Tickets t
      JOIN users u ON t.CreatedBy_user_id = u.user_id
      WHERE u.Restaurant_id = ? 
      ORDER BY t.CreatedDate DESC
      LIMIT 5
    `;
    const tickets = await db.query(ticketsQuery, [restaurant_id]);

    // Get Subscription Renewal Alerts
    const renewalQuery = `
      SELECT 
        apbr.Admin_Plan_Buy_Restaurant_id,
        u.Name as Business_Name,
        u.email,
        ap.Name as Plan_Name,
        apbr.ExpiryDate,
        DATEDIFF(apbr.ExpiryDate, NOW()) as days_remaining,
        apbr.paymentStatus,
        CASE 
          WHEN DATEDIFF(apbr.ExpiryDate, NOW()) <= 0 THEN 'Expired'
          WHEN DATEDIFF(apbr.ExpiryDate, NOW()) <= 7 THEN 'Critical'
          WHEN DATEDIFF(apbr.ExpiryDate, NOW()) <= 30 THEN 'Warning'
          ELSE 'Active'
        END as alert_status
      FROM Admin_Plan_Buy_Restaurant apbr
      JOIN Admin_Plans ap ON apbr.Admin_Plan_id = ap.Admin_Plan_id
      JOIN users u ON apbr.User_id = u.user_id
      WHERE u.Restaurant_id = ? AND apbr.Status = true
      HAVING days_remaining <= 30
      ORDER BY apbr.ExpiryDate ASC
      LIMIT 10
    `;
    const renewalAlerts = await db.query(renewalQuery, [restaurant_id]);

    return res.status(200).json({
      success: true,
      message: 'Employee dashboard data retrieved successfully',
      data: {
        employee: {
          user_id: employee[0].user_id,
          name: employee[0].Name,
          email: employee[0].email
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
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        apbr.Admin_Plan_Buy_Restaurant_id,
        apbr.Admin_Plan_id,
        ap.Name as Plan_Name,
        ap.Price,
        apbr.PurchasedDate,
        apbr.ExpiryDate,
        apbr.paymentStatus,
        apbr.isActive,
        u.Name as Business_Name,
        u.email,
        u.Phone
      FROM Admin_Plan_Buy_Restaurant apbr
      JOIN Admin_Plans ap ON apbr.Admin_Plan_id = ap.Admin_Plan_id
      JOIN users u ON apbr.User_id = u.user_id
      WHERE u.Restaurant_id = ? AND apbr.Status = true
      ORDER BY apbr.PurchasedDate DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM Admin_Plan_Buy_Restaurant apbr
      JOIN users u ON apbr.User_id = u.user_id
      WHERE u.Restaurant_id = ? AND apbr.Status = true
    `;

    const subscriptions = await db.query(query, [restaurant_id, limit, offset]);
    const countResult = await db.query(countQuery, [restaurant_id]);
    const total = countResult[0].total;

    return res.status(200).json({
      success: true,
      message: 'Subscriptions purchased retrieved successfully',
      data: subscriptions,
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
    const restaurant_id = req.user.restaurant_id;

    const query = `
      SELECT 
        c.City_id,
        c.City_Name as city,
        COUNT(DISTINCT u.user_id) as restaurant_count,
        SUM(CASE WHEN apbr.Status = true THEN ap.Price ELSE 0 END) as total_revenue,
        COUNT(DISTINCT apbr.Admin_Plan_Buy_Restaurant_id) as subscription_count
      FROM users u
      JOIN City c ON u.City_id = c.City_id
      LEFT JOIN Admin_Plan_Buy_Restaurant apbr ON u.user_id = apbr.User_id
      LEFT JOIN Admin_Plans ap ON apbr.Admin_Plan_id = ap.Admin_Plan_id
      WHERE u.Restaurant_id = ? AND u.Status = true
      GROUP BY c.City_id, c.City_Name
      ORDER BY restaurant_count DESC
    `;

    const heatMapData = await db.query(query, [restaurant_id]);

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
    const offset = (page - 1) * limit;
    const status = req.query.status || null;

    let query = `
      SELECT 
        t.Support_Ticket_id,
        t.TicketNumber,
        t.Subject,
        t.Description,
        t.Status,
        t.Priority,
        t.CreatedDate,
        t.UpdatedDate,
        u.Name as CreatedBy,
        u.email
      FROM Support_Tickets t
      JOIN users u ON t.CreatedBy_user_id = u.user_id
      WHERE u.Restaurant_id = ?
    `;

    let params = [restaurant_id];

    if (status) {
      query += ' AND t.Status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    
    query += ' ORDER BY t.CreatedDate DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const tickets = await db.query(query, params);
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = countResult[0].total;

    return res.status(200).json({
      success: true,
      message: 'Support tickets retrieved successfully',
      data: tickets,
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
    const restaurant_id = req.user.restaurant_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        apbr.Admin_Plan_Buy_Restaurant_id,
        u.Name as Business_Name,
        u.email,
        ap.Name as Plan_Name,
        apbr.ExpiryDate,
        DATEDIFF(apbr.ExpiryDate, NOW()) as days_remaining,
        apbr.paymentStatus,
        CASE 
          WHEN DATEDIFF(apbr.ExpiryDate, NOW()) <= 0 THEN 'Expired'
          WHEN DATEDIFF(apbr.ExpiryDate, NOW()) <= 7 THEN 'Critical'
          WHEN DATEDIFF(apbr.ExpiryDate, NOW()) <= 30 THEN 'Warning'
          ELSE 'Active'
        END as alert_status
      FROM Admin_Plan_Buy_Restaurant apbr
      JOIN Admin_Plans ap ON apbr.Admin_Plan_id = ap.Admin_Plan_id
      JOIN users u ON apbr.User_id = u.user_id
      WHERE u.Restaurant_id = ? AND apbr.Status = true
      HAVING days_remaining <= 30
      ORDER BY apbr.ExpiryDate ASC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM Admin_Plan_Buy_Restaurant apbr
      JOIN users u ON apbr.User_id = u.user_id
      WHERE u.Restaurant_id = ? AND apbr.Status = true
      AND DATEDIFF(apbr.ExpiryDate, NOW()) <= 30
    `;

    const renewalAlerts = await db.query(query, [restaurant_id, limit, offset]);
    const countResult = await db.query(countQuery, [restaurant_id]);
    const total = countResult[0].total;

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
