const Floor_Type = require('../models/Floor_Type.model');
const User = require('../models/User.model');

// Create Floor_Type
const createFloorType = async (req, res) => {
  try {
    const { emozi, Floor_image, Floor_Type_Name, Details, Status } = req.body;
    const userId = req.user.user_id;

    const floorType = new Floor_Type({
      emozi,
      Floor_image,
      Floor_Type_Name,
      Details,
      Status,
      CreateBy: userId
    });

    const savedFloorType = await floorType.save();
    
    res.status(201).json({
      success: true,
      message: 'Floor type created successfully',
      data: savedFloorType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating floor type',
      error: error.message
    });
  }
};

// Update Floor_Type
const updateFloorType = async (req, res) => {
  try {
    const { id, emozi, Floor_image, Floor_Type_Name, Details, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Floor type ID is required in request body'
      });
    }

    const floorType = await Floor_Type.findOne({ Floor_Type_id: parseInt(id) });
    if (!floorType) {
      return res.status(404).json({
        success: false,
        message: 'Floor type not found'
      });
    }

    if (emozi) floorType.emozi = emozi;
    if (Floor_image !== undefined) floorType.Floor_image = Floor_image;
    if (Floor_Type_Name) floorType.Floor_Type_Name = Floor_Type_Name;
    if (Details !== undefined) floorType.Details = Details;
    if (Status !== undefined) floorType.Status = Status;
    
    floorType.UpdatedBy = userId;
    floorType.UpdatedAt = new Date();

    const updatedFloorType = await floorType.save();
    
    res.status(200).json({
      success: true,
      message: 'Floor type updated successfully',
      data: updatedFloorType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating floor type',
      error: error.message
    });
  }
};

// Get Floor_Type by ID
const getFloorTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const floorType = await Floor_Type.findOne({ Floor_Type_id: parseInt(id) });
    
    if (!floorType) {
      return res.status(404).json({
        success: false,
        message: 'Floor type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      floorType.CreateBy ? User.findOne({ user_id: floorType.CreateBy }) : null,
      floorType.UpdatedBy ? User.findOne({ user_id: floorType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const floorTypeResponse = floorType.toObject();
    floorTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    floorTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: floorTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor type',
      error: error.message
    });
  }
};

// Get All Floor_Type
const getAllFloorTypes = async (req, res) => {
  try {
    const floorTypes = await Floor_Type.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all floor types
    const floorTypesWithPopulatedData = await Promise.all(
      floorTypes.map(async (floorType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          floorType.CreateBy ? User.findOne({ user_id: floorType.CreateBy }) : null,
          floorType.UpdatedBy ? User.findOne({ user_id: floorType.UpdatedBy }) : null
        ]);

        const floorTypeResponse = floorType.toObject();
        floorTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        floorTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return floorTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: floorTypesWithPopulatedData.length,
      data: floorTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor types',
      error: error.message
    });
  }
};

// Delete Floor Type
const deleteFloorType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const floorType = await Floor_Type.findOne({ Floor_Type_id: parseInt(id) });
    
    if (!floorType) {
      return res.status(404).json({
        success: false,
        message: 'Floor type not found'
      });
    }

    await Floor_Type.deleteOne({ Floor_Type_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Floor type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting floor type',
      error: error.message
    });
  }
};

// Get Floor Type by Auth (current logged in user)
const getFloorTypeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const floorTypes = await Floor_Type.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!floorTypes || floorTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Floor types not found for current user'
      });
    }

    // Manually fetch related data for all floor types
    const floorTypesResponse = await Promise.all(floorTypes.map(async (floorType) => {
      const [createByUser, updatedByUser] = await Promise.all([
        floorType.CreateBy ? User.findOne({ user_id: floorType.CreateBy }) : null,
        floorType.UpdatedBy ? User.findOne({ user_id: floorType.UpdatedBy }) : null
      ]);

      const floorTypeObj = floorType.toObject();
      floorTypeObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      floorTypeObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return floorTypeObj;
    }));

    res.status(200).json({
      success: true,
      count: floorTypesResponse.length,
      data: floorTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor types',
      error: error.message
    });
  }
};

module.exports = {
  createFloorType,
  updateFloorType,
  getFloorTypeById,
  getAllFloorTypes,
  getFloorTypeByAuth,
  deleteFloorType
};
