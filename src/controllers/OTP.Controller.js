const OTP = require('../models/OTP.model');
const User = require('../models/User.model');
const { generateOTP, validateOTP } = require('../utils/otpGenerator');
const { sendForgetPasswordOTP, sendPasswordResetConfirmation, sendPasswordDetailsEmail } = require('../utils/emailService');

// Send OTP for forget password
const sendForgetPasswordOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(user,"user")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }

    // Check if user is active
    if (!user.Status) {
      return res.status(400).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Deactivate any existing OTPs for this user
    await OTP.updateMany(
      { user_id: user.user_id, OTP_type: 'ForgetPassword', Status: true },
      { Status: false, UpdatedAt: new Date() }
    );

    // Generate new OTP
    const otpCode = generateOTP();

    // Create new OTP record
    const otp = new OTP({
      OTP_type: 'ForgetPassword',
      OTP: otpCode,
      user_id: user.user_id,
      CreateBy: user.user_id
    });

    await otp.save();

    // Send OTP via email
   // const emailResult = await sendForgetPasswordOTP(user.email, otpCode, user.Name);

    //if (!emailResult.success) {
      // If email fails, delete the OTP and return error
      // await OTP.findByIdAndDelete(otp._id);
      // return res.status(500).json({
      //   success: false,
      //   message: 'Failed to send OTP email',
      //   error: emailResult.error
      // });
    //}

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email address',
      data: {
        user_id: user.user_id,
        email: user.email,
        OTP: otpCode
      //  messageId: emailResult.messageId
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};
// Resend OTP (Forget Password)
// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }

    if (!user.Status) {
      return res.status(400).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Deactivate old OTPs
    await OTP.updateMany(
      {
        user_id: user.user_id,
        OTP_type: 'ForgetPassword',
        Status: true
      },
      {
        Status: false,
        UpdatedAt: new Date()
      }
    );

    // Generate new OTP (8-digit)
    const newOTP = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Save OTP
    const otpData = await OTP.create({
      user_id: user.user_id,
      OTP: newOTP,
      OTP_type: 'ForgetPassword',
      Status: true,
      CreateAt: new Date()
    });

    // TODO: Send OTP via email/SMS here

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        email: user.email,
        otp: newOTP,          // 👈 OTP BODY ME RETURN
        otp_id: otpData._id,
        valid_for_minutes: 10
      }
    });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};


// Verify OTP and reset password
// const verifyOTPAndResetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found with this email address'
//       });
//     }

//     // Check if user is active
//     if (!user.Status) {
//       return res.status(400).json({
//         success: false,
//         message: 'User account is deactivated'
//       });
//     }

//     // Validate OTP format
//     if (!validateOTP(otp)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid OTP format. Please enter an 8-digit OTP'
//       });
//     }

//     // Find active OTP for this user
//     const otpRecord = await OTP.findOne({
//       user_id: user.user_id,
//       OTP_type: 'ForgetPassword',
//       OTP: otp,
//       Status: true
//     });

//     if (!otpRecord) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or expired OTP'
//       });
//     }

//     // Check if OTP is expired (10 minutes)
//     const otpAge = Date.now() - otpRecord.CreateAt.getTime();
//     const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

//     if (otpAge > tenMinutes) {
//       // Deactivate expired OTP
//       await OTP.findByIdAndUpdate(otpRecord._id, {
//         Status: false,
//         UpdatedAt: new Date()
//       });

//       return res.status(400).json({
//         success: false,
//         message: 'OTP has expired. Please request a new OTP'
//       });
//     }

//     // Validate new password
//     if (!newPassword || newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'New password must be at least 6 characters long'
//       });
//     }

//     // Update user password
//     const timestamp = Date.now().toString();
//     const simpleHash = newPassword + timestamp;
//     const hashedPassword = timestamp + ':' + simpleHash;

//     user.password = hashedPassword;
//     user.UpdatedAt = new Date();
//     await user.save();

//     // Deactivate the used OTP
//     await OTP.findByIdAndUpdate(otpRecord._id, {
//       Status: false,
//       UpdatedAt: new Date()
//     });

//     // Send confirmation email
//     const emailResult = await sendPasswordResetConfirmation(user.email, user.Name, newPassword);

//     res.status(200).json({
//       success: true,
//       message: 'Password reset successfully',
//       data: {
//         user_id: user.user_id,
//         email: user.email,
//         emailSent: emailResult.success
//       }
//     });

//   } catch (error) {
//     console.error('Verify OTP error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error verifying OTP and resetting password',
//       error: error.message
//     });
//   }
// };

// Verify OTP only (without password reset)
// Verify OTP & Reset Password
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Basic validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }

    if (!user.Status) {
      return res.status(400).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Validate OTP format (8 digits)
    if (!validateOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Please enter an 8-digit OTP'
      });
    }

    // Find active OTP
    const otpRecord = await OTP.findOne({
      user_id: user.user_id,
      OTP_type: 'ForgetPassword',
      OTP: otp,
      Status: true
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check OTP expiry (10 minutes)
    const otpAge = Date.now() - otpRecord.CreateAt.getTime();
    const OTP_EXPIRY = 10 * 60 * 1000;

    if (otpAge > OTP_EXPIRY) {
      await OTP.updateOne(
        { _id: otpRecord._id },
        { Status: false, UpdatedAt: new Date() }
      );

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP'
      });
    }

    // Hash password (same as User schema)
    const timestamp = Date.now().toString();
    const simpleHash = newPassword + timestamp;
    const hashedPassword = `${timestamp}:${simpleHash}`;

    // Update password
    await User.updateOne(
      { user_id: user.user_id },
      {
        password: hashedPassword,
        UpdatedAt: new Date()
      }
    );

    // Deactivate OTP
    await OTP.updateOne(
      { _id: otpRecord._id },
      { Status: false, UpdatedAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Password has been reset.',
      data: {
        user_id: user.user_id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};


// Get OTP by User ID
const getOTPByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const otps = await OTP.find({ user_id: parseInt(user_id) })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all OTPs
    const otpsWithPopulatedData = await Promise.all(
      otps.map(async (otp) => {
        const [createByUser, updatedByUser] = await Promise.all([
          otp.CreateBy ? User.findOne({ user_id: otp.CreateBy }) : null,
          otp.UpdatedBy ? User.findOne({ user_id: otp.UpdatedBy }) : null
        ]);

        const otpResponse = otp.toObject();
        otpResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        otpResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return otpResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: otpsWithPopulatedData.length,
      data: otpsWithPopulatedData
    });
  } catch (error) {
    console.error('Get OTP by User ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching OTPs by user ID',
      error: error.message
    });
  }
};

// Get All OTPs
const getAllOTPs = async (req, res) => {
  try {
    const otps = await OTP.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all OTPs
    const otpsWithPopulatedData = await Promise.all(
      otps.map(async (otp) => {
        const [createByUser, updatedByUser] = await Promise.all([
          otp.CreateBy ? User.findOne({ user_id: otp.CreateBy }) : null,
          otp.UpdatedBy ? User.findOne({ user_id: otp.UpdatedBy }) : null
        ]);

        const otpResponse = otp.toObject();
        otpResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        otpResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return otpResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: otpsWithPopulatedData.length,
      data: otpsWithPopulatedData
    });
  } catch (error) {
    console.error('Get All OTPs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all OTPs',
      error: error.message
    });
  }
};

// Get OTPs by Status
const getOTPsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Convert string to boolean
    const statusBoolean = status.toLowerCase() === 'true';
    
    const otps = await OTP.find({ Status: statusBoolean })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all OTPs
    const otpsWithPopulatedData = await Promise.all(
      otps.map(async (otp) => {
        const [createByUser, updatedByUser] = await Promise.all([
          otp.CreateBy ? User.findOne({ user_id: otp.CreateBy }) : null,
          otp.UpdatedBy ? User.findOne({ user_id: otp.UpdatedBy }) : null
        ]);

        const otpResponse = otp.toObject();
        otpResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        otpResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return otpResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: otpsWithPopulatedData.length,
      data: otpsWithPopulatedData
    });
  } catch (error) {
    console.error('Get OTPs by Status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching OTPs by status',
      error: error.message
    });
  }
};

// Get OTP by Auth (current logged in user)
const getOTPByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const otps = await OTP.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!otps || otps.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'OTPs not found for current user'
      });
    }

    // Manually fetch related data for all OTPs
    const otpsResponse = await Promise.all(otps.map(async (otp) => {
      const [createByUser, updatedByUser] = await Promise.all([
        otp.CreateBy ? User.findOne({ user_id: otp.CreateBy }) : null,
        otp.UpdatedBy ? User.findOne({ user_id: otp.UpdatedBy }) : null
      ]);

      const otpObj = otp.toObject();
      otpObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      otpObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return otpObj;
    }));

    res.status(200).json({
      success: true,
      count: otpsResponse.length,
      data: otpsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching OTPs',
      error: error.message
    });
  }
};

module.exports = {
  sendForgetPasswordOTPController,
  verifyOTP,
  getOTPByUserId,
  getAllOTPs,
  getOTPsByStatus,
  getOTPByAuth,
  resendOTP
};
