const Plan = require('../models/Plan.model');
const User = require('../models/User.model');

// Create Plan
const createPlan = async (req, res) => {
  try {
    const {
      name,
      plan_duration,
      plan_facility,
      Status
    } = req.body;

    const plan = new Plan({
      name,
      plan_duration,
      plan_facility,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedPlan = await plan.save();
    
    // Manually fetch related data
    const createByUser = savedPlan.CreateBy ? 
      await User.findOne({ user_id: savedPlan.CreateBy }) : null;

    // Create response object with populated data
    const planResponse = savedPlan.toObject();
    planResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: planResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating plan',
      error: error.message
    });
  }
};

// Update Plan
const updatePlan = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required in request body'
      });
    }

    const plan = await Plan.findOne({ Plan_id: parseInt(id) });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Plan_id') {
        plan[key] = updateData[key];
      }
    });

    plan.UpdatedBy = userId;
    plan.UpdatedAt = new Date();

    const updatedPlan = await plan.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedPlan.CreateBy ? User.findOne({ user_id: updatedPlan.CreateBy }) : null,
      updatedPlan.UpdatedBy ? User.findOne({ user_id: updatedPlan.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const planResponse = updatedPlan.toObject();
    planResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    planResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: planResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating plan',
      error: error.message
    });
  }
};

// Get Plan by ID
const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await Plan.findOne({ Plan_id: parseInt(id) });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      plan.CreateBy ? User.findOne({ user_id: plan.CreateBy }) : null,
      plan.UpdatedBy ? User.findOne({ user_id: plan.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const planResponse = plan.toObject();
    planResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    planResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: planResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plan',
      error: error.message
    });
  }
};

// Get All Plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all plans
    const plansResponse = await Promise.all(plans.map(async (plan) => {
      const createByUser = plan.CreateBy ? 
        await User.findOne({ user_id: plan.CreateBy }) : null;

      const planObj = plan.toObject();
      planObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return planObj;
    }));

    res.status(200).json({
      success: true,
      count: plansResponse.length,
      data: plansResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
};

// Get Plan by Auth (current logged in user)
const getPlanByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const plans = await Plan.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!plans || plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plans not found for current user'
      });
    }

    // Manually fetch related data for all plans
    const plansResponse = await Promise.all(plans.map(async (plan) => {
      const [createByUser, updatedByUser] = await Promise.all([
        plan.CreateBy ? User.findOne({ user_id: plan.CreateBy }) : null,
        plan.UpdatedBy ? User.findOne({ user_id: plan.UpdatedBy }) : null
      ]);

      const planObj = plan.toObject();
      planObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      planObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return planObj;
    }));

    res.status(200).json({
      success: true,
      count: plansResponse.length,
      data: plansResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
};

module.exports = {
  createPlan,
  updatePlan,
  getPlanById,
  getAllPlans,
  getPlanByAuth
};
