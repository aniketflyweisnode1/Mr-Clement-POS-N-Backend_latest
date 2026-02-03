const NewSletter = require('../models/NewSletter.model');
const User = require('../models/User.model');

// Create NewSletter
const createNewSletter = async (req, res) => {
  try {
    const { Email, Status } = req.body;
    const userId = req.user?.user_id || null;

    if (!Email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const newSletter = new NewSletter({
      Email: Email.trim().toLowerCase(),
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedNewSletter = await newSletter.save();

    // Populate CreateBy if user exists
    const createByUser = userId ? await User.findOne({ user_id: userId }) : null;

    const newSletterResponse = savedNewSletter.toObject();
    newSletterResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'NewSletter created successfully',
      data: newSletterResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating NewSletter',
      error: error.message
    });
  }
};

// Update NewSletter
const updateNewSletter = async (req, res) => {
  try {
    const { id, user_id, Email, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'NewSletter_id is required in request body'
      });
    }

    const newSletter = await NewSletter.findOne({
      NewSletter_id: parseInt(id)
    });

    if (!newSletter) {
      return res.status(404).json({
        success: false,
        message: 'NewSletter not found'
      });
    }

    if (user_id !== undefined) {
      const user = await User.findOne({ user_id: parseInt(user_id) });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      newSletter.user_id = parseInt(user_id);
    }

    if (Email !== undefined) newSletter.Email = Email.trim().toLowerCase();
    if (Status !== undefined) newSletter.Status = Status;

    newSletter.UpdatedBy = userId;
    newSletter.UpdatedAt = new Date();

    const updatedNewSletter = await newSletter.save();

    // Populate data
    const [userData, createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: updatedNewSletter.user_id }),
      User.findOne({ user_id: updatedNewSletter.CreateBy }),
      User.findOne({ user_id: updatedNewSletter.UpdatedBy })
    ]);

    const newSletterResponse = updatedNewSletter.toObject();
    newSletterResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    newSletterResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    newSletterResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'NewSletter updated successfully',
      data: newSletterResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating NewSletter',
      error: error.message
    });
  }
};

// Get NewSletter by ID
const getNewSletterById = async (req, res) => {
  try {
    const { id } = req.params;

    const newSletter = await NewSletter.findOne({
      NewSletter_id: parseInt(id)
    });

    if (!newSletter) {
      return res.status(404).json({
        success: false,
        message: 'NewSletter not found'
      });
    }

    // Populate data
    const [userData, createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: newSletter.user_id }),
      User.findOne({ user_id: newSletter.CreateBy }),
      newSletter.UpdatedBy ? User.findOne({ user_id: newSletter.UpdatedBy }) : null
    ]);

    const newSletterResponse = newSletter.toObject();
    newSletterResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    newSletterResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    newSletterResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      data: newSletterResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching NewSletter',
      error: error.message
    });
  }
};

// Get All NewSletters
const getAllNewSletters = async (req, res) => {
  try {
    const newSletters = await NewSletter.find({ Status: true }).sort({ CreateAt: -1 });

    const newSlettersResponse = await Promise.all(
      newSletters.map(async (newSletter) => {
        const [userData, createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: newSletter.user_id }),
          User.findOne({ user_id: newSletter.CreateBy }),
          newSletter.UpdatedBy ? User.findOne({ user_id: newSletter.UpdatedBy }) : null
        ]);

        const newSletterObj = newSletter.toObject();
        newSletterObj.user_id = userData ? {
          user_id: userData.user_id,
          Name: userData.Name,
          email: userData.email
        } : null;
        newSletterObj.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        newSletterObj.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return newSletterObj;
      })
    );

    res.status(200).json({
      success: true,
      count: newSlettersResponse.length,
      data: newSlettersResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching NewSletters',
      error: error.message
    });
  }
};

// Get NewSletter by Auth
const getNewSletterByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const newSletters = await NewSletter.find({
      user_id: userId,
      Status: true
    }).sort({ CreateAt: -1 });

    if (newSletters.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No NewSletters found for current user'
      });
    }

    const newSlettersResponse = await Promise.all(
      newSletters.map(async (newSletter) => {
        const [userData, createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: newSletter.user_id }),
          User.findOne({ user_id: newSletter.CreateBy }),
          newSletter.UpdatedBy ? User.findOne({ user_id: newSletter.UpdatedBy }) : null
        ]);

        const newSletterObj = newSletter.toObject();
        newSletterObj.user_id = userData ? {
          user_id: userData.user_id,
          Name: userData.Name,
          email: userData.email
        } : null;
        newSletterObj.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        newSletterObj.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return newSletterObj;
      })
    );

    res.status(200).json({
      success: true,
      count: newSlettersResponse.length,
      data: newSlettersResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching NewSletters',
      error: error.message
    });
  }
};

// Delete NewSletter
const deleteNewSletter = async (req, res) => {
  try {
    const { id } = req.params;

    const newSletter = await NewSletter.findOne({
      NewSletter_id: parseInt(id)
    });

    if (!newSletter) {
      return res.status(404).json({
        success: false,
        message: 'NewSletter not found'
      });
    }

    await NewSletter.deleteOne({ NewSletter_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'NewSletter deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting NewSletter',
      error: error.message
    });
  }
};

module.exports = {
  createNewSletter,
  updateNewSletter,
  getNewSletterById,
  getAllNewSletters,
  getNewSletterByAuth,
  deleteNewSletter
};

