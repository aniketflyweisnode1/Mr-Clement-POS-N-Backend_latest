const Admin_Plan_buy_Restaurant = require('../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../models/Admin_Plan.model');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const City = require('../models/City.model');
const Role = require('../models/Role.model');
const Clients = require('../models/Clients.model');
const Responsibility = require('../models/Responsibility.model');
const Language = require('../models/Language.model');
const Currency = require('../models/currency.model');
const Country = require('../models/Country.model');
const State = require('../models/State.model');

// Create Admin Plan Buy Restaurant
const createAdminPlanBuyRestaurant = async (req, res) => {
  try {
    const { Admin_Plan_id} = req.body;
    const userId = req.user.user_id;

    if (!Admin_Plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Admin_Plan_id is required'
      });
    }

    // Verify Admin Plan exists
    const adminPlan = await Admin_Plan.findOne({ Admin_Plan_id: parseInt(Admin_Plan_id) });
    if (!adminPlan) {
      return res.status(404).json({
        success: false,
        message: 'Admin Plan not found'
      });
    }

    // Auto-set Trangection_id if not provided - find latest transaction for the user
    let transactionId = null;
      // Find the latest transaction for this user
      const latestTransaction = await Transaction.findOne({ 
        user_id: userId,
        amount: adminPlan.Price,
        payment_method: 'Online',
        transactionType: 'Plan_Buy',
        reference_number: 'Plan_Buy',
        CGST: 0,
        SGST: 0,
        TotalGST: 0,
        bank_id: null,
        PaymentDetails_id: null,
        isDownloaded: false,
        fileDownlodedPath: null,
        created_by: userId
      }).sort({ created_at: -1 });
      
      if (latestTransaction) {
        transactionId = latestTransaction.transagtion_id;
      }

    // If paymentStatus is true, verify transaction status
    let finalPaymentStatus = paymentStatus !== undefined ? paymentStatus : false;
    let finalIsActive = isActive !== undefined ? isActive : false;
    let calculatedExpiryDate = null;

    let paymentSuccessDate = null;
    if (finalPaymentStatus && transactionId) {
      const transaction = await Transaction.findOne({ transagtion_id: transactionId });
      if (transaction && transaction.status === 'success') {
        finalIsActive = true;
        // Set paymentSuccessDate when transaction is successful
        paymentSuccessDate = transaction.transaction_date || new Date();
        // Calculate expiry_date based on plan duration
        if (adminPlan.expiry_day) {
          const planExpiryDay = new Date(adminPlan.expiry_day);
          const planCreateDate = adminPlan.CreateAt || new Date();
          // Calculate duration in days
          const durationMs = planExpiryDay - planCreateDate;
          const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
          
          // Set expiry_date = current date + duration
          const currentDate = new Date();
          calculatedExpiryDate = new Date(currentDate);
          calculatedExpiryDate.setDate(currentDate.getDate() + durationDays);
        }
      } else {
        // Transaction not found or not successful
        finalPaymentStatus = false;
        finalIsActive = false;
      }
    }

    const adminPlanBuyRestaurant = new Admin_Plan_buy_Restaurant({
      Admin_Plan_id: parseInt(Admin_Plan_id),
      isActive: finalIsActive,
      paymentStatus: finalPaymentStatus,
      Trangection_id: transactionId,
      expiry_date: calculatedExpiryDate,
      paymentSuccessDate: paymentSuccessDate,
      Status: true,
      CreateBy: userId
    });

    const savedPlanBuy = await adminPlanBuyRestaurant.save();

    // Fetch related data
    const [createByUser, updatedByUser, adminPlanData] = await Promise.all([
      User.findOne({ user_id: savedPlanBuy.CreateBy }),
      savedPlanBuy.UpdatedBy ? User.findOne({ user_id: savedPlanBuy.UpdatedBy }) : null,
      Admin_Plan.findOne({ Admin_Plan_id: savedPlanBuy.Admin_Plan_id })
    ]);

    const planBuyResponse = savedPlanBuy.toObject();
    planBuyResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    planBuyResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    planBuyResponse.Admin_Plan_id = adminPlanData ? {
      Admin_Plan_id: adminPlanData.Admin_Plan_id,
      PlanName: adminPlanData.PlanName,
      Description: adminPlanData.Description,
      Price: adminPlanData.Price
    } : null;

    res.status(201).json({
      success: true,
      message: 'Admin plan buy restaurant created successfully',
      data: planBuyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin plan buy restaurant',
      error: error.message
    });
  }
};

// Update Admin Plan Buy Restaurant
const updateAdminPlanBuyRestaurant = async (req, res) => {
  try {
    const { id, Admin_Plan_id, isActive, paymentStatus, Trangection_id, expiry_date, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin Plan Buy Restaurant ID is required in request body'
      });
    }

    const adminPlanBuyRestaurant = await Admin_Plan_buy_Restaurant.findOne({ 
      Admin_Plan_buy_Restaurant_id: parseInt(id) 
    });

    if (!adminPlanBuyRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Admin plan buy restaurant not found'
      });
    }

    // Verify Admin Plan exists if updating
    let adminPlan;
    if (Admin_Plan_id !== undefined) {
      adminPlan = await Admin_Plan.findOne({ Admin_Plan_id: parseInt(Admin_Plan_id) });
      if (!adminPlan) {
        return res.status(404).json({
          success: false,
          message: 'Admin Plan not found'
        });
      }
      adminPlanBuyRestaurant.Admin_Plan_id = parseInt(Admin_Plan_id);
    } else {
      // Get existing Admin Plan for expiry calculation
      adminPlan = await Admin_Plan.findOne({ 
        Admin_Plan_id: adminPlanBuyRestaurant.Admin_Plan_id 
      });
      
      if (!adminPlan) {
        return res.status(404).json({
          success: false,
          message: 'Admin Plan not found'
        });
      }
    }

    // Auto-set Trangection_id if not provided and not already set
    if (Trangection_id !== undefined) {
      adminPlanBuyRestaurant.Trangection_id = Trangection_id ? parseInt(Trangection_id) : null;
    } else if (!adminPlanBuyRestaurant.Trangection_id) {
      // Find the latest transaction for this user if Trangection_id is not set
      const latestTransaction = await Transaction.findOne({ 
        user_id: adminPlanBuyRestaurant.CreateBy,
        transactionType: 'Plan_Buy'
      }).sort({ created_at: -1 });
      
      if (latestTransaction) {
        adminPlanBuyRestaurant.Trangection_id = latestTransaction.transagtion_id;
      }
    }

    // Handle paymentStatus change to true
    const previousPaymentStatus = adminPlanBuyRestaurant.paymentStatus;
    if (paymentStatus !== undefined) {
      adminPlanBuyRestaurant.paymentStatus = paymentStatus;
    }

    // If paymentStatus is being set to true or is already true, check transaction and update expiry_date and isActive
    if (adminPlanBuyRestaurant.paymentStatus === true) {
      const transactionId = adminPlanBuyRestaurant.Trangection_id;
      
      if (transactionId) {
        const transaction = await Transaction.findOne({ transagtion_id: transactionId });
        
        if (transaction && transaction.status === 'success') {
          // Transaction is successful, activate plan and set expiry_date
          adminPlanBuyRestaurant.isActive = true;
          
          // Set paymentSuccessDate when transaction is successful
          if (!adminPlanBuyRestaurant.paymentSuccessDate) {
            adminPlanBuyRestaurant.paymentSuccessDate = transaction.transaction_date || new Date();
          }
          
          // Calculate expiry_date based on plan duration
          if (adminPlan.expiry_day) {
            const planExpiryDay = new Date(adminPlan.expiry_day);
            const planCreateDate = adminPlan.CreateAt || new Date();
            // Calculate duration in days
            const durationMs = planExpiryDay - planCreateDate;
            const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
            
            // Set expiry_date = current date + duration (or update date if already set)
            const currentDate = new Date();
            const calculatedExpiryDate = new Date(currentDate);
            calculatedExpiryDate.setDate(currentDate.getDate() + durationDays);
            adminPlanBuyRestaurant.expiry_date = calculatedExpiryDate;
          }
        } else {
          // Transaction not found or not successful
          if (paymentStatus === true && previousPaymentStatus === false) {
            // Only reject if paymentStatus is being set to true now
            return res.status(400).json({
              success: false,
              message: 'Cannot set paymentStatus to true. Transaction not found or status is not success'
            });
          }
        }
      } else {
        // No transaction ID
        if (paymentStatus === true && previousPaymentStatus === false) {
          return res.status(400).json({
            success: false,
            message: 'Cannot set paymentStatus to true. Transaction ID is required'
          });
        }
      }
    } else {
      // If paymentStatus is being set to false, also set isActive to false
      if (paymentStatus === false) {
        adminPlanBuyRestaurant.isActive = false;
      }
    }

    // Allow manual override of isActive and expiry_date if explicitly provided
    if (isActive !== undefined) adminPlanBuyRestaurant.isActive = isActive;
    if (expiry_date !== undefined) {
      adminPlanBuyRestaurant.expiry_date = expiry_date ? new Date(expiry_date) : null;
    }
    if (Status !== undefined) adminPlanBuyRestaurant.Status = Status;
    
    adminPlanBuyRestaurant.UpdatedBy = userId;
    adminPlanBuyRestaurant.UpdatedAt = new Date();

    const updatedPlanBuy = await adminPlanBuyRestaurant.save();

    // Fetch related data
    const [createByUser, updatedByUser, adminPlanData] = await Promise.all([
      User.findOne({ user_id: updatedPlanBuy.CreateBy }),
      User.findOne({ user_id: updatedPlanBuy.UpdatedBy }),
      Admin_Plan.findOne({ Admin_Plan_id: updatedPlanBuy.Admin_Plan_id })
    ]);

    const planBuyResponse = updatedPlanBuy.toObject();
    planBuyResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    planBuyResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    planBuyResponse.Admin_Plan_id = adminPlanData ? {
      Admin_Plan_id: adminPlanData.Admin_Plan_id,
      PlanName: adminPlanData.PlanName,
      Description: adminPlanData.Description,
      Price: adminPlanData.Price
    } : null;

    res.status(200).json({
      success: true,
      message: 'Admin plan buy restaurant updated successfully',
      data: planBuyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin plan buy restaurant',
      error: error.message
    });
  }
};

// Get Admin Plan Buy Restaurant by ID
const getAdminPlanBuyRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminPlanBuyRestaurant = await Admin_Plan_buy_Restaurant.findOne({ 
      Admin_Plan_buy_Restaurant_id: parseInt(id) 
    });

    if (!adminPlanBuyRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Admin plan buy restaurant not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, adminPlanData] = await Promise.all([
      User.findOne({ user_id: adminPlanBuyRestaurant.CreateBy }),
      adminPlanBuyRestaurant.UpdatedBy ? User.findOne({ user_id: adminPlanBuyRestaurant.UpdatedBy }) : null,
      Admin_Plan.findOne({ Admin_Plan_id: adminPlanBuyRestaurant.Admin_Plan_id })
    ]);

    const planBuyResponse = adminPlanBuyRestaurant.toObject();
    planBuyResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    planBuyResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    planBuyResponse.Admin_Plan_id = adminPlanData ? {
      Admin_Plan_id: adminPlanData.Admin_Plan_id,
      PlanName: adminPlanData.PlanName,
      Description: adminPlanData.Description,
      Price: adminPlanData.Price
    } : null;

    res.status(200).json({
      success: true,
      data: planBuyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin plan buy restaurant',
      error: error.message
    });
  }
};

// Get All Admin Plan Buy Restaurant
const getAllAdminPlanBuyRestaurant = async (req, res) => {
  try {
    const adminPlanBuyRestaurants = await Admin_Plan_buy_Restaurant.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all records
    const plansBuyWithPopulatedData = await Promise.all(
      adminPlanBuyRestaurants.map(async (planBuy) => {
        const [createByUser, updatedByUser, adminPlanData] = await Promise.all([
          User.findOne({ user_id: planBuy.CreateBy }),
          planBuy.UpdatedBy ? User.findOne({ user_id: planBuy.UpdatedBy }) : null,
          Admin_Plan.findOne({ Admin_Plan_id: planBuy.Admin_Plan_id })
        ]);

        const planBuyResponse = planBuy.toObject();
        planBuyResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        planBuyResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        planBuyResponse.Admin_Plan_id = adminPlanData ? {
          Admin_Plan_id: adminPlanData.Admin_Plan_id,
          PlanName: adminPlanData.PlanName,
          Description: adminPlanData.Description,
          Price: adminPlanData.Price
        } : null;

        return planBuyResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: plansBuyWithPopulatedData.length,
      data: plansBuyWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin plan buy restaurants',
      error: error.message
    });
  }
};

// Get Admin Plan Buy Restaurant by Auth (current logged in user)
const getAdminPlanBuyRestaurantByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find plans bought by the current user
    const adminPlanBuyRestaurants = await Admin_Plan_buy_Restaurant.find({ 
      CreateBy: userId,
      Status: true 
    }).sort({ CreateAt: -1 });

    if (adminPlanBuyRestaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin plan buy restaurants found for current user'
      });
    }

    // Fetch related data for all records
    const plansBuyWithPopulatedData = await Promise.all(
      adminPlanBuyRestaurants.map(async (planBuy) => {
        const [createByUser, updatedByUser, adminPlanData] = await Promise.all([
          User.findOne({ user_id: planBuy.CreateBy }),
          planBuy.UpdatedBy ? User.findOne({ user_id: planBuy.UpdatedBy }) : null,
          Admin_Plan.findOne({ Admin_Plan_id: planBuy.Admin_Plan_id })
        ]);

        const planBuyResponse = planBuy.toObject();
        planBuyResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        planBuyResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        planBuyResponse.Admin_Plan_id = adminPlanData ? {
          Admin_Plan_id: adminPlanData.Admin_Plan_id,
          PlanName: adminPlanData.PlanName,
          Description: adminPlanData.Description,
          Price: adminPlanData.Price
        } : null;

        return planBuyResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: plansBuyWithPopulatedData.length,
      data: plansBuyWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin plan buy restaurants',
      error: error.message
    });
  }
};

// Delete Admin Plan Buy Restaurant
const deleteAdminPlanBuyRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const adminPlanBuyRestaurant = await Admin_Plan_buy_Restaurant.findOne({ 
      Admin_Plan_buy_Restaurant_id: parseInt(id) 
    });

    if (!adminPlanBuyRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Admin plan buy restaurant not found'
      });
    }

    await Admin_Plan_buy_Restaurant.deleteOne({ Admin_Plan_buy_Restaurant_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Admin plan buy restaurant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin plan buy restaurant',
      error: error.message
    });
  }
};

// Get First Plan Buy by User ID
const fistPlan_buy_byuserid = async (req, res) => {
  try {
    const { userid } = req.params;
    const parsedUserId = parseInt(userid);

    if (!userid || isNaN(parsedUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Verify user exists
    const user = await User.findOne({ user_id: parsedUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the first plan buy for this user (oldest by CreateAt)
    const firstPlanBuy = await Admin_Plan_buy_Restaurant.findOne({
      CreateBy: parsedUserId,
      Status: true
    }).sort({ CreateAt: 1 }); // Sort ascending to get the first one

    if (!firstPlanBuy) {
      return res.status(404).json({
        success: false,
        message: 'No plan buy found for this user'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, adminPlanData, transaction] = await Promise.all([
      User.findOne({ user_id: firstPlanBuy.CreateBy }),
      firstPlanBuy.UpdatedBy ? User.findOne({ user_id: firstPlanBuy.UpdatedBy }) : null,
      Admin_Plan.findOne({ Admin_Plan_id: firstPlanBuy.Admin_Plan_id }),
      firstPlanBuy.Trangection_id ? Transaction.findOne({ transagtion_id: firstPlanBuy.Trangection_id }) : null
    ]);

    const planBuyResponse = firstPlanBuy.toObject();
    planBuyResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    planBuyResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    planBuyResponse.Admin_Plan_id = adminPlanData ? {
      Admin_Plan_id: adminPlanData.Admin_Plan_id,
      PlanName: adminPlanData.PlanName,
      Description: adminPlanData.Description,
      Price: adminPlanData.Price,
      expiry_day: adminPlanData.expiry_day
    } : null;
    planBuyResponse.Transaction = transaction ? {
      transagtion_id: transaction.transagtion_id,
      amount: transaction.amount,
      status: transaction.status,
      payment_method: transaction.payment_method,
      transactionType: transaction.transactionType,
      transaction_date: transaction.transaction_date
    } : null;

    res.status(200).json({
      success: true,
      message: 'First plan buy retrieved successfully',
      data: planBuyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching first plan buy',
      error: error.message
    });
  }
};

// Check if Plan is Active by Auth (current logged in user)
const isActiveByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find active plans for the current user
    const activePlans = await Admin_Plan_buy_Restaurant.find({
      CreateBy: userId,
      isActive: true,
      Status: true
    }).sort({ CreateAt: -1 });

    // Check if any plan is currently active (not expired)
    const currentDate = new Date();
    let isActive = false;
    let activePlanDetails = null;

    for (const plan of activePlans) {
      if (plan.expiry_date) {
        const expiryDate = new Date(plan.expiry_date);
        if (expiryDate > currentDate && plan.paymentStatus === true) {
          isActive = true;
          activePlanDetails = {
            Admin_Plan_buy_Restaurant_id: plan.Admin_Plan_buy_Restaurant_id,
            isActive: plan.isActive,
            paymentStatus: plan.paymentStatus,
            expiry_date: plan.expiry_date,
            CreateAt: plan.CreateAt
          };
          break; // Get the first active plan
        }
      } else if (plan.paymentStatus === true) {
        // If no expiry_date but payment is successful, consider it active
        isActive = true;
        activePlanDetails = {
          Admin_Plan_buy_Restaurant_id: plan.Admin_Plan_buy_Restaurant_id,
          isActive: plan.isActive,
          paymentStatus: plan.paymentStatus,
          expiry_date: plan.expiry_date,
          CreateAt: plan.CreateAt
        };
        break;
      }
    }

    res.status(200).json({
      success: true,
      isActive: isActive,
      activePlan: activePlanDetails,
      totalActivePlans: activePlans.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking plan active status',
      error: error.message
    });
  }
};

// Get Total Renew Plans by Auth (current logged in user)
const TotalRenewPlanByauth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get the first plan buy
    const firstPlanBuy = await Admin_Plan_buy_Restaurant.findOne({
      CreateBy: userId,
      Status: true
    }).sort({ CreateAt: 1 });

    if (!firstPlanBuy) {
      return res.status(200).json({
        success: true,
        message: 'No plans found for this user',
        totalRenewPlans: 0,
        firstPlanDate: null,
        renewPlans: []
      });
    }

    // Get all plans after the first one (renewals)
    const renewPlans = await Admin_Plan_buy_Restaurant.find({
      CreateBy: userId,
      Status: true,
      Admin_Plan_buy_Restaurant_id: { $ne: firstPlanBuy.Admin_Plan_buy_Restaurant_id }
    }).sort({ CreateAt: 1 });

    // Fetch related data for renew plans
    const renewPlansWithDetails = await Promise.all(
      renewPlans.map(async (plan) => {
        const adminPlanData = await Admin_Plan.findOne({ Admin_Plan_id: plan.Admin_Plan_id });
        return {
          Admin_Plan_buy_Restaurant_id: plan.Admin_Plan_buy_Restaurant_id,
          Admin_Plan_id: adminPlanData ? {
            Admin_Plan_id: adminPlanData.Admin_Plan_id,
            PlanName: adminPlanData.PlanName,
            Price: adminPlanData.Price
          } : null,
          isActive: plan.isActive,
          paymentStatus: plan.paymentStatus,
          expiry_date: plan.expiry_date,
          CreateAt: plan.CreateAt
        };
      })
    );

    res.status(200).json({
      success: true,
      totalRenewPlans: renewPlans.length,
      firstPlanDate: firstPlanBuy.CreateAt,
      renewPlans: renewPlansWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching total renew plans',
      error: error.message
    });
  }
};

// Match Plan Day and Check IsActive, Expiry Date, Remaining Days
const MatchPlanDay_and_IsAcitveExpirydate = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const currentDate = new Date();

    // Find all active plans for the current user
    const userPlans = await Admin_Plan_buy_Restaurant.find({
      CreateBy: userId,
      Status: true
    }).sort({ CreateAt: -1 });

    if (!userPlans || userPlans.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No plans found for this user',
        data: {
          hasActivePlan: false,
          isActive: false,
          expiry_date: null,
          remainingDays: 0,
          planDetails: null
        }
      });
    }

    // Find the most recent active plan that is not expired
    let activePlan = null;
    let remainingDays = 0;
    let isActive = false;

    for (const plan of userPlans) {
      // Check if plan is active and payment is successful
      if (plan.isActive === true && plan.paymentStatus === true) {
        if (plan.expiry_date) {
          const expiryDate = new Date(plan.expiry_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);

          // Calculate remaining days
          const timeDiff = expiryDate - today;
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff > 0) {
            // Plan is still valid
            activePlan = plan;
            remainingDays = daysDiff;
            isActive = true;
            break;
          } else if (daysDiff === 0) {
            // Plan expires today
            activePlan = plan;
            remainingDays = 0;
            isActive = true;
            break;
          }
          // If daysDiff < 0, plan is expired, continue to next plan
        } else {
          // No expiry date, consider it active
          activePlan = plan;
          remainingDays = null; // No expiry date means unlimited
          isActive = true;
          break;
        }
      }
    }

    // If no active plan found, get the most recent plan for reference
    if (!activePlan && userPlans.length > 0) {
      activePlan = userPlans[0];
    }

    // Fetch related data
    let planDetails = null;
    if (activePlan) {
      const [adminPlanData, transaction] = await Promise.all([
        Admin_Plan.findOne({ Admin_Plan_id: activePlan.Admin_Plan_id }),
        activePlan.Trangection_id ? Transaction.findOne({ transagtion_id: activePlan.Trangection_id }) : null
      ]);

      planDetails = {
        Admin_Plan_buy_Restaurant_id: activePlan.Admin_Plan_buy_Restaurant_id,
        Admin_Plan_id: adminPlanData ? {
          Admin_Plan_id: adminPlanData.Admin_Plan_id,
          PlanName: adminPlanData.PlanName,
          Description: adminPlanData.Description,
          Price: adminPlanData.Price,
          expiry_day: adminPlanData.expiry_day
        } : null,
        isActive: activePlan.isActive,
        paymentStatus: activePlan.paymentStatus,
        expiry_date: activePlan.expiry_date,
        CreateAt: activePlan.CreateAt,
        Transaction: transaction ? {
          transagtion_id: transaction.transagtion_id,
          status: transaction.status,
          amount: transaction.amount,
          transaction_date: transaction.transaction_date
        } : null
      };
    }

    res.status(200).json({
      success: true,
      message: 'Plan status retrieved successfully',
      data: {
        hasActivePlan: isActive,
        isActive: isActive,
        expiry_date: activePlan?.expiry_date || null,
        remainingDays: remainingDays,
        planDetails: planDetails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking plan status',
      error: error.message
    });
  }
};

// Helper function to get date range based on filter
const getDateRangeForFilter = (filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'thisWeek':
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - dayOfWeek);
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'thisMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'thisYear':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1)
      };
    default:
      return null; // No filter, return all
  }
};

// Get All Subscriptions with Date Filter
const getAllSubscription = async (req, res) => {
  try {
    const { filter } = req.query; // filter: today, thisWeek, thisMonth, thisYear

    // Build query - only get subscriptions with paymentStatus = true
    let query = { 
      Status: true,
      paymentStatus: true
    };

    // Apply date filter if provided
    if (filter) {
      const dateRange = getDateRangeForFilter(filter);
      if (dateRange) {
        query.CreateAt = {
          $gte: dateRange.start,
          $lt: dateRange.end
        };
      }
    }

    // Get all subscriptions matching the filter
    const subscriptions = await Admin_Plan_buy_Restaurant.find(query)
      .sort({ CreateAt: -1 });

    // Helper function to populate user with all IDs
    const populateUser = async (user) => {
      if (!user) return null;
      
      const [responsibility, role, language, currency, country, state, city] = await Promise.all([
        Responsibility.findOne({ Responsibility_id: user.Responsibility_id }),
        Role.findOne({ Role_id: user.Role_id }),
        Language.findOne({ Language_id: user.Language_id }),
        user.currency_id ? Currency.findOne({ currency_id: user.currency_id }) : null,
        Country.findOne({ Country_id: user.Country_id }),
        State.findOne({ State_id: user.State_id }),
        City.findOne({ City_id: user.City_id })
      ]);

      const userResponse = user.toObject();
      delete userResponse.password; // Remove password
      
      userResponse.Responsibility_id = responsibility ? {
        Responsibility_id: responsibility.Responsibility_id,
        Responsibility_name: responsibility.Responsibility_name
      } : null;
      userResponse.Role_id = role ? {
        Role_id: role.Role_id,
        role_name: role.role_name
      } : null;
      userResponse.Language_id = language ? {
        Language_id: language.Language_id,
        Language_name: language.Language_name
      } : null;
      userResponse.currency_id = currency ? {
        currency_id: currency.currency_id,
        name: currency.name,
        icon: currency.icon
      } : null;
      userResponse.Country_id = country ? {
        Country_id: country.Country_id,
        Country_name: country.Country_name,
        code: country.code
      } : null;
      userResponse.State_id = state ? {
        State_id: state.State_id,
        state_name: state.state_name,
        Code: state.Code
      } : null;
      userResponse.City_id = city ? {
        City_id: city.City_id,
        City_name: city.City_name,
        Code: city.Code
      } : null;

      return userResponse;
    };

    // Helper function to populate transaction with all IDs
    const populateTransaction = async (transaction) => {
      if (!transaction) return null;

      const [transactionUser, transactionCreatedBy] = await Promise.all([
        User.findOne({ user_id: transaction.user_id }),
        User.findOne({ user_id: transaction.created_by })
      ]);

      const transactionResponse = transaction.toObject();
      transactionResponse.user_id = await populateUser(transactionUser);
      transactionResponse.created_by = await populateUser(transactionCreatedBy);

      return transactionResponse;
    };

    // Fetch related data for all subscriptions
    const subscriptionsWithDetails = await Promise.all(
      subscriptions.map(async (subscription) => {
        const [createByUser, updatedByUser, adminPlanData, transaction] = await Promise.all([
          User.findOne({ user_id: subscription.CreateBy }),
          subscription.UpdatedBy ? User.findOne({ user_id: subscription.UpdatedBy }) : null,
          Admin_Plan.findOne({ Admin_Plan_id: subscription.Admin_Plan_id }),
          subscription.Trangection_id ? Transaction.findOne({ transagtion_id: subscription.Trangection_id }) : null
        ]);

        const subscriptionResponse = subscription.toObject();
        
        // Populate CreateBy with all IDs
        subscriptionResponse.CreateBy = await populateUser(createByUser);
        
        // Populate UpdatedBy with all IDs
        subscriptionResponse.UpdatedBy = await populateUser(updatedByUser);
        
        // Populate Admin_Plan_id with all fields
        subscriptionResponse.Admin_Plan_id = adminPlanData ? {
          Admin_Plan_id: adminPlanData.Admin_Plan_id,
          PlanName: adminPlanData.PlanName,
          Description: adminPlanData.Description,
          Price: adminPlanData.Price,
          expiry_day: adminPlanData.expiry_day,
          fesility: adminPlanData.fesility,
          Status: adminPlanData.Status,
          CreateBy: adminPlanData.CreateBy,
          CreateAt: adminPlanData.CreateAt,
          UpdatedBy: adminPlanData.UpdatedBy,
          UpdatedAt: adminPlanData.UpdatedAt
        } : null;
        
        // Populate Transaction with all IDs
        subscriptionResponse.Transaction = await populateTransaction(transaction);

        // Calculate remaining days if expiry_date exists
        if (subscription.expiry_date) {
          const expiryDate = new Date(subscription.expiry_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);
          const timeDiff = expiryDate - today;
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          subscriptionResponse.remainingDays = daysDiff > 0 ? daysDiff : 0;
        } else {
          subscriptionResponse.remainingDays = null;
        }

        return subscriptionResponse;
      })
    );

    // Calculate summary statistics
    const totalSubscriptions = subscriptionsWithDetails.length;
    const activeSubscriptions = subscriptionsWithDetails.filter(sub => sub.isActive === true && sub.paymentStatus === true).length;
    const totalRevenue = subscriptionsWithDetails.reduce((sum, sub) => {
      return sum + (sub.Transaction?.amount || 0);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      filter: filter || 'all',
      summary: {
        totalSubscriptions,
        activeSubscriptions,
        inactiveSubscriptions: totalSubscriptions - activeSubscriptions,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      count: subscriptionsWithDetails.length,
      data: subscriptionsWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// Plan Heat Map by Cities
const Plan_Heat_cityes = async (req, res) => {
  try {
    // Get all plan purchases with successful payment
    const planPurchases = await Admin_Plan_buy_Restaurant.find({
      paymentStatus: true,
      Status: true
    });

    if (planPurchases.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No plan purchases found',
        count: 0,
        data: []
      });
    }

    // Get all unique user IDs who purchased plans
    const userIds = [...new Set(planPurchases.map(plan => plan.CreateBy))];
    
    // Get users with their city information
    const users = await User.find({
      user_id: { $in: userIds },
      Status: true
    });

    // Group plan purchases by city
    const cityPlanCount = {};
    
    planPurchases.forEach(plan => {
      const user = users.find(u => u.user_id === plan.CreateBy);
      if (user && user.City_id) {
        const cityId = user.City_id;
        if (!cityPlanCount[cityId]) {
          cityPlanCount[cityId] = {
            City_id: cityId,
            count: 0,
            plans: []
          };
        }
        cityPlanCount[cityId].count++;
        cityPlanCount[cityId].plans.push({
          Admin_Plan_buy_Restaurant_id: plan.Admin_Plan_buy_Restaurant_id,
          Admin_Plan_id: plan.Admin_Plan_id,
          user_id: plan.CreateBy,
          expiry_date: plan.expiry_date,
          isActive: plan.isActive
        });
      }
    });

    // Get all city IDs that have plan purchases
    const cityIds = Object.keys(cityPlanCount).map(id => parseInt(id));
    
    // Fetch city details
    const cities = await City.find({
      City_id: { $in: cityIds },
      Status: true
    });

    // Create city map for quick lookup
    const cityMap = cities.reduce((map, city) => {
      map[city.City_id] = city;
      return map;
    }, {});

    // Build response data for heat map chart
    const heatMapData = Object.values(cityPlanCount).map(cityData => {
      const city = cityMap[cityData.City_id];
      return {
        City_id: cityData.City_id,
        City_name: city ? city.City_name : 'Unknown',
        City_code: city ? city.Code : null,
        PlanCount: cityData.count,
        Plans: cityData.plans
      };
    }).sort((a, b) => b.PlanCount - a.PlanCount); // Sort by count descending

    // Calculate total plans
    const totalPlans = planPurchases.length;
    const totalCities = heatMapData.length;

    res.status(200).json({
      success: true,
      message: 'Plan heat map by cities retrieved successfully',
      summary: {
        totalPlans: totalPlans,
        totalCities: totalCities,
        averagePlansPerCity: totalCities > 0 ? parseFloat((totalPlans / totalCities).toFixed(2)) : 0
      },
      count: heatMapData.length,
      data: heatMapData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plan heat map by cities',
      error: error.message
    });
  }
};

// Get Restaurant Subscription Purchased Details
const getRestaurantSubscriptionPurchased = async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const restaurantId = restaurant_id ? parseInt(restaurant_id) : req.user?.user_id;

    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    // Verify restaurant user exists
    const restaurantUser = await User.findOne({ user_id: restaurantId });
    if (!restaurantUser) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get all plan purchases for the restaurant (only successful payments)
    const planPurchases = await Admin_Plan_buy_Restaurant.find({
      CreateBy: restaurantId,
      paymentStatus: true,
      Status: true
    }).sort({ CreateAt: 1 });

    if (planPurchases.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No subscription found for this restaurant',
        data: {
          restaurant_id: restaurantId,
          CurrentPlan: null,
          PuchasedDate: null,
          RenewalDate: null,
          FirstPurchaseOn: null,
          NoofRenewals: 0
        }
      });
    }

    const firstPurchase = planPurchases[0];
    const currentPurchase = planPurchases[planPurchases.length - 1];
    const renewals = planPurchases.length - 1;

    // Get current plan details
    const currentPlan = await Admin_Plan.findOne({ Admin_Plan_id: currentPurchase.Admin_Plan_id });

    // Get transaction for first purchase
    let firstPurchaseDate = null;
    if (firstPurchase.Trangection_id) {
      const firstTransaction = await Transaction.findOne({ 
        transagtion_id: firstPurchase.Trangection_id 
      });
      if (firstTransaction && firstTransaction.status === 'success') {
        firstPurchaseDate = firstTransaction.transaction_date || firstPurchase.paymentSuccessDate || firstPurchase.CreateAt;
      }
    }
    if (!firstPurchaseDate) {
      firstPurchaseDate = firstPurchase.paymentSuccessDate || firstPurchase.CreateAt;
    }

    // Get transaction for current purchase
    let currentPurchaseDate = null;
    if (currentPurchase.Trangection_id) {
      const currentTransaction = await Transaction.findOne({ 
        transagtion_id: currentPurchase.Trangection_id 
      });
      if (currentTransaction && currentTransaction.status === 'success') {
        currentPurchaseDate = currentTransaction.transaction_date || currentPurchase.paymentSuccessDate || currentPurchase.CreateAt;
      }
    }
    if (!currentPurchaseDate) {
      currentPurchaseDate = currentPurchase.paymentSuccessDate || currentPurchase.CreateAt;
    }

    const subscriptionData = {
      restaurant_id: restaurantId,
      CurrentPlan: currentPlan ? {
        Admin_Plan_id: currentPlan.Admin_Plan_id,
        PlanName: currentPlan.PlanName,
        Description: currentPlan.Description,
        Price: currentPlan.Price
      } : null,
      PuchasedDate: currentPurchaseDate,
      RenewalDate: currentPurchase.expiry_date,
      FirstPurchaseOn: firstPurchaseDate,
      NoofRenewals: renewals
    };

    res.status(200).json({
      success: true,
      message: 'Restaurant subscription details retrieved successfully',
      data: subscriptionData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant subscription details',
      error: error.message
    });
  }
};

// Send Renewal Email with Subscription Details
const sendRenewalEmail = async (req, res) => {
  try {
    const { restaurant_id, email } = req.body;
    const restaurantId = restaurant_id ? parseInt(restaurant_id) : req.user?.user_id;

    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Verify restaurant user exists
    const restaurantUser = await User.findOne({ user_id: restaurantId });
    if (!restaurantUser) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get all plan purchases for the restaurant (only successful payments)
    const planPurchases = await Admin_Plan_buy_Restaurant.find({
      CreateBy: restaurantId,
      paymentStatus: true,
      Status: true
    }).sort({ CreateAt: 1 });

    if (planPurchases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this restaurant'
      });
    }

    const firstPurchase = planPurchases[0];
    const currentPurchase = planPurchases[planPurchases.length - 1];
    const renewals = planPurchases.length - 1;

    // Get current plan details
    const currentPlan = await Admin_Plan.findOne({ Admin_Plan_id: currentPurchase.Admin_Plan_id });

    // Get transaction for first purchase
    let firstPurchaseDate = null;
    if (firstPurchase.Trangection_id) {
      const firstTransaction = await Transaction.findOne({ 
        transagtion_id: firstPurchase.Trangection_id 
      });
      if (firstTransaction && firstTransaction.status === 'success') {
        firstPurchaseDate = firstTransaction.transaction_date || firstPurchase.paymentSuccessDate || firstPurchase.CreateAt;
      }
    }
    if (!firstPurchaseDate) {
      firstPurchaseDate = firstPurchase.paymentSuccessDate || firstPurchase.CreateAt;
    }

    // Get transaction for current purchase
    let currentPurchaseDate = null;
    if (currentPurchase.Trangection_id) {
      const currentTransaction = await Transaction.findOne({ 
        transagtion_id: currentPurchase.Trangection_id 
      });
      if (currentTransaction && currentTransaction.status === 'success') {
        currentPurchaseDate = currentTransaction.transaction_date || currentPurchase.paymentSuccessDate || currentPurchase.CreateAt;
      }
    }
    if (!currentPurchaseDate) {
      currentPurchaseDate = currentPurchase.paymentSuccessDate || currentPurchase.CreateAt;
    }

    // Prepare subscription details
    const subscriptionDetails = {
      CurrentPlan: currentPlan ? {
        PlanName: currentPlan.PlanName,
        Description: currentPlan.Description,
        Price: currentPlan.Price
      } : null,
      PuchasedDate: currentPurchaseDate,
      RenewalDate: currentPurchase.expiry_date,
      FirstPurchaseOn: firstPurchaseDate,
      NoofRenewals: renewals
    };

    // Format dates for email
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // Send renewal email
    const emailService = require('../utils/emailService');
    const emailResult = await emailService.sendRenewalEmail(
      email,
      restaurantUser.Name || 'Restaurant Owner',
      subscriptionDetails
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error sending renewal email',
        error: emailResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Renewal email sent successfully',
      data: {
        email: email,
        subscriptionDetails: subscriptionDetails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending renewal email',
      error: error.message
    });
  }
};

// Restaurant Subscription Renewal Alert
const RestaurantSubscriptionRenewalAlert = async (req, res) => {
  try {
    const now = new Date();
    // Get subscriptions expiring in next 30 days
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiringSubscriptions = await Admin_Plan_buy_Restaurant.find({
      paymentStatus: true,
      isActive: true,
      Status: true,
      expiry_date: { $gte: now, $lte: thirtyDaysFromNow }
    }).sort({ expiry_date: 1 });

    const list = await Promise.all(
      expiringSubscriptions.map(async (subscription) => {
        const restaurant = await User.findOne({ user_id: subscription.CreateBy });
        return {
          Restaurant_id: subscription.CreateBy,
          BusinessName: restaurant ? restaurant.Name : 'Unknown',
          RenewalDate: subscription.expiry_date
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Restaurant subscription renewal alerts retrieved successfully',
      count: list.length,
      data: { list }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription renewal alerts',
      error: error.message
    });
  }
};

// Restaurant Subscription List with City Chart
const RestaurantSubscriptionList = async (req, res) => {
  try {
    const subscriptions = await Admin_Plan_buy_Restaurant.find({
      paymentStatus: true,
      Status: true
    }).sort({ CreateAt: -1 });

    const userIds = [...new Set(subscriptions.map(s => s.CreateBy))];
    const restaurants = await User.find({
      user_id: { $in: userIds },
      Status: true
    });

    // Group by city
    const cityCounts = {};
    const citySubscriptions = {};

    restaurants.forEach(restaurant => {
      if (restaurant.City_id) {
        if (!cityCounts[restaurant.City_id]) {
          cityCounts[restaurant.City_id] = 0;
          citySubscriptions[restaurant.City_id] = [];
        }
        cityCounts[restaurant.City_id]++;
        const restaurantSubs = subscriptions.filter(s => s.CreateBy === restaurant.user_id);
        citySubscriptions[restaurant.City_id].push(...restaurantSubs);
      }
    });

    const cityIds = Object.keys(cityCounts).map(id => parseInt(id));
    const cities = await City.find({ City_id: { $in: cityIds }, Status: true });
    const cityMap = cities.reduce((map, city) => {
      map[city.City_id] = city;
      return map;
    }, {});

    const totalSubscriptions = subscriptions.length;
    const chart = Object.entries(cityCounts).map(([cityId, count]) => {
      const city = cityMap[parseInt(cityId)];
      const percentage = totalSubscriptions > 0 
        ? parseFloat(((count / totalSubscriptions) * 100).toFixed(2))
        : 0;
      return {
        City: city ? city.City_name : 'Unknown',
        RestaurantCount: count,
        Percentage: percentage
      };
    }).sort((a, b) => b.RestaurantCount - a.RestaurantCount);

    res.status(200).json({
      success: true,
      message: 'Restaurant subscription list with city chart retrieved successfully',
      data: {
        chart,
        totalSubscriptions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant subscription list',
      error: error.message
    });
  }
};

// Top Restaurant Performer
const TopRestaurantPerformer = async (req, res) => {
  try {
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    const Pos_Point_sales_Order = require('../models/Pos_Point_sales_Order.model');
    const Quick_Order = require('../models/Quick_Order.model');

    const performers = await Promise.all(
      restaurantUsers.map(async (restaurant) => {
        const restaurantId = restaurant.user_id;
        
        // Get POS orders
        const posOrders = await Pos_Point_sales_Order.find({
          Restaurant_id: restaurantId,
          Status: true
        });

        // Get employees
        const employees = await User.find({
          CreateBy: restaurantId,
          Status: true
        });
        const employeeIds = employees.map(e => e.user_id);

        // Get Quick orders
        const quickOrders = employeeIds.length > 0 
          ? await Quick_Order.find({
              get_order_Employee_id: { $in: employeeIds },
              Status: true
            })
          : [];

        const totalSales = [...posOrders, ...quickOrders].reduce(
          (sum, order) => sum + (order.Total || 0),
          0
        );

        // Get renewal date
        const activePlan = await Admin_Plan_buy_Restaurant.findOne({
          CreateBy: restaurantId,
          paymentStatus: true,
          isActive: true,
          Status: true
        }).sort({ expiry_date: -1 });

        return {
          Restaurant_id: restaurantId,
          CompanyName: restaurant.Name || 'Unknown',
          TotalSales: parseFloat(totalSales.toFixed(2)),
          RenewalDate: activePlan?.expiry_date || null
        };
      })
    );

    // Sort by TotalSales descending and return top 10
    const topPerformers = performers
      .filter(p => p.TotalSales > 0)
      .sort((a, b) => b.TotalSales - a.TotalSales)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      message: 'Top restaurant performers retrieved successfully',
      count: topPerformers.length,
      data: topPerformers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top restaurant performers',
      error: error.message
    });
  }
};

// Restaurant Bill History
const RestaurantBillHistory = async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const restaurantId = restaurant_id ? parseInt(restaurant_id) : req.user?.user_id;

    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant ID is required'
      });
    }

    const restaurant = await User.findOne({ user_id: restaurantId });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const client = await Clients.findOne({ CreateBy: restaurantId });
    const BusinessName = client ? client.Business_Name : restaurant.Name;

    // Get all plan purchases for this restaurant
    const planPurchases = await Admin_Plan_buy_Restaurant.find({
      CreateBy: restaurantId,
      paymentStatus: true,
      Status: true
    }).sort({ CreateAt: -1 });

    const DetialsBills = await Promise.all(
      planPurchases.map(async (planBuy) => {
        const [plan, transaction] = await Promise.all([
          Admin_Plan.findOne({ Admin_Plan_id: planBuy.Admin_Plan_id }),
          planBuy.Trangection_id ? Transaction.findOne({ transagtion_id: planBuy.Trangection_id }) : null
        ]);

        return {
          PlanPurchased: plan ? plan.PlanName : null,
          RenewalDate: planBuy.expiry_date,
          Transaction_id: planBuy.Trangection_id,
          Amount: transaction ? transaction.amount : null,
          PaymentDate: planBuy.paymentSuccessDate || planBuy.CreateAt,
          Status: planBuy.isActive ? 'Active' : 'Inactive'
        };
      })
    );

    // Get current active plan
    const activePlan = planPurchases.find(p => p.isActive && p.expiry_date > new Date());
    const currentPlan = activePlan ? await Admin_Plan.findOne({ Admin_Plan_id: activePlan.Admin_Plan_id }) : null;

    res.status(200).json({
      success: true,
      message: 'Restaurant bill history retrieved successfully',
      data: {
        Restaurant_id: restaurantId,
        BusinessName,
        PlanPurchased: currentPlan ? currentPlan.PlanName : null,
        RenewalDate: activePlan?.expiry_date || null,
        Transaction_id: activePlan?.Trangection_id || null,
        DetialsBills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant bill history',
      error: error.message
    });
  }
};

module.exports = {
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
};

