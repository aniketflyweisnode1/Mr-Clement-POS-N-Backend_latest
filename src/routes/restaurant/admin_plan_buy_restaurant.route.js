const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createAdminPlanBuyRestaurant,
  updateAdminPlanBuyRestaurant,
  getAdminPlanBuyRestaurantById,
  getAllAdminPlanBuyRestaurant,
  getAdminPlanBuyRestaurantByAuth,
  deleteAdminPlanBuyRestaurant,
  fistPlan_buy_byuserid,
  isActiveByAuth,
  TotalRenewPlanByauth,
  MatchPlanDay_and_IsAcitveExpirydate,
  getAllSubscription,
  Plan_Heat_cityes,
  getRestaurantSubscriptionPurchased,
  sendRenewalEmail,
  RestaurantSubscriptionRenewalAlert,
  RestaurantSubscriptionList,
  TopRestaurantPerformer,
  RestaurantBillHistory
} = require('../../controllers/Admin_Plan_buy_Restaurant.Controller');

// Create Admin Plan Buy Restaurant (with auth)
router.post('/create', auth, createAdminPlanBuyRestaurant);

// Update Admin Plan Buy Restaurant (with auth)
router.put('/update', auth, updateAdminPlanBuyRestaurant);

// Get Admin Plan Buy Restaurant by ID (with auth)
router.get('/getbyid/:id', auth, getAdminPlanBuyRestaurantById);

// Get all Admin Plan Buy Restaurants (with auth)
router.get('/getall', auth, getAllAdminPlanBuyRestaurant);

// Get Admin Plan Buy Restaurant by auth (with auth)
router.get('/getbyauth', auth, getAdminPlanBuyRestaurantByAuth);

// Delete Admin Plan Buy Restaurant (with auth)
router.delete('/delete/:id', auth, deleteAdminPlanBuyRestaurant);

// Get First Plan Buy by User ID (with auth)
router.get('/fistPlan_buy_byuserid/:userid', auth, fistPlan_buy_byuserid);

// Check if Plan is Active by Auth (with auth)
router.get('/isActiveByAuth', auth, isActiveByAuth);

// Get Total Renew Plans by Auth (with auth)
router.get('/TotalRenewPlanByauth', auth, TotalRenewPlanByauth);

// Match Plan Day and Check IsActive, Expiry Date, Remaining Days (with auth)
router.get('/MatchPlanDay_and_IsAcitveExpirydate', auth, MatchPlanDay_and_IsAcitveExpirydate);

// Get All Subscriptions with Date Filter (with auth)
router.get('/getAllSubscription', auth, getAllSubscription);

// Plan Heat Map by Cities (with auth)
router.get('/Plan_Heat_cityes', auth, Plan_Heat_cityes);

// Get Restaurant Subscription Purchased Details (with auth)
router.get('/getRestaurantSubscriptionPurchased', auth, getRestaurantSubscriptionPurchased);

// Send Renewal Email (with auth)
router.post('/sendRenewalEmail', auth, sendRenewalEmail);

// Restaurant Subscription Renewal Alert (with auth)
router.get('/RestaurantSubscriptionRenewalAlert', auth, RestaurantSubscriptionRenewalAlert);

// Restaurant Subscription List with City Chart (with auth)
router.get('/RestaurantSubscriptionList', auth, RestaurantSubscriptionList);

// Top Restaurant Performer (with auth)
router.get('/TopRestaurantPerformer', auth, TopRestaurantPerformer);

// Restaurant Bill History (with auth)
router.get('/RestaurantBillHistory', auth, RestaurantBillHistory);

module.exports = router;

