const Responsibility = require('../models/Responsibility.model');
const User = require('../models/User.model');

// Create Responsibility
const createResponsibility = async (req, res) => {
  try {
    const { Responsibility_name } = req.body;
    const userId = req.user?.user_id || 1; // From auth middleware

    const responsibility = new Responsibility({
      Responsibility_name,
      CreateBy: userId
    });

    const savedResponsibility = await responsibility.save();
    
    res.status(201).json({
      success: true,
      message: 'Responsibility created successfully',
      data: savedResponsibility
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating responsibility',
      error: error.message
    });
  }
};

// Update Responsibility
const updateResponsibility = async (req, res) => {
  try {
    const { id, Responsibility_name, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Responsibility ID is required in request body'
      });
    }

    const responsibility = await Responsibility.findOne({ Responsibility_id: parseInt(id) });
    if (!responsibility) {
      return res.status(404).json({
        success: false,
        message: 'Responsibility not found'
      });
    }

    responsibility.Responsibility_name = Responsibility_name || responsibility.Responsibility_name;
    responsibility.Status = Status !== undefined ? Status : responsibility.Status;
    responsibility.UpdatedBy = userId;
    responsibility.UpdatedAt = new Date();

    const updatedResponsibility = await responsibility.save();
    
    res.status(200).json({
      success: true,
      message: 'Responsibility updated successfully',
      data: updatedResponsibility
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating responsibility',
      error: error.message
    });
  }
};

// Get Responsibility by ID
const getResponsibilityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const responsibility = await Responsibility.findOne({ Responsibility_id: parseInt(id) });
    
    if (!responsibility) {
      return res.status(404).json({
        success: false,
        message: 'Responsibility not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      responsibility.CreateBy ? User.findOne({ user_id: responsibility.CreateBy }) : null,
      responsibility.UpdatedBy ? User.findOne({ user_id: responsibility.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const responsibilityResponse = responsibility.toObject();
    responsibilityResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    responsibilityResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: responsibilityResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching responsibility',
      error: error.message
    });
  }
};

// Get All Responsibilities
const getAllResponsibilities = async (req, res) => {
  try {
    const responsibilities = await Responsibility.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all responsibilities
    const responsibilitiesWithPopulatedData = await Promise.all(
      responsibilities.map(async (responsibility) => {
        const [createByUser, updatedByUser] = await Promise.all([
          responsibility.CreateBy ? User.findOne({ user_id: responsibility.CreateBy }) : null,
          responsibility.UpdatedBy ? User.findOne({ user_id: responsibility.UpdatedBy }) : null
        ]);

        const responsibilityResponse = responsibility.toObject();
        responsibilityResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        responsibilityResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return responsibilityResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: responsibilitiesWithPopulatedData.length,
      data: responsibilitiesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching responsibilities',
      error: error.message
    });
  }
};

// Delete Responsibility
const deleteResponsibility = async (req, res) => {
  try {
    const { id } = req.params;
    
    const responsibility = await Responsibility.findOne({ Responsibility_id: parseInt(id) });
    
    if (!responsibility) {
      return res.status(404).json({
        success: false,
        message: 'Responsibility not found'
      });
    }

    await Responsibility.deleteOne({ Responsibility_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Responsibility deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting responsibility',
      error: error.message
    });
  }
};

// Get Responsibility by Auth (current logged in user)
const getResponsibilityByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const responsibilities = await Responsibility.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!responsibilities || responsibilities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Responsibilities not found for current user'
      });
    }

    // Manually fetch related data for all responsibilities
    const responsibilitiesResponse = await Promise.all(responsibilities.map(async (responsibility) => {
      const [createByUser, updatedByUser] = await Promise.all([
        responsibility.CreateBy ? User.findOne({ user_id: responsibility.CreateBy }) : null,
        responsibility.UpdatedBy ? User.findOne({ user_id: responsibility.UpdatedBy }) : null
      ]);

      const responsibilityObj = responsibility.toObject();
      responsibilityObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      responsibilityObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return responsibilityObj;
    }));

    res.status(200).json({
      success: true,
      count: responsibilitiesResponse.length,
      data: responsibilitiesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching responsibilities',
      error: error.message
    });
  }
};

module.exports = {
  createResponsibility,
  updateResponsibility,
  getResponsibilityById,
  getAllResponsibilities,
  getResponsibilityByAuth,
  deleteResponsibility
};
