const Admin_Message = require('../models/Admin_Message.model');
const Admin_MessageType = require('../models/Admin_MessageType.model');
const Admin_Plan_buy_Restaurant = require('../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../models/Admin_Plan.model');
const Transaction = require('../models/Transaction.model');
const User = require('../models/User.model');
const Admin_Message_with_client = require('../models/Admin_Message_with_client.model');

// Helper function to calculate SubscriptionDetails
const calculateSubscriptionDetails = async (userId) => {
  try {
    // Get all plan purchases for the user
    const planPurchases = await Admin_Plan_buy_Restaurant.find({
      CreateBy: userId,
      paymentStatus: true,
      Status: true
    }).sort({ CreateAt: 1 });

    if (planPurchases.length === 0) {
      return [{
        CurrentPlanId: null,
        PurchesedDate: null,
        RenewalDate: null,
        firstPurchesON: null,
        NoofRenewals: 0
      }];
    }

    const firstPurchase = planPurchases[0];
    const currentPurchase = planPurchases[planPurchases.length - 1];
    const renewals = planPurchases.length - 1;

    // Get transaction for first purchase
    let firstPurchaseDate = null;
    if (firstPurchase.Trangection_id) {
      const firstTransaction = await Transaction.findOne({ 
        transagtion_id: firstPurchase.Trangection_id 
      });
      if (firstTransaction && firstTransaction.status === 'success') {
        firstPurchaseDate = firstTransaction.transaction_date || firstPurchase.paymentSuccessDate;
      }
    }

    // Get transaction for current purchase
    let currentPurchaseDate = null;
    if (currentPurchase.Trangection_id) {
      const currentTransaction = await Transaction.findOne({ 
        transagtion_id: currentPurchase.Trangection_id 
      });
      if (currentTransaction && currentTransaction.status === 'success') {
        currentPurchaseDate = currentTransaction.transaction_date || currentPurchase.paymentSuccessDate;
      }
    }

    return [{
      CurrentPlanId: currentPurchase.Admin_Plan_id,
      PurchesedDate: currentPurchaseDate || currentPurchase.paymentSuccessDate || currentPurchase.CreateAt,
      RenewalDate: currentPurchase.expiry_date,
      firstPurchesON: firstPurchaseDate || firstPurchase.paymentSuccessDate || firstPurchase.CreateAt,
      NoofRenewals: renewals
    }];
  } catch (error) {
    console.error('Error calculating subscription details:', error);
    return [{
      CurrentPlanId: null,
      PurchesedDate: null,
      RenewalDate: null,
      firstPurchesON: null,
      NoofRenewals: 0
    }];
  }
};

// Helper function to calculate SchuduleDate based on match
const calculateSchuduleDate = (matchType, renewalDate = null) => {
  const now = new Date();
  let scheduleDate = new Date();

  // If renewalDate is provided, calculate relative to renewal date
  if (renewalDate) {
    const renewal = new Date(renewalDate);
    scheduleDate = new Date(renewal);

    switch (matchType) {
      case '2weeksago':
      case '2weeksbefore':
        scheduleDate.setDate(renewal.getDate() - 14);
        break;
      case '1weekago':
      case '1weekbefore':
        scheduleDate.setDate(renewal.getDate() - 7);
        break;
      case '1dayago':
      case '1daybefore':
        scheduleDate.setDate(renewal.getDate() - 1);
        break;
      default:
        scheduleDate = renewal;
    }
  } else {
    // Calculate relative to current date
    switch (matchType) {
      case '2weeksago':
        scheduleDate.setDate(now.getDate() - 14);
        break;
      case '1weekago':
        scheduleDate.setDate(now.getDate() - 7);
        break;
      case '1dayago':
        scheduleDate.setDate(now.getDate() - 1);
        break;
      default:
        scheduleDate = now;
    }
  }

  return scheduleDate;
};

// Create Admin Message
const createAdminMessage = async (req, res) => {
  try {
    const { Admin_MessageType, Message, user_id, SchuduleDate, matchType } = req.body;
    const userId = req.user.user_id;

    if (!Admin_MessageType) {
      return res.status(400).json({
        success: false,
        message: 'Admin_MessageType is required'
      });
    }

    if (!Message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Verify Admin_MessageType exists
    const messageType = await Admin_MessageType.findOne({ 
      Admin_MassageType_id: parseInt(Admin_MessageType) 
    });
    if (!messageType) {
      return res.status(404).json({
        success: false,
        message: 'Admin Message Type not found'
      });
    }

    // Verify user exists
    const user = await User.findOne({ user_id: parseInt(user_id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate SubscriptionDetails
    const subscriptionDetails = await calculateSubscriptionDetails(parseInt(user_id));
    const renewalDate = subscriptionDetails[0]?.RenewalDate || null;

    // Calculate SchuduleDate
    let calculatedSchuduleDate;
    if (SchuduleDate) {
      calculatedSchuduleDate = new Date(SchuduleDate);
    } else if (matchType) {
      calculatedSchuduleDate = calculateSchuduleDate(matchType, renewalDate);
    } else {
      calculatedSchuduleDate = new Date(); // Default to now
    }

    const adminMessage = new Admin_Message({
      Admin_MessageType: parseInt(Admin_MessageType),
      Message,
      user_id: parseInt(user_id),
      SubscriptionDetails: subscriptionDetails,
      SchuduleDate: calculatedSchuduleDate,
      Status: true,
      CreateBy: userId
    });

    const savedMessage = await adminMessage.save();

    // Fetch related data
    const [createByUser, updatedByUser, messageTypeData, userData] = await Promise.all([
      User.findOne({ user_id: savedMessage.CreateBy }),
      savedMessage.UpdatedBy ? User.findOne({ user_id: savedMessage.UpdatedBy }) : null,
      Admin_MessageType.findOne({ Admin_MassageType_id: savedMessage.Admin_MessageType }),
      User.findOne({ user_id: savedMessage.user_id })
    ]);

    const messageResponse = savedMessage.toObject();
    messageResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    messageResponse.Admin_MessageType = messageTypeData ? {
      Admin_MassageType_id: messageTypeData.Admin_MassageType_id,
      MessageType: messageTypeData.MessageType
    } : null;
    messageResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'Admin message created successfully',
      data: messageResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin message',
      error: error.message
    });
  }
};

// Update Admin Message
const updateAdminMessage = async (req, res) => {
  try {
    const { id, Admin_MessageType, Message, user_id, SchuduleDate, matchType, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin Message ID is required in request body'
      });
    }

    const adminMessage = await Admin_Message.findOne({ 
      Admin_Message_id: parseInt(id) 
    });

    if (!adminMessage) {
      return res.status(404).json({
        success: false,
        message: 'Admin message not found'
      });
    }

    if (Admin_MessageType !== undefined) {
      const messageType = await Admin_MessageType.findOne({ 
        Admin_MassageType_id: parseInt(Admin_MessageType) 
      });
      if (!messageType) {
        return res.status(404).json({
          success: false,
          message: 'Admin Message Type not found'
        });
      }
      adminMessage.Admin_MessageType = parseInt(Admin_MessageType);
    }

    if (Message !== undefined) adminMessage.Message = Message;
    if (user_id !== undefined) {
      const user = await User.findOne({ user_id: parseInt(user_id) });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      adminMessage.user_id = parseInt(user_id);
      // Recalculate SubscriptionDetails if user_id changes
      adminMessage.SubscriptionDetails = await calculateSubscriptionDetails(parseInt(user_id));
    }

    if (SchuduleDate !== undefined) {
      adminMessage.SchuduleDate = new Date(SchuduleDate);
    } else if (matchType !== undefined) {
      const renewalDate = adminMessage.SubscriptionDetails[0]?.RenewalDate || null;
      adminMessage.SchuduleDate = calculateSchuduleDate(matchType, renewalDate);
    }

    if (Status !== undefined) adminMessage.Status = Status;
    
    adminMessage.UpdatedBy = userId;
    adminMessage.UpdatedAt = new Date();

    const updatedMessage = await adminMessage.save();

    // Fetch related data
    const [createByUser, updatedByUser, messageTypeData, userData] = await Promise.all([
      User.findOne({ user_id: updatedMessage.CreateBy }),
      User.findOne({ user_id: updatedMessage.UpdatedBy }),
      Admin_MessageType.findOne({ Admin_MassageType_id: updatedMessage.Admin_MessageType }),
      User.findOne({ user_id: updatedMessage.user_id })
    ]);

    const messageResponse = updatedMessage.toObject();
    messageResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    messageResponse.Admin_MessageType = messageTypeData ? {
      Admin_MassageType_id: messageTypeData.Admin_MassageType_id,
      MessageType: messageTypeData.MessageType
    } : null;
    messageResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Admin message updated successfully',
      data: messageResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin message',
      error: error.message
    });
  }
};

// Get Admin Message by ID
const getAdminMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminMessage = await Admin_Message.findOne({ 
      Admin_Message_id: parseInt(id) 
    });

    if (!adminMessage) {
      return res.status(404).json({
        success: false,
        message: 'Admin message not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, messageTypeData, userData] = await Promise.all([
      User.findOne({ user_id: adminMessage.CreateBy }),
      adminMessage.UpdatedBy ? User.findOne({ user_id: adminMessage.UpdatedBy }) : null,
      Admin_MessageType.findOne({ Admin_MassageType_id: adminMessage.Admin_MessageType }),
      User.findOne({ user_id: adminMessage.user_id })
    ]);

    const messageResponse = adminMessage.toObject();
    messageResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    messageResponse.Admin_MessageType = messageTypeData ? {
      Admin_MassageType_id: messageTypeData.Admin_MassageType_id,
      MessageType: messageTypeData.MessageType
    } : null;
    messageResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;

    res.status(200).json({
      success: true,
      data: messageResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin message',
      error: error.message
    });
  }
};

// Get All Admin Messages
const getAllAdminMessages = async (req, res) => {
  try {
    const adminMessages = await Admin_Message.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all messages
    const messagesWithData = await Promise.all(
      adminMessages.map(async (message) => {
        const [createByUser, updatedByUser, messageTypeData, userData] = await Promise.all([
          User.findOne({ user_id: message.CreateBy }),
          message.UpdatedBy ? User.findOne({ user_id: message.UpdatedBy }) : null,
          Admin_MessageType.findOne({ Admin_MassageType_id: message.Admin_MessageType }),
          User.findOne({ user_id: message.user_id })
        ]);

        const messageResponse = message.toObject();
        messageResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        messageResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        messageResponse.Admin_MessageType = messageTypeData ? {
          Admin_MassageType_id: messageTypeData.Admin_MassageType_id,
          MessageType: messageTypeData.MessageType
        } : null;
        messageResponse.user_id = userData ? {
          user_id: userData.user_id,
          Name: userData.Name,
          email: userData.email
        } : null;

        return messageResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: messagesWithData.length,
      data: messagesWithData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin messages',
      error: error.message
    });
  }
};

// Get Admin Message by Auth (current logged in user)
const getAdminMessageByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find messages for the current user
    const adminMessages = await Admin_Message.find({ 
      user_id: userId,
      Status: true 
    }).sort({ CreateAt: -1 });

    if (adminMessages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin messages found for current user'
      });
    }

    // Fetch related data for all messages
    const messagesWithData = await Promise.all(
      adminMessages.map(async (message) => {
        const [createByUser, updatedByUser, messageTypeData] = await Promise.all([
          User.findOne({ user_id: message.CreateBy }),
          message.UpdatedBy ? User.findOne({ user_id: message.UpdatedBy }) : null,
          Admin_MessageType.findOne({ Admin_MassageType_id: message.Admin_MessageType })
        ]);

        const messageResponse = message.toObject();
        messageResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        messageResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        messageResponse.Admin_MessageType = messageTypeData ? {
          Admin_MassageType_id: messageTypeData.Admin_MassageType_id,
          MessageType: messageTypeData.MessageType
        } : null;

        return messageResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: messagesWithData.length,
      data: messagesWithData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin messages',
      error: error.message
    });
  }
};

// Delete Admin Message
const deleteAdminMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const adminMessage = await Admin_Message.findOne({ 
      Admin_Message_id: parseInt(id) 
    });

    if (!adminMessage) {
      return res.status(404).json({
        success: false,
        message: 'Admin message not found'
      });
    }

    await Admin_Message.deleteOne({ Admin_Message_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Admin message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin message',
      error: error.message
    });
  }
};

// Cronjob function to check SchuduleDate and create Admin_Message_with_client
const processScheduledMessages = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find messages where SchuduleDate matches today
    const scheduledMessages = await Admin_Message.find({
      SchuduleDate: {
        $gte: today,
        $lt: tomorrow
      },
      Status: true
    });

    for (const message of scheduledMessages) {
      // Check if message_with_client already exists for this message and user
      const existingMessage = await Admin_Message_with_client.findOne({
        message_id: message.Admin_Message_id,
        user_id: message.user_id,
        Status: true
      });

      if (!existingMessage) {
        // Get current time
        const currentTime = new Date();
        const timeString = currentTime.toTimeString().split(' ')[0]; // HH:MM:SS format

        // Create Admin_Message_with_client
        const messageWithClient = new Admin_Message_with_client({
          user_id: message.user_id,
          message_id: message.Admin_Message_id,
          Message: message.Message,
          SubscriptionDetails: message.SubscriptionDetails,
          date: currentTime,
          time: timeString,
          IsRead: false,
          Status: true,
          CreateBy: message.CreateBy
        });

        await messageWithClient.save();
        console.log(`Scheduled message ${message.Admin_Message_id} sent to user ${message.user_id}`);
      }
    }

    return {
      success: true,
      processed: scheduledMessages.length
    };
  } catch (error) {
    console.error('Error processing scheduled messages:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get 7 Day Renewal Messages for Plans
const get7DayRenewalMessages = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate 7 days from today
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    // Set time range for 7 days (6.5 to 7.5 days to account for time variations)
    const startDate = new Date(sevenDaysFromNow);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 1); // 6 days from now
    
    const endDate = new Date(sevenDaysFromNow);
    endDate.setHours(23, 59, 59, 999);
    endDate.setDate(endDate.getDate() + 1); // 8 days from now

    // Find all active plans with expiry_date within 7 days range
    const plansToRenew = await Admin_Plan_buy_Restaurant.find({
      expiry_date: {
        $gte: startDate,
        $lte: endDate
      },
      isActive: true,
      paymentStatus: true,
      Status: true
    }).sort({ expiry_date: 1 });

    if (plansToRenew.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No plans found for renewal in 7 days',
        count: 0,
        data: []
      });
    }

    // Get all unique user IDs
    const userIds = [...new Set(plansToRenew.map(plan => plan.CreateBy))];
    
    // Fetch users and admin plans
    const [users, adminPlans] = await Promise.all([
      User.find({ user_id: { $in: userIds } }),
      Admin_Plan.find({ Admin_Plan_id: { $in: plansToRenew.map(p => p.Admin_Plan_id) } })
    ]);

    // Create maps for quick lookup
    const userMap = users.reduce((map, user) => {
      map[user.user_id] = user;
      return map;
    }, {});

    const planMap = adminPlans.reduce((map, plan) => {
      map[plan.Admin_Plan_id] = plan;
      return map;
    }, {});

    // Process each plan and get subscription details
    const renewalMessages = await Promise.all(
      plansToRenew.map(async (plan) => {
        const user = userMap[plan.CreateBy];
        const adminPlan = planMap[plan.Admin_Plan_id];
        
        // Calculate subscription details for this user
        const subscriptionDetails = await calculateSubscriptionDetails(plan.CreateBy);
        
        // Calculate remaining days until renewal
        const expiryDate = new Date(plan.expiry_date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        const timeDiff = expiryDate - todayDate;
        const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        return {
          Admin_Plan_buy_Restaurant_id: plan.Admin_Plan_buy_Restaurant_id,
          user: user ? {
            user_id: user.user_id,
            Name: user.Name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone
          } : null,
          plan: adminPlan ? {
            Admin_Plan_id: adminPlan.Admin_Plan_id,
            PlanName: adminPlan.PlanName,
            Description: adminPlan.Description,
            Price: adminPlan.Price
          } : null,
          expiry_date: plan.expiry_date,
          remainingDays: remainingDays,
          paymentSuccessDate: plan.paymentSuccessDate,
          SubscriptionDetails: subscriptionDetails,
          renewalMessage: `Your plan "${adminPlan?.PlanName || 'N/A'}" will expire in ${remainingDays} day(s). Please renew to continue using our services.`
        };
      })
    );

    res.status(200).json({
      success: true,
      message: '7-day renewal messages retrieved successfully',
      count: renewalMessages.length,
      data: renewalMessages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching 7-day renewal messages',
      error: error.message
    });
  }
};

module.exports = {
  createAdminMessage,
  updateAdminMessage,
  getAdminMessageById,
  getAllAdminMessages,
  getAdminMessageByAuth,
  deleteAdminMessage,
  processScheduledMessages,
  get7DayRenewalMessages
};

