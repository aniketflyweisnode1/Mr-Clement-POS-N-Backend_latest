const Store_details = require('../models/Store_details.model');
const User = require('../models/User.model');

// Create Store Details
const createStoreDetails = async (req, res) => {
  try {
    const {
      Store_img,
      address,
      email,
      phone,
      store_name,
      currency,
      QR_status,
      order_via_QR_status,
      feedback_collecting_status,
      Status
    } = req.body;

    const storeDetails = new Store_details({
      Store_img,
      address,
      email,
      phone,
      store_name,
      currency,
      QR_status,
      order_via_QR_status,
      feedback_collecting_status,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedStoreDetails = await storeDetails.save();
    
    // Manually fetch related data
    const createByUser = savedStoreDetails.CreateBy ? 
      await User.findOne({ user_id: savedStoreDetails.CreateBy }) : null;

    // Create response object with populated data
    const storeDetailsResponse = savedStoreDetails.toObject();
    storeDetailsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Store details created successfully',
      data: storeDetailsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating store details',
      error: error.message
    });
  }
};

// Update Store Details
const updateStoreDetails = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required in request body'
      });
    }

    const storeDetails = await Store_details.findOne({ Store_id: parseInt(id) });
    if (!storeDetails) {
      return res.status(404).json({
        success: false,
        message: 'Store details not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Store_id') {
        storeDetails[key] = updateData[key];
      }
    });

    storeDetails.UpdatedBy = userId;
    storeDetails.UpdatedAt = new Date();

    const updatedStoreDetails = await storeDetails.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedStoreDetails.CreateBy ? User.findOne({ user_id: updatedStoreDetails.CreateBy }) : null,
      updatedStoreDetails.UpdatedBy ? User.findOne({ user_id: updatedStoreDetails.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const storeDetailsResponse = updatedStoreDetails.toObject();
    storeDetailsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    storeDetailsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Store details updated successfully',
      data: storeDetailsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating store details',
      error: error.message
    });
  }
};

// Get Store Details by ID
const getStoreDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storeDetails = await Store_details.findOne({ Store_id: parseInt(id) });
    
    if (!storeDetails) {
      return res.status(404).json({
        success: false,
        message: 'Store details not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      storeDetails.CreateBy ? User.findOne({ user_id: storeDetails.CreateBy }) : null,
      storeDetails.UpdatedBy ? User.findOne({ user_id: storeDetails.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const storeDetailsResponse = storeDetails.toObject();
    storeDetailsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    storeDetailsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: storeDetailsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching store details',
      error: error.message
    });
  }
};

// Get All Store Details
const getAllStoreDetails = async (req, res) => {
  try {
    const storeDetailsList = await Store_details.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all store details
    const storeDetailsResponse = await Promise.all(storeDetailsList.map(async (storeDetails) => {
      const createByUser = storeDetails.CreateBy ? 
        await User.findOne({ user_id: storeDetails.CreateBy }) : null;

      const storeDetailsObj = storeDetails.toObject();
      storeDetailsObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return storeDetailsObj;
    }));

    res.status(200).json({
      success: true,
      count: storeDetailsResponse.length,
      data: storeDetailsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching store details',
      error: error.message
    });
  }
};

// Get Store Details by Auth (current logged in user)
const getStoreDetailsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const storeDetails = await Store_details.findOne({ CreateBy: userId });
    
    if (!storeDetails) {
      return res.status(404).json({
        success: false,
        message: 'Store details not found for current user'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      storeDetails.CreateBy ? User.findOne({ user_id: storeDetails.CreateBy }) : null,
      storeDetails.UpdatedBy ? User.findOne({ user_id: storeDetails.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const storeDetailsResponse = storeDetails.toObject();
    storeDetailsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    storeDetailsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: storeDetailsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching store details',
      error: error.message
    });
  }
};

// Delete Store Details
const deleteStoreDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storeDetails = await Store_details.findOne({ Store_id: parseInt(id) });
    
    if (!storeDetails) {
      return res.status(404).json({
        success: false,
        message: 'Store details not found'
      });
    }

    await Store_details.deleteOne({ Store_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Store details deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting store details',
      error: error.message
    });
  }
};

module.exports = {
  createStoreDetails,
  updateStoreDetails,
  getStoreDetailsById,
  getAllStoreDetails,
  getStoreDetailsByAuth,
  deleteStoreDetails
};
