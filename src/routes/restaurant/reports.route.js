const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  reportsToday, 
  reportsMonth, 
  reportsSixMonth, 
  reportsOneYear,
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
} = require('../../controllers/Reports.Controller');

// Restaurant Reports routes 16/09/2025
router.get('/reports_today', auth, reportsToday);
router.get('/reports_month', auth, reportsMonth);
router.get('/reports_six_month', auth, reportsSixMonth);
router.get('/reports_one_year', auth, reportsOneYear);

// Restaurant Performance API with filters and chart
router.get('/restaurant_performoance/:id', auth, restaurant_performoance);

// Restaurant Top Performers API
router.get('/restaurant_Top_Performer', auth, restaurant_Top_Performer);

// Reports API
router.get('/reports', auth, reports);

// City Wise Usage Report
router.get('/city-wise-usage', auth, cityWiseUsageReport);

// Employee Performance API
router.get('/employee-performance/:employeeId', auth, employeePerformance);

// Restaurant Dashboard API (id is optional, uses authenticated user if not provided)
router.get('/restaurant-dashboard', auth, restaurantDashboard);

// Dashboard API - Simple dashboard with TotalOrders, TotalSales, TopSellers, StockAlerts
router.get('/dashboard', auth, dashboard);

// Get Restaurant Performance API with metrics and chart data
router.get('/getRestaurantPerformance', auth, getRestaurantPerformance);

// ReportsStats API - Comprehensive statistics
router.get('/ReportsStats', auth, ReportsStats);

// Restaurant By Chart By City (with auth)
router.get('/RestaurantByChartByCity', auth, RestaurantByChartByCity);

module.exports = router;
