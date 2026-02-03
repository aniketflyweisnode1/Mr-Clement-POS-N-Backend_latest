const Review_Type = require('../models/Review_Type.model');

// Create Review Type
const createReviewType = async (req, res) => {
  try {
    const { Review_type, ReviewFor } = req.body;
    const userId = req.user.user_id;

    if (!Review_type || !ReviewFor) {
      return res.status(400).json({
        success: false,
        message: 'Review type and ReviewFor are required'
      });
    }

    // Validate ReviewFor enum values
    const validReviewFor = ['order', 'user', 'table', 'Restorent'];
    if (!validReviewFor.includes(ReviewFor)) {
      return res.status(400).json({
        success: false,
        message: 'ReviewFor must be one of: order, user, table, Restorent'
      });
    }

    // Check if review type already exists
    const existingReviewType = await Review_Type.findOne({
      Review_type: Review_type,
      ReviewFor: ReviewFor,
      Status: true
    });

    if (existingReviewType) {
      return res.status(400).json({
        success: false,
        message: 'Review type already exists for this category'
      });
    }

    const reviewType = new Review_Type({
      Review_type,
      ReviewFor,
      CreateBy: userId,
      UpdatedBy: userId
    });

    const savedReviewType = await reviewType.save();

    res.status(201).json({
      success: true,
      message: 'Review type created successfully',
      data: savedReviewType
    });

  } catch (error) {
    console.error('Error in createReviewType:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Review Type
const updateReviewType = async (req, res) => {
  try {
    const { Review_type_id, Review_type, ReviewFor } = req.body;
    const userId = req.user.user_id;

    if (!Review_type_id || !Review_type || !ReviewFor) {
      return res.status(400).json({
        success: false,
        message: 'Review type ID, review type, and ReviewFor are required'
      });
    }

    // Validate ReviewFor enum values
    const validReviewFor = ['order', 'user', 'table', 'Restorent'];
    if (!validReviewFor.includes(ReviewFor)) {
      return res.status(400).json({
        success: false,
        message: 'ReviewFor must be one of: order, user, table, Restorent'
      });
    }

    // Check if review type exists
    const existingReviewType = await Review_Type.findOne({
      Review_type_id: Review_type_id,
      Status: true
    });

    if (!existingReviewType) {
      return res.status(404).json({
        success: false,
        message: 'Review type not found'
      });
    }

    // Check if new review type name already exists for the same category (excluding current one)
    const duplicateReviewType = await Review_Type.findOne({
      Review_type: Review_type,
      ReviewFor: ReviewFor,
      Status: true,
      Review_type_id: { $ne: Review_type_id }
    });

    if (duplicateReviewType) {
      return res.status(400).json({
        success: false,
        message: 'Review type name already exists for this category'
      });
    }

    const updatedReviewType = await Review_Type.findOneAndUpdate(
      { Review_type_id: Review_type_id },
      {
        Review_type,
        ReviewFor,
        UpdatedBy: userId
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Review type updated successfully',
      data: updatedReviewType
    });

  } catch (error) {
    console.error('Error in updateReviewType:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Review Type by ID
const getReviewTypeById = async (req, res) => {
  try {
    const { Review_type_id } = req.params;

    if (!Review_type_id) {
      return res.status(400).json({
        success: false,
        message: 'Review type ID is required'
      });
    }

    const reviewType = await Review_Type.findOne({
      Review_type_id: Review_type_id,
      Status: true
    });

    if (!reviewType) {
      return res.status(404).json({
        success: false,
        message: 'Review type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review type retrieved successfully',
      data: reviewType
    });

  } catch (error) {
    console.error('Error in getReviewTypeById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Review Types
const getAllReviewTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ReviewFor } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { Status: true };
    
    if (search) {
      query.Review_type = { $regex: search, $options: 'i' };
    }
    
    if (ReviewFor) {
      query.ReviewFor = ReviewFor;
    }

    const reviewTypes = await Review_Type.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviewTypes = await Review_Type.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Review types retrieved successfully',
      data: {
        review_types: reviewTypes,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalReviewTypes / limit),
          total_review_types: totalReviewTypes,
          review_types_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllReviewTypes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Review Types by Auth User
const getReviewTypesByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviewTypes = await Review_Type.find({
      Status: true,
      $or: [
        { CreateBy: userId },
        { UpdatedBy: userId }
      ]
    })
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviewTypes = await Review_Type.countDocuments({
      Status: true,
      $or: [
        { CreateBy: userId },
        { UpdatedBy: userId }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Review types by auth user retrieved successfully',
      data: {
        review_types: reviewTypes,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalReviewTypes / limit),
          total_review_types: totalReviewTypes,
          review_types_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getReviewTypesByAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Review Type
const deleteReviewType = async (req, res) => {
  try {
    const { Review_type_id } = req.params;
    
    const reviewType = await Review_Type.findOne({ Review_type_id: parseInt(Review_type_id) });
    
    if (!reviewType) {
      return res.status(404).json({
        success: false,
        message: 'Review type not found'
      });
    }

    await Review_Type.deleteOne({ Review_type_id: parseInt(Review_type_id) });
    
    res.status(200).json({
      success: true,
      message: 'Review type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review type',
      error: error.message
    });
  }
};

module.exports = {
  createReviewType,
  updateReviewType,
  getReviewTypeById,
  getAllReviewTypes,
  getReviewTypesByAuth,
  deleteReviewType
};
