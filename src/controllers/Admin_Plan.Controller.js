const Admin_Plan = require('../models/Admin_Plan.model');
const User = require('../models/User.model');

// Create Admin Plan
const createAdminPlan = async (req, res) => {
  try {
    const { PlanName, Description, Price, expiry_day, fesility } = req.body;
    const userId = req.user.user_id;

    if (!PlanName) {
      return res.status(400).json({
        success: false,
        message: 'PlanName is required'
      });
    }

    if (Price === undefined || Price === null) {
      return res.status(400).json({
        success: false,
        message: 'Price is required'
      });
    }

    // Validate fesility structure if provided
    if (fesility && !Array.isArray(fesility)) {
      return res.status(400).json({
        success: false,
        message: 'fesility must be an array'
      });
    }

    // Validate each fesility object
    if (fesility) {
      for (const fesilityItem of fesility) {
        if (typeof fesilityItem !== 'object' || fesilityItem === null) {
          return res.status(400).json({
            success: false,
            message: 'Each fesility item must be an object'
          });
        }
        if (fesilityItem.statue !== undefined && typeof fesilityItem.statue !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: 'statue must be a boolean'
          });
        }
      }
    }

    const adminPlan = new Admin_Plan({
      PlanName,
      Description: Description || '',
      Price: parseFloat(Price),
      expiry_day: expiry_day ? new Date(expiry_day) : null,
      fesility: fesility || [],
      Status: true,
      CreateBy: userId
    });

    const savedPlan = await adminPlan.save();

    // Fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: savedPlan.CreateBy }),
      savedPlan.UpdatedBy ? User.findOne({ user_id: savedPlan.UpdatedBy }) : null
    ]);

    const planResponse = savedPlan.toObject();
    planResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    planResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'Admin plan created successfully',
      data: planResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin plan',
      error: error.message
    });
  }
};

// Update Admin Plan
const updateAdminPlan = async (req, res) => {
  try {
    const { id, PlanName, Description, Price, expiry_day, fesility, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin Plan ID is required in request body'
      });
    }

    const adminPlan = await Admin_Plan.findOne({ 
      Admin_Plan_id: parseInt(id) 
    });

    if (!adminPlan) {
      return res.status(404).json({
        success: false,
        message: 'Admin plan not found'
      });
    }

    if (PlanName !== undefined) adminPlan.PlanName = PlanName;
    if (Description !== undefined) adminPlan.Description = Description;
    if (Price !== undefined) adminPlan.Price = parseFloat(Price);
    if (expiry_day !== undefined) {
      adminPlan.expiry_day = expiry_day ? new Date(expiry_day) : null;
    }

    // Validate and update fesility if provided
    if (fesility !== undefined) {
      if (!Array.isArray(fesility)) {
        return res.status(400).json({
          success: false,
          message: 'fesility must be an array'
        });
      }

      // Validate each fesility object
      for (const fesilityItem of fesility) {
        if (typeof fesilityItem !== 'object' || fesilityItem === null) {
          return res.status(400).json({
            success: false,
            message: 'Each fesility item must be an object'
          });
        }
        if (fesilityItem.statue !== undefined && typeof fesilityItem.statue !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: 'statue must be a boolean'
          });
        }
      }

      adminPlan.fesility = fesility;
    }

    if (Status !== undefined) adminPlan.Status = Status;
    
    adminPlan.UpdatedBy = userId;
    adminPlan.UpdatedAt = new Date();

    const updatedPlan = await adminPlan.save();

    // Fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: updatedPlan.CreateBy }),
      User.findOne({ user_id: updatedPlan.UpdatedBy })
    ]);

    const planResponse = updatedPlan.toObject();
    planResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    planResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Admin plan updated successfully',
      data: planResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin plan',
      error: error.message
    });
  }
};

// Get Admin Plan by ID
const getAdminPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminPlan = await Admin_Plan.findOne({ 
      Admin_Plan_id: parseInt(id) 
    });

    if (!adminPlan) {
      return res.status(404).json({
        success: false,
        message: 'Admin plan not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: adminPlan.CreateBy }),
      adminPlan.UpdatedBy ? User.findOne({ user_id: adminPlan.UpdatedBy }) : null
    ]);

    const planResponse = adminPlan.toObject();
    planResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    planResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      data: planResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin plan',
      error: error.message
    });
  }
};

// Get All Admin Plans
const getAllAdminPlans = async (req, res) => {
  try {
    const adminPlans = await Admin_Plan.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all plans
    const plansWithPopulatedData = await Promise.all(
      adminPlans.map(async (plan) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: plan.CreateBy }),
          plan.UpdatedBy ? User.findOne({ user_id: plan.UpdatedBy }) : null
        ]);

        const planResponse = plan.toObject();
        planResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        planResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return planResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: plansWithPopulatedData.length,
      data: plansWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin plans',
      error: error.message
    });
  }
};

// Get Admin Plan by Auth (current logged in user)
const getAdminPlanByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find plans created by the current user
    const adminPlans = await Admin_Plan.find({ 
      CreateBy: userId,
      Status: true 
    }).sort({ CreateAt: -1 });

    if (adminPlans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin plans found for current user'
      });
    }

    // Fetch related data for all plans
    const plansWithPopulatedData = await Promise.all(
      adminPlans.map(async (plan) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: plan.CreateBy }),
          plan.UpdatedBy ? User.findOne({ user_id: plan.UpdatedBy }) : null
        ]);

        const planResponse = plan.toObject();
        planResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        planResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return planResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: plansWithPopulatedData.length,
      data: plansWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin plans',
      error: error.message
    });
  }
};

// Delete Admin Plan
const deleteAdminPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const adminPlan = await Admin_Plan.findOne({ 
      Admin_Plan_id: parseInt(id) 
    });

    if (!adminPlan) {
      return res.status(404).json({
        success: false,
        message: 'Admin plan not found'
      });
    }

    await Admin_Plan.deleteOne({ Admin_Plan_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Admin plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin plan',
      error: error.message
    });
  }
};

module.exports = {
  createAdminPlan,
  updateAdminPlan,
  getAdminPlanById,
  getAllAdminPlans,
  getAdminPlanByAuth,
  deleteAdminPlan
};

