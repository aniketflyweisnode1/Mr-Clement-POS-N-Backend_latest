const PosSpealist = require('../models/PosSpealist.model');
const User = require('../models/User.model');

// Create PosSpealist
const createPosSpealist = async (req, res) => {
  try {
    const { Name, Business_Name, Email, PhoneNo, Status } = req.body;
    const userId = req.user?.user_id || null;

    if (!Name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!Business_Name) {
      return res.status(400).json({
        success: false,
        message: 'Business_Name is required'
      });
    }

    if (!Email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!PhoneNo) {
      return res.status(400).json({
        success: false,
        message: 'PhoneNo is required'
      });
    }

    const posSpealist = new PosSpealist({
      Name: Name.trim(),
      Business_Name: Business_Name.trim(),
      Email: Email.trim().toLowerCase(),
      PhoneNo: PhoneNo.trim(),
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedPosSpealist = await posSpealist.save();

    // Populate CreateBy
    const createByUser = userId ? await User.findOne({ user_id: userId }) : null;
    const posSpealistResponse = savedPosSpealist.toObject();
    posSpealistResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'PosSpealist created successfully',
      data: posSpealistResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating PosSpealist',
      error: error.message
    });
  }
};

// Update PosSpealist
const updatePosSpealist = async (req, res) => {
  try {
    const { id, Name, Business_Name, Email, PhoneNo, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'PosSpealist_id is required in request body'
      });
    }

    const posSpealist = await PosSpealist.findOne({
      PosSpealist_id: parseInt(id)
    });

    if (!posSpealist) {
      return res.status(404).json({
        success: false,
        message: 'PosSpealist not found'
      });
    }

    if (Name !== undefined) posSpealist.Name = Name.trim();
    if (Business_Name !== undefined) posSpealist.Business_Name = Business_Name.trim();
    if (Email !== undefined) posSpealist.Email = Email.trim().toLowerCase();
    if (PhoneNo !== undefined) posSpealist.PhoneNo = PhoneNo.trim();
    if (Status !== undefined) posSpealist.Status = Status;

    posSpealist.UpdatedBy = userId;
    posSpealist.UpdatedAt = new Date();

    const updatedPosSpealist = await posSpealist.save();

    // Populate data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: updatedPosSpealist.CreateBy }),
      User.findOne({ user_id: updatedPosSpealist.UpdatedBy })
    ]);

    const posSpealistResponse = updatedPosSpealist.toObject();
    posSpealistResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    posSpealistResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'PosSpealist updated successfully',
      data: posSpealistResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating PosSpealist',
      error: error.message
    });
  }
};

// Get PosSpealist by ID
const getPosSpealistById = async (req, res) => {
  try {
    const { id } = req.params;

    const posSpealist = await PosSpealist.findOne({
      PosSpealist_id: parseInt(id)
    });

    if (!posSpealist) {
      return res.status(404).json({
        success: false,
        message: 'PosSpealist not found'
      });
    }

    // Populate data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: posSpealist.CreateBy }),
      posSpealist.UpdatedBy ? User.findOne({ user_id: posSpealist.UpdatedBy }) : null
    ]);

    const posSpealistResponse = posSpealist.toObject();
    posSpealistResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    posSpealistResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      data: posSpealistResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching PosSpealist',
      error: error.message
    });
  }
};

// Get All PosSpealists
const getAllPosSpealists = async (req, res) => {
  try {
    const posSpealists = await PosSpealist.find({ Status: true }).sort({ CreateAt: -1 });

    const posSpealistsResponse = await Promise.all(
      posSpealists.map(async (posSpealist) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: posSpealist.CreateBy }),
          posSpealist.UpdatedBy ? User.findOne({ user_id: posSpealist.UpdatedBy }) : null
        ]);

        const posSpealistObj = posSpealist.toObject();
        posSpealistObj.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        posSpealistObj.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return posSpealistObj;
      })
    );

    res.status(200).json({
      success: true,
      count: posSpealistsResponse.length,
      data: posSpealistsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching PosSpealists',
      error: error.message
    });
  }
};

// Get PosSpealist by Auth
const getPosSpealistByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const posSpealists = await PosSpealist.find({
      CreateBy: userId,
      Status: true
    }).sort({ CreateAt: -1 });

    if (posSpealists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No PosSpealists found for current user'
      });
    }

    const posSpealistsResponse = await Promise.all(
      posSpealists.map(async (posSpealist) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: posSpealist.CreateBy }),
          posSpealist.UpdatedBy ? User.findOne({ user_id: posSpealist.UpdatedBy }) : null
        ]);

        const posSpealistObj = posSpealist.toObject();
        posSpealistObj.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        posSpealistObj.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return posSpealistObj;
      })
    );

    res.status(200).json({
      success: true,
      count: posSpealistsResponse.length,
      data: posSpealistsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching PosSpealists',
      error: error.message
    });
  }
};

// Delete PosSpealist
const deletePosSpealist = async (req, res) => {
  try {
    const { id } = req.params;

    const posSpealist = await PosSpealist.findOne({
      PosSpealist_id: parseInt(id)
    });

    if (!posSpealist) {
      return res.status(404).json({
        success: false,
        message: 'PosSpealist not found'
      });
    }

    await PosSpealist.deleteOne({ PosSpealist_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'PosSpealist deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting PosSpealist',
      error: error.message
    });
  }
};

module.exports = {
  createPosSpealist,
  updatePosSpealist,
  getPosSpealistById,
  getAllPosSpealists,
  getPosSpealistByAuth,
  deletePosSpealist
};

