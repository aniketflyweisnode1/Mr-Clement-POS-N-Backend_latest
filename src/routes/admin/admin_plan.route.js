const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createAdminPlan,
  updateAdminPlan,
  getAdminPlanById,
  getAllAdminPlans,
  getAdminPlanByAuth,
  deleteAdminPlan
} = require('../../controllers/Admin_Plan.Controller');
const Admin_Plan = require('../../models/Admin_Plan.model');
const User = require('../../models/User.model');

// Create Admin Plan (with auth)
router.post('/create', auth, createAdminPlan);

// Update Admin Plan (with auth)
router.put('/update', auth, updateAdminPlan);

// Get Admin Plan by ID (with auth)
router.get('/getbyid/:id', auth, getAdminPlanById);

// Get all Admin Plans (with auth)
router.get('/getall', auth, getAllAdminPlans);

// Get Admin Plan by auth (with auth)
router.get('/getbyauth', auth, getAdminPlanByAuth);

// Delete Admin Plan (with auth)
router.delete('/delete/:id', auth, deleteAdminPlan);

// Update Admin Plan Status (Activate/Deactivate)
router.patch('/status/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;
    const userId = req.user.user_id;

    if (Status === undefined || typeof Status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status is required and must be boolean'
      });
    }

    const updatedPlan = await Admin_Plan.findOneAndUpdate(
      { Admin_Plan_id: parseInt(id) },
      {
        Status: Status,
        UpdatedBy: userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const createByUser = updatedPlan.CreateBy ? await User.findOne({ user_id: updatedPlan.CreateBy }) : null;

    res.status(200).json({
      success: true,
      message: `Plan ${Status ? 'activated' : 'deactivated'} successfully`,
      data: {
        Admin_Plan_id: updatedPlan.Admin_Plan_id,
        PlanName: updatedPlan.PlanName,
        Price: updatedPlan.Price,
        Status: updatedPlan.Status,
        CreateBy: createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null,
        UpdatedAt: updatedPlan.UpdatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating plan status',
      error: error.message
    });
  }
});

// Set/Update Renewal Messages for Plans
router.put('/renewal-messages', auth, async (req, res) => {
  try {
    const { renewalMessages } = req.body;
    const userId = req.user.user_id;

    if (!renewalMessages || !Array.isArray(renewalMessages)) {
      return res.status(400).json({
        success: false,
        message: 'renewalMessages must be an array'
      });
    }

    // Update all plans with their renewal messages
    const updatedPlans = await Promise.all(
      renewalMessages.map(async (item) => {
        if (!item.planId || !item.message || item.status === undefined) {
          throw new Error('Each renewal message must have planId, message, and status');
        }

        const updatedPlan = await Admin_Plan.findOneAndUpdate(
          { Admin_Plan_id: parseInt(item.planId) },
          {
            renewalMessage: {
              message: item.message,
              status: item.status,
              scheduledDate: item.scheduledDate || new Date()
            },
            UpdatedBy: userId,
            UpdatedAt: new Date()
          },
          { new: true }
        );

        return updatedPlan;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Renewal messages updated successfully',
      data: updatedPlans.map(plan => ({
        Admin_Plan_id: plan.Admin_Plan_id,
        PlanName: plan.PlanName,
        Price: plan.Price,
        renewalMessage: plan.renewalMessage ? {
          message: plan.renewalMessage.message,
          status: plan.renewalMessage.status,
          scheduledDate: plan.renewalMessage.scheduledDate
        } : null
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating renewal messages',
      error: error.message
    });
  }
});

// Get Subscription Details Dashboard
router.get('/subscription-dashboard', auth, async (req, res) => {
  try {
    const plans = await Admin_Plan.find({ Status: true });

    // Group plans by duration
    const subscriptionPlans = plans.map(plan => ({
      Admin_Plan_id: plan.Admin_Plan_id,
      PlanName: plan.PlanName,
      Price: plan.Price,
      Duration: plan.expiry_day ? 'Custom' : 'Monthly',
      Status: plan.Status,
      renewalMessage: plan.renewalMessage || null
    }));

    res.status(200).json({
      success: true,
      message: 'Subscription dashboard data retrieved',
      data: {
        totalPlans: subscriptionPlans.length,
        subscriptionPlans: subscriptionPlans,
        activePlans: subscriptionPlans.filter(p => p.Status).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription dashboard',
      error: error.message
    });
  }
});

module.exports = router;

