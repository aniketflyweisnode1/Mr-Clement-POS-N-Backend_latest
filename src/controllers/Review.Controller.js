const Review = require('../models/Review.model');
const Review_Type = require('../models/Review_Type.model');

// Create Review
const createReview = async (req, res) => {
  try {
    const { Review_Type_id, Review_type, for_Review_id, ReviewStarCount } = req.body;
    const userId = req.user.user_id;

    if (!Review_Type_id || !Review_type || !for_Review_id || !ReviewStarCount) {
      return res.status(400).json({
        success: false,
        message: 'Review type ID, review content, for review ID, and star count are required'
      });
    }

    // Validate star count range
    if (ReviewStarCount < 1 || ReviewStarCount > 5) {
      return res.status(400).json({
        success: false,
        message: 'Star count must be between 1 and 5'
      });
    }

    // Check if review type exists
    const reviewType = await Review_Type.findOne({
      Review_type_id: Review_Type_id,
      Status: true
    });

    if (!reviewType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review type'
      });
    }

    // Check if review already exists for this item
    const existingReview = await Review.findOne({
      Review_Type_id: Review_Type_id,
      for_Review_id: for_Review_id,
      Status: true
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this item'
      });
    }

    const newReview = new Review({
      Review_Type_id,
      Review_type,
      for_Review_id,
      ReviewStarCount,
      CreateBy: userId,
      UpdatedBy: userId
    });

    const savedReview = await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: savedReview
    });

  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Review
const updateReview = async (req, res) => {
  try {
    const { Review_id, Review_Type_id, Review_type, ReviewStarCount } = req.body;
    const userId = req.user.user_id;

    if (!Review_id || !Review_Type_id || !Review_type || !ReviewStarCount) {
      return res.status(400).json({
        success: false,
        message: 'Review ID, review type ID, review content, and star count are required'
      });
    }

    // Validate star count range
    if (ReviewStarCount < 1 || ReviewStarCount > 5) {
      return res.status(400).json({
        success: false,
        message: 'Star count must be between 1 and 5'
      });
    }

    // Check if review exists
    const existingReview = await Review.findOne({
      Review_id: Review_id,
      Status: true
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review type exists
    const reviewType = await Review_Type.findOne({
      Review_type_id: Review_Type_id,
      Status: true
    });

    if (!reviewType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review type'
      });
    }

    const updatedReview = await Review.findOneAndUpdate(
      { Review_id: Review_id },
      {
        Review_Type_id,
        Review_type,
        ReviewStarCount,
        UpdatedBy: userId
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Review by ID
const getReviewById = async (req, res) => {
  try {
    const { Review_id } = req.params;

    if (!Review_id) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required'
      });
    }

    const review = await Review.findOne({
      Review_id: Review_id,
      Status: true
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Get related data manually
    const reviewTypeData = await Review_Type.findOne({ 
      Review_type_id: review.Review_Type_id, 
      Status: true 
    });

    // Create enhanced review object
    const enhancedReview = {
      ...review.toObject(),
      Review_Type_id: {
        Review_type_id: reviewTypeData?.Review_type_id,
        Review_type: reviewTypeData?.Review_type,
        ReviewFor: reviewTypeData?.ReviewFor
      }
    };

    res.status(200).json({
      success: true,
      message: 'Review retrieved successfully',
      data: enhancedReview
    });

  } catch (error) {
    console.error('Error in getReviewById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Reviews
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, Review_Type_id, for_Review_id, ReviewStarCount } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { Status: true };
    
    if (search) {
      query.Review_type = { $regex: search, $options: 'i' };
    }
    
    if (Review_Type_id) {
      query.Review_Type_id = Review_Type_id;
    }
    
    if (for_Review_id) {
      query.for_Review_id = for_Review_id;
    }
    
    if (ReviewStarCount) {
      query.ReviewStarCount = parseInt(ReviewStarCount);
    }

    const reviews = await Review.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get related data manually for each review
    const enhancedReviews = await Promise.all(reviews.map(async (review) => {
      const reviewTypeData = await Review_Type.findOne({ 
        Review_type_id: review.Review_Type_id, 
        Status: true 
      });

      return {
        ...review.toObject(),
        Review_Type_id: {
          Review_type_id: reviewTypeData?.Review_type_id,
          Review_type: reviewTypeData?.Review_type,
          ReviewFor: reviewTypeData?.ReviewFor
        }
      };
    }));

    const totalReviews = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews: enhancedReviews,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalReviews / limit),
          total_reviews: totalReviews,
          reviews_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Reviews by Review Type ID
const getReviewsByReviewTypeId = async (req, res) => {
  try {
    const { Review_Type_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!Review_Type_id) {
      return res.status(400).json({
        success: false,
        message: 'Review type ID is required'
      });
    }

    // Check if review type exists
    const reviewType = await Review_Type.findOne({
      Review_type_id: Review_Type_id,
      Status: true
    });

    if (!reviewType) {
      return res.status(404).json({
        success: false,
        message: 'Review type not found'
      });
    }

    const query = {
      Status: true,
      Review_Type_id: Review_Type_id
    };

    const reviews = await Review.find(query)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get related data manually for each review
    const enhancedReviews = await Promise.all(reviews.map(async (review) => {
      const reviewTypeData = await Review_Type.findOne({ 
        Review_type_id: review.Review_Type_id, 
        Status: true 
      });

      return {
        ...review.toObject(),
        Review_Type_id: {
          Review_type_id: reviewTypeData?.Review_type_id,
          Review_type: reviewTypeData?.Review_type,
          ReviewFor: reviewTypeData?.ReviewFor
        }
      };
    }));

    const totalReviews = await Review.countDocuments(query);

    if (totalReviews === 0) {
      return res.status(200).json({
        success: true,
        message: `No reviews found for review type ID ${Review_Type_id}`,
        data: {
          Review_Type_id: Review_Type_id,
          reviews: [],
          pagination: {
            current_page: parseInt(page),
            total_pages: 0,
            total_reviews: 0,
            reviews_per_page: parseInt(limit)
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Reviews for review type ID ${Review_Type_id} retrieved successfully`,
              data: {
          Review_Type_id: Review_Type_id,
          reviews: enhancedReviews,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(totalReviews / limit),
            total_reviews: totalReviews,
            reviews_per_page: parseInt(limit)
          }
        }
    });

  } catch (error) {
    console.error('Error in getReviewsByReviewTypeId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { Review_id } = req.params;
    
    const review = await Review.findOne({ Review_id: parseInt(Review_id) });
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await Review.deleteOne({ Review_id: parseInt(Review_id) });
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// Get Review by Auth (current logged in user)
const getReviewByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const reviews = await Review.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reviews not found for current user'
      });
    }

    // Manually fetch related data for all reviews
    const reviewsResponse = await Promise.all(reviews.map(async (review) => {
      const [createByUser, updatedByUser] = await Promise.all([
        review.CreateBy ? User.findOne({ user_id: review.CreateBy }) : null,
        review.UpdatedBy ? User.findOne({ user_id: review.UpdatedBy }) : null
      ]);

      const reviewObj = review.toObject();
      reviewObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      reviewObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return reviewObj;
    }));

    res.status(200).json({
      success: true,
      count: reviewsResponse.length,
      data: reviewsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  getReviewById,
  getAllReviews,
  getReviewsByReviewTypeId,
  getReviewByAuth,
  deleteReview
};
