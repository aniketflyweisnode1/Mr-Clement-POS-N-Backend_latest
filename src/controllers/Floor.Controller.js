const Floor = require('../models/Floor.model');
const Floor_Type = require('../models/Floor_Type.model');
const User = require('../models/User.model');

// Create Floor
const createFloor = async (req, res) => {
  try {
    const { 
      Floor_Type_id, 
      Floor_Name, 
      Total_Table_Count, 
      'Seating-Persons_Count': seatingPersonsCount, 
      Details, 
      floor_width,
      floor_height,
      floor_image,
      Status 
    } = req.body;
    const userId = req.user.user_id;

    const floor = new Floor({
      Floor_Type_id,
      Floor_Name,
      Total_Table_Count,
      'Seating-Persons_Count': seatingPersonsCount,
      Details,
      floor_width,
      floor_height,
      floor_image,
      Status,
      CreateBy: userId
    });

    const savedFloor = await floor.save();
    
    res.status(201).json({
      success: true,
      message: 'Floor created successfully',
      data: savedFloor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating floor',
      error: error.message
    });
  }
};

// Update Floor
const updateFloor = async (req, res) => {
  try {
    const { 
      id, 
      Floor_Type_id, 
      Floor_Name, 
      Total_Table_Count, 
      'Seating-Persons_Count': seatingPersonsCount, 
      Details, 
      floor_width,
      floor_height,
      floor_image,
      Status 
    } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Floor ID is required in request body'
      });
    }

    const floor = await Floor.findOne({ Floor_id: parseInt(id) });
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    if (Floor_Type_id) floor.Floor_Type_id = Floor_Type_id;
    if (Floor_Name) floor.Floor_Name = Floor_Name;
    if (Total_Table_Count !== undefined) floor.Total_Table_Count = Total_Table_Count;
    if (seatingPersonsCount !== undefined) floor['Seating-Persons_Count'] = seatingPersonsCount;
    if (Details !== undefined) floor.Details = Details;
    if (floor_width !== undefined) floor.floor_width = floor_width;
    if (floor_height !== undefined) floor.floor_height = floor_height;
    if (floor_image !== undefined) floor.floor_image = floor_image;
    if (Status !== undefined) floor.Status = Status;
    
    floor.UpdatedBy = userId;
    floor.UpdatedAt = new Date();

    const updatedFloor = await floor.save();
    
    res.status(200).json({
      success: true,
      message: 'Floor updated successfully',
      data: updatedFloor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating floor',
      error: error.message
    });
  }
};

// Get Floor by ID
const getFloorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const floor = await Floor.findOne({ Floor_id: parseInt(id) });
    
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    // Manually fetch related data
    const [floorType, createByUser, updatedByUser] = await Promise.all([
      Floor_Type.findOne({ Floor_Type_id: floor.Floor_Type_id }),
      floor.CreateBy ? User.findOne({ user_id: floor.CreateBy }) : null,
      floor.UpdatedBy ? User.findOne({ user_id: floor.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const floorResponse = floor.toObject();
    floorResponse.Floor_Type_id = floorType ? { Floor_Type_id: floorType.Floor_Type_id, Floor_Type_Name: floorType.Floor_Type_Name, emozi: floorType.emozi } : null;
    floorResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    floorResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: floorResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor',
      error: error.message
    });
  }
};

// Get All Floors
const getAllFloors = async (req, res) => {
  try {
    const floors = await Floor.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all floors
    const floorsWithPopulatedData = await Promise.all(
      floors.map(async (floor) => {
        const [floorType, createByUser, updatedByUser] = await Promise.all([
          Floor_Type.findOne({ Floor_Type_id: floor.Floor_Type_id }),
          floor.CreateBy ? User.findOne({ user_id: floor.CreateBy }) : null,
          floor.UpdatedBy ? User.findOne({ user_id: floor.UpdatedBy }) : null
        ]);

        const floorResponse = floor.toObject();
        floorResponse.Floor_Type_id = floorType ? { Floor_Type_id: floorType.Floor_Type_id, Floor_Type_Name: floorType.Floor_Type_Name, emozi: floorType.emozi } : null;
        floorResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        floorResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return floorResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: floorsWithPopulatedData.length,
      data: floorsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floors',
      error: error.message
    });
  }
};

// Delete Floor
const deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const floor = await Floor.findOne({ Floor_id: parseInt(id) });
    
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    await Floor.deleteOne({ Floor_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Floor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting floor',
      error: error.message
    });
  }
};

// Get Floor by Auth (current logged in user)
const getFloorByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const floors = await Floor.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!floors || floors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Floors not found for current user'
      });
    }

    // Manually fetch related data for all floors
    const floorsResponse = await Promise.all(floors.map(async (floor) => {
      const [createByUser, updatedByUser] = await Promise.all([
        floor.CreateBy ? User.findOne({ user_id: floor.CreateBy }) : null,
        floor.UpdatedBy ? User.findOne({ user_id: floor.UpdatedBy }) : null
      ]);

      const floorObj = floor.toObject();
      floorObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      floorObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return floorObj;
    }));

    res.status(200).json({
      success: true,
      count: floorsResponse.length,
      data: floorsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floors',
      error: error.message
    });
  }
};

module.exports = {
  createFloor,
  updateFloor,
  getFloorById,
  getAllFloors,
  getFloorByAuth,
  deleteFloor
};
