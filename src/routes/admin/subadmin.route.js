const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const User = require('../../models/User.model');
const Role = require('../../models/Role.model');
const SubAdmin_Permissions = require('../../models/SubAdmin_Permissions.model');
const Responsibility = require('../../models/Responsibility.model');

// Get All SubAdmins (Role_id = 5)
router.get('/getall', auth, async (req, res) => {
  try {
    const { Status, search, page, limit } = req.query;
    
    // Build query filter
    const filter = { Role_id: 5, Status: Status !== undefined ? Status === 'true' : true };
    
    // Add search filter if provided
    if (search) {
      filter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Fetch SubAdmins with pagination
    const subAdmins = await User.find(filter)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Fetch related data for all SubAdmins
    const subAdminsResponse = await Promise.all(
      subAdmins.map(async (subAdmin) => {
        const [responsibility, createByUser, subAdminPermissions] = await Promise.all([
          Responsibility.findOne({ Responsibility_id: subAdmin.Responsibility_id }),
          subAdmin.CreateBy ? User.findOne({ user_id: subAdmin.CreateBy }) : null,
          SubAdmin_Permissions.findOne({ User_id: subAdmin.user_id, Status: true })
        ]);

        const subAdminObj = subAdmin.toObject();
        subAdminObj.Responsibility = responsibility ? {
          Responsibility_id: responsibility.Responsibility_id,
          Responsibility_name: responsibility.Responsibility_name
        } : null;
        subAdminObj.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        subAdminObj.SubAdmin_Permissions = subAdminPermissions ? {
          SubAdmin_Permissions_id: subAdminPermissions.SubAdmin_Permissions_id,
          IsPermissons: subAdminPermissions.IsPermissons,
          Status: subAdminPermissions.Status
        } : null;

        delete subAdminObj.password;
        return subAdminObj;
      })
    );

    res.status(200).json({
      success: true,
      message: 'SubAdmins retrieved successfully',
      data: subAdminsResponse,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SubAdmins',
      error: error.message
    });
  }
});

// Get SubAdmin by ID
router.get('/getbyid/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const subAdmin = await User.findOne({ user_id: parseInt(id), Role_id: 5 });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin not found'
      });
    }

    // Fetch related data
    const [responsibility, createByUser, updatedByUser, subAdminPermissions] = await Promise.all([
      Responsibility.findOne({ Responsibility_id: subAdmin.Responsibility_id }),
      subAdmin.CreateBy ? User.findOne({ user_id: subAdmin.CreateBy }) : null,
      subAdmin.UpdatedBy ? User.findOne({ user_id: subAdmin.UpdatedBy }) : null,
      SubAdmin_Permissions.findOne({ User_id: subAdmin.user_id, Status: true })
    ]);

    const subAdminObj = subAdmin.toObject();
    subAdminObj.Responsibility = responsibility ? {
      Responsibility_id: responsibility.Responsibility_id,
      Responsibility_name: responsibility.Responsibility_name
    } : null;
    subAdminObj.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    subAdminObj.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    subAdminObj.SubAdmin_Permissions = subAdminPermissions ? {
      SubAdmin_Permissions_id: subAdminPermissions.SubAdmin_Permissions_id,
      IsPermissons: subAdminPermissions.IsPermissons,
      Status: subAdminPermissions.Status
    } : null;

    delete subAdminObj.password;

    res.status(200).json({
      success: true,
      message: 'SubAdmin retrieved successfully',
      data: subAdminObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SubAdmin',
      error: error.message
    });
  }
});

// Get SubAdmins by Auth (current logged in user - Admin only)
router.get('/getbyauth', auth, async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Verify user is an Admin (Role_id = 1)
    const user = await User.findOne({ user_id: userId, Role_id: 1 });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Current user is not an Admin'
      });
    }

    // Fetch related data for current user
    const [responsibility, createByUser, subAdminPermissions] = await Promise.all([
      Responsibility.findOne({ Responsibility_id: user.Responsibility_id }),
      user.CreateBy ? User.findOne({ user_id: user.CreateBy }) : null,
      SubAdmin_Permissions.findOne({ User_id: user.user_id, Status: true })
    ]);

    const userObj = user.toObject();
    userObj.Responsibility = responsibility ? {
      Responsibility_id: responsibility.Responsibility_id,
      Responsibility_name: responsibility.Responsibility_name
    } : null;
    userObj.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    userObj.SubAdmin_Permissions = subAdminPermissions ? {
      SubAdmin_Permissions_id: subAdminPermissions.SubAdmin_Permissions_id,
      IsPermissons: subAdminPermissions.IsPermissons,
      Status: subAdminPermissions.Status
    } : null;

    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'SubAdmin profile retrieved successfully',
      data: userObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SubAdmin profile',
      error: error.message
    });
  }
});

// Update SubAdmin
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, email, phone, Responsibility_id, Status, IsPermissons } = req.body;
    const adminId = req.user.user_id;

    // Check if SubAdmin exists
    const subAdmin = await User.findOne({ user_id: parseInt(id), Role_id: 5 });
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin not found'
      });
    }

    // Build update object
    const updateData = {};
    if (Name) updateData.Name = Name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (Responsibility_id) updateData.Responsibility_id = Responsibility_id;
    if (Status !== undefined) updateData.Status = Status;
    updateData.UpdatedBy = adminId;
    updateData.UpdatedAt = new Date();

    // Update SubAdmin
    const updatedSubAdmin = await User.findOneAndUpdate(
      { user_id: parseInt(id), Role_id: 5 },
      updateData,
      { new: true }
    );

    // Update permissions if provided
    if (IsPermissons) {
      let subAdminPermissions = await SubAdmin_Permissions.findOne({ User_id: parseInt(id) });

      if (subAdminPermissions) {
        // Update existing permissions
        subAdminPermissions.IsPermissons = IsPermissons;
        subAdminPermissions.UpdatedBy = adminId;
        subAdminPermissions.UpdatedAt = new Date();
        subAdminPermissions = await subAdminPermissions.save();
      } else {
        // Create new permissions
        subAdminPermissions = new SubAdmin_Permissions({
          User_id: parseInt(id),
          IsPermissons: IsPermissons,
          Status: true,
          CreateBy: adminId,
          UpdatedBy: adminId
        });
        subAdminPermissions = await subAdminPermissions.save();
      }
    }

    // Fetch related data
    const [responsibility, createByUser, updatedByUser, subAdminPermissions] = await Promise.all([
      Responsibility.findOne({ Responsibility_id: updatedSubAdmin.Responsibility_id }),
      updatedSubAdmin.CreateBy ? User.findOne({ user_id: updatedSubAdmin.CreateBy }) : null,
      updatedSubAdmin.UpdatedBy ? User.findOne({ user_id: updatedSubAdmin.UpdatedBy }) : null,
      SubAdmin_Permissions.findOne({ User_id: updatedSubAdmin.user_id, Status: true })
    ]);

    const subAdminObj = updatedSubAdmin.toObject();
    subAdminObj.Responsibility = responsibility ? {
      Responsibility_id: responsibility.Responsibility_id,
      Responsibility_name: responsibility.Responsibility_name
    } : null;
    subAdminObj.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    subAdminObj.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    subAdminObj.SubAdmin_Permissions = subAdminPermissions ? {
      SubAdmin_Permissions_id: subAdminPermissions.SubAdmin_Permissions_id,
      IsPermissons: subAdminPermissions.IsPermissons,
      Status: subAdminPermissions.Status
    } : null;

    delete subAdminObj.password;

    res.status(200).json({
      success: true,
      message: 'SubAdmin updated successfully',
      data: subAdminObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating SubAdmin',
      error: error.message
    });
  }
});

// Deactivate SubAdmin
router.patch('/deactivate/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.user_id;

    // Check if SubAdmin exists
    const subAdmin = await User.findOne({ user_id: parseInt(id), Role_id: 5 });
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin not found'
      });
    }

    // Deactivate SubAdmin
    await User.findOneAndUpdate(
      { user_id: parseInt(id), Role_id: 5 },
      {
        Status: false,
        UpdatedBy: adminId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'SubAdmin deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating SubAdmin',
      error: error.message
    });
  }
});

// Activate SubAdmin
router.patch('/activate/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.user_id;

    // Check if SubAdmin exists
    const subAdmin = await User.findOne({ user_id: parseInt(id), Role_id: 5 });
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin not found'
      });
    }

    // Activate SubAdmin
    await User.findOneAndUpdate(
      { user_id: parseInt(id), Role_id: 5 },
      {
        Status: true,
        UpdatedBy: adminId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'SubAdmin activated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating SubAdmin',
      error: error.message
    });
  }
});

// Set/Update SubAdmin Permissions
router.put('/set-permissions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { IsPermissons, Status } = req.body;
    const adminId = req.user.user_id;

    // Check if SubAdmin exists
    const subAdmin = await User.findOne({ user_id: parseInt(id), Role_id: 5 });
    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SubAdmin not found'
      });
    }

    // Check if permissions already exist
    let subAdminPermissions = await SubAdmin_Permissions.findOne({ User_id: parseInt(id) });

    if (subAdminPermissions) {
      // Update existing permissions
      subAdminPermissions.IsPermissons = IsPermissons;
      if (Status !== undefined) subAdminPermissions.Status = Status;
      subAdminPermissions.UpdatedBy = adminId;
      subAdminPermissions.UpdatedAt = new Date();
      subAdminPermissions = await subAdminPermissions.save();
    } else {
      // Create new permissions
      subAdminPermissions = new SubAdmin_Permissions({
        User_id: parseInt(id),
        IsPermissons: IsPermissons,
        Status: Status !== undefined ? Status : true,
        CreateBy: adminId,
        UpdatedBy: adminId
      });
      subAdminPermissions = await subAdminPermissions.save();
    }

    res.status(200).json({
      success: true,
      message: 'SubAdmin permissions set successfully',
      data: {
        SubAdmin_Permissions_id: subAdminPermissions.SubAdmin_Permissions_id,
        User_id: subAdminPermissions.User_id,
        IsPermissons: subAdminPermissions.IsPermissons,
        Status: subAdminPermissions.Status,
        CreateBy: subAdminPermissions.CreateBy,
        UpdatedBy: subAdminPermissions.UpdatedBy,
        CreateAt: subAdminPermissions.CreateAt,
        UpdatedAt: subAdminPermissions.UpdatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting SubAdmin permissions',
      error: error.message
    });
  }
});

module.exports = router;
