const Feedback = require('../models/Feedback.model');
const Feedback_Type = require('../models/Feedback_Type.model');
const Quick_Order = require('../models/Quick_Order.model');
const Customer = require('../models/Customer.model');

// Create Feedback
const createFeedback = async (req, res) => {
  try {
    const { feedback_Type_id, feedback, order_id, Remarks } = req.body;
    const userId = req.user.user_id;

    if (!feedback_Type_id || !feedback || !order_id) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type ID, feedback content, and order ID are required'
      });
    }

    // Check if feedback type exists
    const feedbackType = await Feedback_Type.findOne({
      feedback_type_id: feedback_Type_id,
      Status: true
    });

    if (!feedbackType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type'
      });
    }

    // Check if order exists
    const order = await Quick_Order.findOne({
      Quick_Order_id: order_id,
      Status: true
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Check if feedback already exists for this order
    const existingFeedback = await Feedback.findOne({
      order_id: order_id,
      Status: true
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already exists for this order'
      });
    }

    const newFeedback = new Feedback({
      feedback_Type_id,
      feedback,
      Remarks,
      order_id,
      CreateBy: userId,
      UpdatedBy: userId
    });

    const savedFeedback = await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: savedFeedback
    });

  } catch (error) {
    console.error('Error in createFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Feedback
const updateFeedback = async (req, res) => {
  try {
    const { feedback_id, feedback_Type_id, feedback, Remarks } = req.body;
    const userId = req.user.user_id;

    if (!feedback_id || !feedback_Type_id || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback ID, feedback type ID, and feedback content are required'
      });
    }

    // Check if feedback exists
    const existingFeedback = await Feedback.findOne({
      feedback_id: feedback_id,
      Status: true
    });

    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if feedback type exists
    const feedbackType = await Feedback_Type.findOne({
      feedback_type_id: feedback_Type_id,
      Status: true
    });

    if (!feedbackType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type'
      });
    }

    const updatedFeedback = await Feedback.findOneAndUpdate(
      { feedback_id: feedback_id },
      {
        feedback_Type_id,
        feedback,
        Remarks,
        UpdatedBy: userId
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback
    });

  } catch (error) {
    console.error('Error in updateFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Feedback by ID
const getFeedbackById = async (req, res) => {
  try {
    const { feedback_id } = req.params;

    if (!feedback_id) {
      return res.status(400).json({
        success: false,
        message: 'Feedback ID is required'
      });
    }

    const feedback = await Feedback.findOne({
      feedback_id: feedback_id,
      Status: true
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Get related data manually
    const [feedbackTypeData, orderData] = await Promise.all([
      Feedback_Type.findOne({ feedback_type_id: feedback.feedback_Type_id, Status: true }),
      Quick_Order.findOne({ Quick_Order_id: feedback.order_id, Status: true })
    ]);

    // Get client name from Customer model using client_mobile_no
    let clientName = null;
    if (orderData && orderData.client_mobile_no) {
      const customer = await Customer.findOne({ 
        phone: orderData.client_mobile_no, 
        Status: true 
      });
      clientName = customer ? customer.Name : null;
    }

    // Create enhanced feedback object
    const enhancedFeedback = {
      ...feedback.toObject(),
      feedback_Type_id: {
        feedback_type_id: feedbackTypeData?.feedback_type_id,
        feedback_type: feedbackTypeData?.feedback_type
      },
      order_id: {
        Quick_Order_id: orderData?.Quick_Order_id,
        client_mobile_no: orderData?.client_mobile_no,
        client_name: clientName
      }
    };

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: enhancedFeedback
    });

  } catch (error) {
    console.error('Error in getFeedbackById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Feedbacks
const getAllFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, feedback_type_id, order_id } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { Status: true };
    
    if (search) {
      query.feedback = { $regex: search, $options: 'i' };
    }
    
    if (feedback_type_id) {
      query.feedback_Type_id = feedback_type_id;
    }
    
    if (order_id) {
      query.order_id = order_id;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get related data manually for each feedback
    const enhancedFeedbacks = await Promise.all(feedbacks.map(async (feedback) => {
      const [feedbackTypeData, orderData] = await Promise.all([
        Feedback_Type.findOne({ feedback_type_id: feedback.feedback_Type_id, Status: true }),
        Quick_Order.findOne({ Quick_Order_id: feedback.order_id, Status: true })
      ]);

      // Get client name from Customer model using client_mobile_no
      let clientName = null;
      if (orderData && orderData.client_mobile_no) {
        const customer = await Customer.findOne({ 
          phone: orderData.client_mobile_no, 
          Status: true 
        });
        clientName = customer ? customer.Name : null;
      }

      return {
        ...feedback.toObject(),
        feedback_Type_id: {
          feedback_type_id: feedbackTypeData?.feedback_type_id,
          feedback_type: feedbackTypeData?.feedback_type
        },
        order_id: {
          Quick_Order_id: orderData?.Quick_Order_id,
          client_mobile_no: orderData?.client_mobile_no,
          client_name: clientName
        }
      };
    }));

    const totalFeedbacks = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Feedbacks retrieved successfully',
      data: {
        feedbacks: enhancedFeedbacks,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalFeedbacks / limit),
          total_feedbacks: totalFeedbacks,
          feedbacks_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllFeedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Feedback by Order ID
const getFeedbackByOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Check if order exists
    const order = await Quick_Order.findOne({
      Quick_Order_id: order_id,
      Status: true
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const query = {
      Status: true,
      order_id: order_id
    };

    const feedbacks = await Feedback.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get related data manually for each feedback
    const enhancedFeedbacks = await Promise.all(feedbacks.map(async (feedback) => {
      const [feedbackTypeData, orderData] = await Promise.all([
        Feedback_Type.findOne({ feedback_type_id: feedback.feedback_Type_id, Status: true }),
        Quick_Order.findOne({ Quick_Order_id: feedback.order_id, Status: true })
      ]);

      // Get client name from Customer model using client_mobile_no
      let clientName = null;
      if (orderData && orderData.client_mobile_no) {
        const customer = await Customer.findOne({ 
          phone: orderData.client_mobile_no, 
          Status: true 
        });
        clientName = customer ? customer.Name : null;
      }

      return {
        ...feedback.toObject(),
        feedback_Type_id: {
          feedback_type_id: feedbackTypeData?.feedback_type_id,
          feedback_type: feedbackTypeData?.feedback_type
        },
        order_id: {
          Quick_Order_id: orderData?.Quick_Order_id,
          client_mobile_no: orderData?.client_mobile_no,
          client_name: clientName
        }
      };
    }));

    const totalFeedbacks = await Feedback.countDocuments(query);

    if (totalFeedbacks === 0) {
      return res.status(200).json({
        success: true,
        message: `No feedback found for order ID ${order_id}`,
        data: {
          order_id: order_id,
          feedbacks: [],
          pagination: {
            current_page: parseInt(page),
            total_pages: 0,
            total_feedbacks: 0,
            feedbacks_per_page: parseInt(limit)
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Feedback for order ID ${order_id} retrieved successfully`,
      data: {
        order_id: order_id,
        feedbacks: enhancedFeedbacks,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalFeedbacks / limit),
          total_feedbacks: totalFeedbacks,
          feedbacks_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getFeedbackByOrderId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Feedback
const deleteFeedback = async (req, res) => {
  try {
    const { feedback_id } = req.params;
    
    const feedback = await Feedback.findOne({ feedback_id: parseInt(feedback_id) });
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await Feedback.deleteOne({ feedback_id: parseInt(feedback_id) });
    
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};

// Get Feedback by Auth (current logged in user)
const getFeedbackByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const feedbacks = await Feedback.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedbacks not found for current user'
      });
    }

    // Manually fetch related data for all feedbacks
    const feedbacksResponse = await Promise.all(feedbacks.map(async (feedback) => {
      const [createByUser, updatedByUser] = await Promise.all([
        feedback.CreateBy ? User.findOne({ user_id: feedback.CreateBy }) : null,
        feedback.UpdatedBy ? User.findOne({ user_id: feedback.UpdatedBy }) : null
      ]);

      const feedbackObj = feedback.toObject();
      feedbackObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      feedbackObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return feedbackObj;
    }));

    res.status(200).json({
      success: true,
      count: feedbacksResponse.length,
      data: feedbacksResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
};

module.exports = {
  createFeedback,
  updateFeedback,
  getFeedbackById,
  getAllFeedbacks,
  getFeedbackByOrderId,
  getFeedbackByAuth,
  deleteFeedback
};
