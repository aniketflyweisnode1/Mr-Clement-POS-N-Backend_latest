const User = require('../models/User.model');
const Responsibility = require('../models/Responsibility.model');
const Role = require('../models/Role.model');
const Language = require('../models/Language.model');
const Country = require('../models/Country.model');
const State = require('../models/State.model');
const City = require('../models/City.model');
const { generateToken } = require('../middleware/authMiddleware');
const { generateEmployeeId } = require('../utils/employeeIdGenerator');
const logger = require('../utils/logger');

// Helper function to process login
const processLogin = async (user, rememberMe, res) => {
  // Generate JWT token with rememberMe support
  const token = generateToken(user, rememberMe || false);

  // Manually fetch related data
  const [responsibility, role, language, country, state, city, createByUser, updatedByUser] = await Promise.all([
    Responsibility.findOne({ Responsibility_id: user.Responsibility_id }),
    Role.findOne({ Role_id: user.Role_id }),
    Language.findOne({ Language_id: user.Language_id }),
    Country.findOne({ Country_id: user.Country_id }),
    State.findOne({ State_id: user.State_id }),
    City.findOne({ City_id: user.City_id }),
    user.CreateBy ? User.findOne({ user_id: user.CreateBy }) : null,
    user.UpdatedBy ? User.findOne({ user_id: user.UpdatedBy }) : null
  ]);

  // Create response object with populated data
  const userResponse = user.toObject();
  userResponse.Responsibility_id = responsibility ? { Responsibility_id: responsibility.Responsibility_id, Responsibility_name: responsibility.Responsibility_name } : null;
  userResponse.Role_id = role ? { Role_id: role.Role_id, role_name: role.role_name } : null;
  userResponse.Language_id = language ? { Language_id: language.Language_id, Language_name: language.Language_name } : null;
  userResponse.Country_id = country ? { Country_id: country.Country_id, Country_name: country.Country_name, code: country.code } : null;
  userResponse.State_id = state ? { State_id: state.State_id, state_name: state.state_name, Code: state.Code } : null;
  userResponse.City_id = city ? { City_id: city.City_id, City_name: city.City_name, Code: city.Code } : null;
  userResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
  userResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

  // Remove password from response
  delete userResponse.password;

  return {
    token,
    userResponse,
    role
  };
};

// Login User (Generic)
const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.Status || !user.isLoginPermission) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const { token, userResponse } = await processLogin(user, rememberMe, res);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Login Restaurant
const loginRestaurant = async (req, res) => {
  try {
    const { adminId, password, rememberMe } = req.body;

    // Find user by email, user_id, or Employee_id
    let user = null;
    const trimmedAdminId = adminId?.toString().trim();
    
    // Check if it's a number (user_id)
    if (!isNaN(trimmedAdminId)) {
      user = await User.findOne({ user_id: parseInt(trimmedAdminId) });
    }
    
    // If not found, try by email
    if (!user) {
      user = await User.findOne({ email: trimmedAdminId?.toLowerCase() });
    }
    
    // If not found, try by Employee_id
    if (!user) {
      user = await User.findOne({ Employee_id: trimmedAdminId });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or password'
      });
    }

    // Check if user has restaurant role
    const role = await Role.findOne({ Role_id: user.Role_id });
    if (!role || role.role_name?.toLowerCase() !== 'restaurant') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. This account is not a restaurant account.'
      });
    }

    // Check if user is active
    if (!user.Status || !user.isLoginPermission) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or password'
      });
    }

    const { token, userResponse } = await processLogin(user, rememberMe, res);

    logger.info(`Restaurant login successful - user_id: ${user.user_id}, email: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Restaurant login successful',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error(`Restaurant login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Login Employee
const loginEmployee = async (req, res) => {
  try {
    const { adminId, password, rememberMe } = req.body;

    // Find user by email, user_id, or Employee_id
    let user = null;
    const trimmedAdminId = adminId?.toString().trim();
    
    // Check if it's a number (user_id)
    if (!isNaN(trimmedAdminId)) {
      user = await User.findOne({ user_id: parseInt(trimmedAdminId) });
    }
    
    // If not found, try by email
    if (!user) {
      user = await User.findOne({ email: trimmedAdminId?.toLowerCase() });
    }
    
    // If not found, try by Employee_id
    if (!user) {
      user = await User.findOne({ Employee_id: trimmedAdminId });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or password'
      });
    }

    // Check if user has employee role
    const role = await Role.findOne({ Role_id: user.Role_id });
    if (!role || role.role_name?.toLowerCase() !== 'employee') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. This account is not an employee account.'
      });
    }

    // Check if user is active
    if (!user.Status || !user.isLoginPermission) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or password'
      });
    }

    const { token, userResponse } = await processLogin(user, rememberMe, res);

    logger.info(`Employee login successful - user_id: ${user.user_id}, email: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Employee login successful',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error(`Employee login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { adminId, password, rememberMe } = req.body;

    // Find user by email, user_id, or Employee_id
    let user = null;
    const trimmedAdminId = adminId?.toString().trim();
    
    // Check if it's a number (user_id)
    if (!isNaN(trimmedAdminId)) {
      user = await User.findOne({ user_id: parseInt(trimmedAdminId) });
    }
    
    // If not found, try by email
    if (!user) {
      user = await User.findOne({ email: trimmedAdminId?.toLowerCase() });
    }
    
    // If not found, try by Employee_id
    if (!user) {
      user = await User.findOne({ Employee_id: trimmedAdminId });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or password'
      });
    }

    // Check if user has admin role (admin or subadmin)
    const role = await Role.findOne({ Role_id: user.Role_id });
    const allowedRoles = ['admin', 'subadmin', 'super admin', 'superadmin'];
    if (!role || !allowedRoles.includes(role.role_name?.toLowerCase())) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. This account is not an admin account.'
      });
    }

    // Check if user is active
    if (!user.Status || !user.isLoginPermission) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or password'
      });
    }

    const { token, userResponse } = await processLogin(user, rememberMe, res);

    logger.info(`Admin login successful - user_id: ${user.user_id}, email: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error(`Admin login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Logout User
const logoutUser = async (req, res) => {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token. However, we can implement a blacklist if needed.
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

// Forgot Password - Send reset email




const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, reEnterPassword } = req.body;
    const userId = req.user.user_id;

    if (!currentPassword || !newPassword || !reEnterPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== reEnterPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and re-enter password do not match'
      });
    }

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.comparePassword(currentPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // SAME hashing logic as schema
    const timestamp = Date.now().toString();
    const simpleHash = newPassword + timestamp;
    const hashedPassword = timestamp + ':' + simpleHash;

    await User.updateOne(
      { user_id: userId },
      {
        password: hashedPassword,
        UpdatedBy: userId,
        UpdatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};


// Login with OTP generation

// Restaurant Registration
const registerRestaurant = async (req, res) => {
  try {
    const { businessName, email, password, confirmPassword, rememberMe } = req.body;

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email?.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        error: `A user with email "${email}" already exists`
      });
    }

    // Get default values for required fields
    // Try to find defaults, or use the first available record
    const [defaultRole, defaultResponsibility, defaultLanguage, defaultCountry] = await Promise.all([
      Role.findOne({ role_name: { $regex: /restaurant/i } }) || Role.findOne({ Status: true }),
      Responsibility.findOne({ Status: true }),
      Language.findOne({ Status: true }),
      Country.findOne({ Status: true })
    ]);

    if (!defaultRole) {
      return res.status(500).json({
        success: false,
        message: 'System configuration error: No restaurant role found'
      });
    }

    // Get state and city based on country
    const defaultState = await State.findOne({ Country_id: defaultCountry?.Country_id, Status: true }) || await State.findOne({ Status: true });
    const defaultCity = await City.findOne({ State_id: defaultState?.State_id, Status: true }) || await City.findOne({ Status: true });

    // Generate unique employee ID
    const Employee_id = await generateEmployeeId();

    // Create restaurant user with minimal required fields
    const user = new User({
      Name: businessName,
      last_name: 'Restaurant', // Default last name for restaurant
      Responsibility_id: defaultResponsibility?.Responsibility_id || 1,
      Role_id: defaultRole.Role_id,
      Language_id: defaultLanguage?.Language_id || 1,
      Country_id: defaultCountry?.Country_id || 1,
      State_id: defaultState?.State_id || 1,
      City_id: defaultCity?.City_id || 1,
      Employee_id,
      email: email.toLowerCase().trim(),
      phone: '0000000000', // Default phone, can be updated later
      password,
      gender: 'Other',
      isLoginPermission: true,
      Status: true
    });

    const savedUser = await user.save();

    // Generate JWT token for immediate login
    // Generate JWT token - if rememberMe is true, token lasts 30 days
    const token = generateToken(savedUser, rememberMe || false);

    // Prepare response without sensitive data
    const userResponse = {
      user_id: savedUser.user_id,
      businessName: savedUser.Name,
      email: savedUser.email,
      Employee_id: savedUser.Employee_id,
      Role_id: defaultRole.Role_id,
      role_name: defaultRole.role_name,
      isLoginPermission: savedUser.isLoginPermission,
      Status: savedUser.Status,
      CreateAt: savedUser.CreateAt
    };

    logger.info(`Restaurant registered successfully - user_id: ${savedUser.user_id}, email: ${savedUser.email}, businessName: ${businessName}`);

    res.status(201).json({
      success: true,
      message: 'Restaurant registered successfully',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error(`Restaurant registration error: ${error.message}`);
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      let message = `${field} already exists`;

      if (field === 'email') {
        message = `Email "${value}" is already registered`;
      } else if (field === 'Employee_id') {
        message = `Employee ID "${value}" already exists`;
      }

      return res.status(400).json({
        success: false,
        message: message,
        error: message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering restaurant',
      error: error.message
    });
  }
};



module.exports = {
  loginUser,
  loginRestaurant,
  loginEmployee,
  loginAdmin,
  logoutUser,
  changePassword,
  registerRestaurant
};
