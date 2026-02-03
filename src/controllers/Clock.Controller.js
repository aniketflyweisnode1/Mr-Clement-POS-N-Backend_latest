const Clock = require('../models/Clock.model');
const User = require('../models/User.model');

// Create Clock
const createClock = async (req, res) => {
  try {
    const { date, in_time, out_time, user_id, Status } = req.body;
    const userId = req.user.user_id;

    const clock = new Clock({
      date: date || new Date(),
      in_time: in_time || new Date(),
      out_time: out_time || null,
      user_id: user_id,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedClock = await clock.save();
    
    // Fetch creator and user details
    const [createByUser, clockUser] = await Promise.all([
      User.findOne({ user_id: savedClock.CreateBy }),
      User.findOne({ user_id: savedClock.user_id })
    ]);

    // Create response object with populated data
    const clockResponse = savedClock.toObject();
    clockResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;
    clockResponse.user_id = clockUser ? { 
      user_id: clockUser.user_id, 
      Name: clockUser.Name, 
      email: clockUser.email 
    } : null;

    res.status(201).json({
      success: true,
      message: 'Clock record created successfully',
      data: clockResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating clock record',
      error: error.message
    });
  }
};

// Update Clock
const updateClock = async (req, res) => {
  try {
    const { Clock_in_id, date, in_time, out_time, user_id, Status } = req.body;
    const userId = req.user.user_id;

    const clock = await Clock.findOne({ Clock_in_id });

    if (!clock) {
      return res.status(404).json({
        success: false,
        message: 'Clock record not found'
      });
    }

    // Update fields
    if (date !== undefined) clock.date = date;
    if (in_time !== undefined) clock.in_time = in_time;
    if (out_time !== undefined) clock.out_time = out_time;
    if (user_id !== undefined) clock.user_id = user_id;
    if (Status !== undefined) clock.Status = Status;
    clock.UpdatedBy = userId;
    clock.UpdatedAt = new Date();

    const updatedClock = await clock.save();
    
    // Fetch creator, updater, and user details
    const [createByUser, updatedByUser, clockUser] = await Promise.all([
      User.findOne({ user_id: updatedClock.CreateBy }),
      User.findOne({ user_id: updatedClock.UpdatedBy }),
      User.findOne({ user_id: updatedClock.user_id })
    ]);

    // Create response object with populated data
    const clockResponse = updatedClock.toObject();
    clockResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;
    clockResponse.UpdatedBy = updatedByUser ? { 
      user_id: updatedByUser.user_id, 
      Name: updatedByUser.Name, 
      email: updatedByUser.email 
    } : null;
    clockResponse.user_id = clockUser ? { 
      user_id: clockUser.user_id, 
      Name: clockUser.Name, 
      email: clockUser.email 
    } : null;

    res.status(200).json({
      success: true,
      message: 'Clock record updated successfully',
      data: clockResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating clock record',
      error: error.message
    });
  }
};

// Get Clock by ID
const getClockById = async (req, res) => {
  try {
    const { Clock_in_id } = req.params;

    const clock = await Clock.findOne({ Clock_in_id });

    if (!clock) {
      return res.status(404).json({
        success: false,
        message: 'Clock record not found'
      });
    }

    // Fetch creator, updater, and user details
    const [createByUser, updatedByUser, clockUser] = await Promise.all([
      User.findOne({ user_id: clock.CreateBy }),
      clock.UpdatedBy ? User.findOne({ user_id: clock.UpdatedBy }) : null,
      User.findOne({ user_id: clock.user_id })
    ]);

    // Create response object with populated data
    const clockResponse = clock.toObject();
    clockResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;
    clockResponse.UpdatedBy = updatedByUser ? { 
      user_id: updatedByUser.user_id, 
      Name: updatedByUser.Name, 
      email: updatedByUser.email 
    } : null;
    clockResponse.user_id = clockUser ? { 
      user_id: clockUser.user_id, 
      Name: clockUser.Name, 
      email: clockUser.email 
    } : null;

    res.status(200).json({
      success: true,
      message: 'Clock record retrieved successfully',
      data: clockResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving clock record',
      error: error.message
    });
  }
};

// Get All Clock Records
const getAllClocks = async (req, res) => {
  try {
    const clocks = await Clock.find({ Status: true }).sort({ CreateAt: -1 });

    // Fetch creator, updater, and user details for all clock records
    const clocksWithUsers = await Promise.all(
      clocks.map(async (clock) => {
        const [createByUser, updatedByUser, clockUser] = await Promise.all([
          User.findOne({ user_id: clock.CreateBy }),
          clock.UpdatedBy ? User.findOne({ user_id: clock.UpdatedBy }) : null,
          User.findOne({ user_id: clock.user_id })
        ]);

        const clockResponse = clock.toObject();
        clockResponse.CreateBy = createByUser ? { 
          user_id: createByUser.user_id, 
          Name: createByUser.Name, 
          email: createByUser.email 
        } : null;
        clockResponse.UpdatedBy = updatedByUser ? { 
          user_id: updatedByUser.user_id, 
          Name: updatedByUser.Name, 
          email: updatedByUser.email 
        } : null;
        clockResponse.user_id = clockUser ? { 
          user_id: clockUser.user_id, 
          Name: clockUser.Name, 
          email: clockUser.email 
        } : null;

        return clockResponse;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Clock records retrieved successfully',
      data: clocksWithUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving clock records',
      error: error.message
    });
  }
};

// Get Clock Records by User ID
const getClocksByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const clocks = await Clock.find({ user_id: parseInt(user_id), Status: true }).sort({ CreateAt: -1 });

    if (clocks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No clock records found for this user'
      });
    }

    // Fetch creator, updater, and user details for all clock records
    const clocksWithUsers = await Promise.all(
      clocks.map(async (clock) => {
        const [createByUser, updatedByUser, clockUser] = await Promise.all([
          User.findOne({ user_id: clock.CreateBy }),
          clock.UpdatedBy ? User.findOne({ user_id: clock.UpdatedBy }) : null,
          User.findOne({ user_id: clock.user_id })
        ]);

        const clockResponse = clock.toObject();
        clockResponse.CreateBy = createByUser ? { 
          user_id: createByUser.user_id, 
          Name: createByUser.Name, 
          email: createByUser.email 
        } : null;
        clockResponse.UpdatedBy = updatedByUser ? { 
          user_id: updatedByUser.user_id, 
          Name: updatedByUser.Name, 
          email: updatedByUser.email 
        } : null;
        clockResponse.user_id = clockUser ? { 
          user_id: clockUser.user_id, 
          Name: clockUser.Name, 
          email: clockUser.email 
        } : null;

        return clockResponse;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Clock records retrieved successfully for user',
      data: clocksWithUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving clock records for user',
      error: error.message
    });
  }
};

// Delete Clock
const deleteClock = async (req, res) => {
  try {
    const { Clock_in_id } = req.params;
    
    const clock = await Clock.findOne({ Clock_in_id });
    
    if (!clock) {
      return res.status(404).json({
        success: false,
        message: 'Clock record not found'
      });
    }

    await Clock.deleteOne({ Clock_in_id });
    
    res.status(200).json({
      success: true,
      message: 'Clock record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting clock record',
      error: error.message
    });
  }
};

// Get Clock by Auth (current logged in user)
const getClockByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const clocks = await Clock.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!clocks || clocks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clock records not found for current user'
      });
    }

    // Manually fetch related data for all clocks
    const clocksResponse = await Promise.all(clocks.map(async (clock) => {
      const [createByUser, updatedByUser] = await Promise.all([
        clock.CreateBy ? User.findOne({ user_id: clock.CreateBy }) : null,
        clock.UpdatedBy ? User.findOne({ user_id: clock.UpdatedBy }) : null
      ]);

      const clockObj = clock.toObject();
      clockObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      clockObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return clockObj;
    }));

    res.status(200).json({
      success: true,
      count: clocksResponse.length,
      data: clocksResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clock records',
      error: error.message
    });
  }
};

module.exports = {
  createClock,
  updateClock,
  getClockById,
  getAllClocks,
  getClocksByUserId,
  getClockByAuth,
  deleteClock
};
