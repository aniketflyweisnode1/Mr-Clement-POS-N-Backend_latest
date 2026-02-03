const Restaurant_slot = require('../models/Restaurant_slot.model');
const User = require('../models/User.model');

// Create Restaurant Slot
const createRestaurantSlot = async (req, res) => {
  try {
    const { user_id, slots } = req.body;
    const userId = req.user.user_id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
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

    // Validate slots structure
    if (slots && !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: 'slots must be an array'
      });
    }

    // Validate each slot object
    if (slots) {
      for (const slotItem of slots) {
        if (!slotItem.day || typeof slotItem.day !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Each slot must have a valid day (string)'
          });
        }
        if (!Array.isArray(slotItem.slot)) {
          return res.status(400).json({
            success: false,
            message: 'Each slot must have a slot array'
          });
        }
        // Validate each slot time object
        for (const timeSlot of slotItem.slot) {
          if (typeof timeSlot !== 'object' || timeSlot === null) {
            return res.status(400).json({
              success: false,
              message: 'Each slot time must be an object with from and to properties'
            });
          }
          if (!timeSlot.from || typeof timeSlot.from !== 'string') {
            return res.status(400).json({
              success: false,
              message: 'Each slot time must have a from property (string)'
            });
          }
          if (!timeSlot.to || typeof timeSlot.to !== 'string') {
            return res.status(400).json({
              success: false,
              message: 'Each slot time must have a to property (string)'
            });
          }
        }
      }
    }

    const restaurantSlot = new Restaurant_slot({
      user_id: parseInt(user_id),
      slots: slots || [],
      Status: true,
      CreateBy: userId
    });

    const savedSlot = await restaurantSlot.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData] = await Promise.all([
      User.findOne({ user_id: savedSlot.CreateBy }),
      savedSlot.UpdatedBy ? User.findOne({ user_id: savedSlot.UpdatedBy }) : null,
      User.findOne({ user_id: savedSlot.user_id })
    ]);

    const slotResponse = savedSlot.toObject();
    slotResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    slotResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    slotResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'Restaurant slot created successfully',
      data: slotResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating restaurant slot',
      error: error.message
    });
  }
};

// Update Restaurant Slot
const updateRestaurantSlot = async (req, res) => {
  try {
    const { id, slots, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant Slot ID is required in request body'
      });
    }

    const restaurantSlot = await Restaurant_slot.findOne({ 
      Restaurant_slot_id: parseInt(id) 
    });

    if (!restaurantSlot) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant slot not found'
      });
    }

    // Validate slots structure if provided
    if (slots !== undefined) {
      if (!Array.isArray(slots)) {
        return res.status(400).json({
          success: false,
          message: 'slots must be an array'
        });
      }

      // Validate each slot object
      for (const slotItem of slots) {
        if (!slotItem.day || typeof slotItem.day !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Each slot must have a valid day (string)'
          });
        }
        if (!Array.isArray(slotItem.slot)) {
          return res.status(400).json({
            success: false,
            message: 'Each slot must have a slot array'
          });
        }
        // Validate each slot time object
        for (const timeSlot of slotItem.slot) {
          if (typeof timeSlot !== 'object' || timeSlot === null) {
            return res.status(400).json({
              success: false,
              message: 'Each slot time must be an object with from and to properties'
            });
          }
          if (!timeSlot.from || typeof timeSlot.from !== 'string') {
            return res.status(400).json({
              success: false,
              message: 'Each slot time must have a from property (string)'
            });
          }
          if (!timeSlot.to || typeof timeSlot.to !== 'string') {
            return res.status(400).json({
              success: false,
              message: 'Each slot time must have a to property (string)'
            });
          }
        }
      }

      restaurantSlot.slots = slots;
    }

    if (Status !== undefined) restaurantSlot.Status = Status;
    
    restaurantSlot.UpdatedBy = userId;
    restaurantSlot.UpdatedAt = new Date();

    const updatedSlot = await restaurantSlot.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData] = await Promise.all([
      User.findOne({ user_id: updatedSlot.CreateBy }),
      User.findOne({ user_id: updatedSlot.UpdatedBy }),
      User.findOne({ user_id: updatedSlot.user_id })
    ]);

    const slotResponse = updatedSlot.toObject();
    slotResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    slotResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    slotResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Restaurant slot updated successfully',
      data: slotResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant slot',
      error: error.message
    });
  }
};

// Get Restaurant Slot by ID
const getRestaurantSlotById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurantSlot = await Restaurant_slot.findOne({ 
      Restaurant_slot_id: parseInt(id) 
    });

    if (!restaurantSlot) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant slot not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, userData] = await Promise.all([
      User.findOne({ user_id: restaurantSlot.CreateBy }),
      restaurantSlot.UpdatedBy ? User.findOne({ user_id: restaurantSlot.UpdatedBy }) : null,
      User.findOne({ user_id: restaurantSlot.user_id })
    ]);

    const slotResponse = restaurantSlot.toObject();
    slotResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    slotResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    slotResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;

    res.status(200).json({
      success: true,
      data: slotResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant slot',
      error: error.message
    });
  }
};

// Get All Restaurant Slots
const getAllRestaurantSlots = async (req, res) => {
  try {
    const restaurantSlots = await Restaurant_slot.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all slots
    const slotsWithPopulatedData = await Promise.all(
      restaurantSlots.map(async (slot) => {
        const [createByUser, updatedByUser, userData] = await Promise.all([
          User.findOne({ user_id: slot.CreateBy }),
          slot.UpdatedBy ? User.findOne({ user_id: slot.UpdatedBy }) : null,
          User.findOne({ user_id: slot.user_id })
        ]);

        const slotResponse = slot.toObject();
        slotResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        slotResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        slotResponse.user_id = userData ? {
          user_id: userData.user_id,
          Name: userData.Name,
          email: userData.email
        } : null;

        return slotResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: slotsWithPopulatedData.length,
      data: slotsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant slots',
      error: error.message
    });
  }
};

// Get Restaurant Slot by Auth (current logged in user)
const getRestaurantSlotByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const restaurantSlot = await Restaurant_slot.findOne({ 
      user_id: userId,
      Status: true 
    });

    if (!restaurantSlot) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant slot not found for current user'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, userData] = await Promise.all([
      User.findOne({ user_id: restaurantSlot.CreateBy }),
      restaurantSlot.UpdatedBy ? User.findOne({ user_id: restaurantSlot.UpdatedBy }) : null,
      User.findOne({ user_id: restaurantSlot.user_id })
    ]);

    const slotResponse = restaurantSlot.toObject();
    slotResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    slotResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    slotResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;

    res.status(200).json({
      success: true,
      data: slotResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant slot',
      error: error.message
    });
  }
};

// Delete Restaurant Slot
const deleteRestaurantSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurantSlot = await Restaurant_slot.findOne({ 
      Restaurant_slot_id: parseInt(id) 
    });

    if (!restaurantSlot) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant slot not found'
      });
    }

    await Restaurant_slot.deleteOne({ Restaurant_slot_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Restaurant slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting restaurant slot',
      error: error.message
    });
  }
};

module.exports = {
  createRestaurantSlot,
  updateRestaurantSlot,
  getRestaurantSlotById,
  getAllRestaurantSlots,
  getRestaurantSlotByAuth,
  deleteRestaurantSlot
};

