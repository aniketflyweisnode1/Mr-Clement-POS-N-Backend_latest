const Feedback_Type = require('../models/Feedback_Type.model');

// Create Feedback Type
const createFeedbackType = async (req, res) => {
  try {
    const { feedback_type } = req.body;
    const userId = req.user.user_id;

    if (!feedback_type) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type is required'
      });
    }

    // Check if feedback type already exists
    const existingFeedbackType = await Feedback_Type.findOne({
      feedback_type: feedback_type,
      Status: true
    });

    if (existingFeedbackType) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type already exists'
      });
    }

    const feedbackType = new Feedback_Type({
      feedback_type,
      CreateBy: userId,
      UpdatedBy: userId
    });

    const savedFeedbackType = await feedbackType.save();

    res.status(201).json({
      success: true,
      message: 'Feedback type created successfully',
      data: savedFeedbackType
    });

  } catch (error) {
    console.error('Error in createFeedbackType:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Feedback Type
const updateFeedbackType = async (req, res) => {
  try {
    const { feedback_type_id, feedback_type } = req.body;
    const userId = req.user.user_id;

    if (!feedback_type_id || !feedback_type) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type ID and feedback type are required'
      });
    }

    // Check if feedback type exists
    const existingFeedbackType = await Feedback_Type.findOne({
      feedback_type_id: feedback_type_id,
      Status: true
    });

    if (!existingFeedbackType) {
      return res.status(404).json({
        success: false,
        message: 'Feedback type not found'
      });
    }

    // Check if new feedback type name already exists (excluding current one)
    const duplicateFeedbackType = await Feedback_Type.findOne({
      feedback_type: feedback_type,
      Status: true,
      feedback_type_id: { $ne: feedback_type_id }
    });

    if (duplicateFeedbackType) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type name already exists'
      });
    }

    const updatedFeedbackType = await Feedback_Type.findOneAndUpdate(
      { feedback_type_id: feedback_type_id },
      {
        feedback_type,
        UpdatedBy: userId
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Feedback type updated successfully',
      data: updatedFeedbackType
    });

  } catch (error) {
    console.error('Error in updateFeedbackType:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Feedback Type by ID
const getFeedbackTypeById = async (req, res) => {
  try {
    const { feedback_type_id } = req.params;

    if (!feedback_type_id) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type ID is required'
      });
    }

    const feedbackType = await Feedback_Type.findOne({
      feedback_type_id: feedback_type_id,
      Status: true
    });

    if (!feedbackType) {
      return res.status(404).json({
        success: false,
        message: 'Feedback type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback type retrieved successfully',
      data: feedbackType
    });

  } catch (error) {
    console.error('Error in getFeedbackTypeById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Feedback Types
const getAllFeedbackTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { Status: true };
    if (search) {
      query.feedback_type = { $regex: search, $options: 'i' };
    }

    const feedbackTypes = await Feedback_Type.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalFeedbackTypes = await Feedback_Type.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Feedback types retrieved successfully',
      data: {
        feedback_types: feedbackTypes,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalFeedbackTypes / limit),
          total_feedback_types: totalFeedbackTypes,
          feedback_types_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllFeedbackTypes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Feedback Types by Auth User
const getFeedbackTypesByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const feedbackTypes = await Feedback_Type.find({
      Status: true,
      $or: [
        { CreateBy: userId },
        { UpdatedBy: userId }
      ]
    })
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalFeedbackTypes = await Feedback_Type.countDocuments({
      Status: true,
      $or: [
        { CreateBy: userId },
        { UpdatedBy: userId }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Feedback types by auth user retrieved successfully',
      data: {
        feedback_types: feedbackTypes,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalFeedbackTypes / limit),
          total_feedback_types: totalFeedbackTypes,
          feedback_types_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getFeedbackTypesByAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Feedback Type
const deleteFeedbackType = async (req, res) => {
  try {
    const { feedback_type_id } = req.params;
    
    const feedbackType = await Feedback_Type.findOne({ feedback_type_id: parseInt(feedback_type_id) });
    
    if (!feedbackType) {
      return res.status(404).json({
        success: false,
        message: 'Feedback type not found'
      });
    }

    await Feedback_Type.deleteOne({ feedback_type_id: parseInt(feedback_type_id) });
    
    res.status(200).json({
      success: true,
      message: 'Feedback type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback type',
      error: error.message
    });
  }
};

module.exports = {
  createFeedbackType,
  updateFeedbackType,
  getFeedbackTypeById,
  getAllFeedbackTypes,
  getFeedbackTypesByAuth,
  deleteFeedbackType
};
