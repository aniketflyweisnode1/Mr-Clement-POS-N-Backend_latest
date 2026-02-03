const Clients = require('../models/Clients.model');
const User = require('../models/User.model');
const Language = require('../models/Language.model');
const Currency = require('../models/currency.model');
const Responsibility = require('../models/Responsibility.model');
const Role = require('../models/Role.model');
const Country = require('../models/Country.model');
const State = require('../models/State.model');
const City = require('../models/City.model');
const Admin_Plan_buy_Restaurant = require('../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../models/Admin_Plan.model');

// Create Client
const createClient = async (req, res) => {
  try {
    const {
      Business_Name,
      Business_logo,
      Email,
      password,
      language,
      currency,
      type,
      Status
    } = req.body;

    const client = new Clients({
      Business_Name,
      Business_logo,
      Email,
      password,
      language: language || [],
      currency: currency || [],
      type,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedClient = await client.save();
    
    // Manually fetch related data
    const [createByUser, languages, currencies] = await Promise.all([
      savedClient.CreateBy ? User.findOne({ user_id: savedClient.CreateBy }) : null,
      savedClient.language.length > 0 ? Language.find({ Language_id: { $in: savedClient.language } }) : [],
      savedClient.currency.length > 0 ? Currency.find({ currency_id: { $in: savedClient.currency } }) : []
    ]);

    // Create response object with populated data
    const clientResponse = savedClient.toObject();
    clientResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    clientResponse.language = languages.map(lang => ({
      Language_id: lang.Language_id,
      Language_name: lang.Language_name
    }));
    clientResponse.currency = currencies.map(curr => ({
      currency_id: curr.currency_id,
      name: curr.name,
      icon: curr.icon
    }));
    
    // Remove password from response
    delete clientResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: clientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
};

// Active/Inactive Client Status
const activeInactiveClient = async (req, res) => {
  try {
    const { id, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required in request body'
      });
    }

    const client = await Clients.findOne({ Clients_id: parseInt(id) });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    client.Status = Status;
    client.UpdatedBy = userId;
    client.UpdatedAt = new Date();

    const updatedClient = await client.save();
    
    res.status(200).json({
      success: true,
      message: `Client ${Status ? 'activated' : 'deactivated'} successfully`,
      data: {
        Clients_id: updatedClient.Clients_id,
        Business_Name: updatedClient.Business_Name,
        Email: updatedClient.Email,
        Status: updatedClient.Status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating client status',
      error: error.message
    });
  }
};

// Update Client
const updateClient = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required in request body'
      });
    }

    const client = await Clients.findOne({ Clients_id: parseInt(id) });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Clients_id' && key !== 'password') {
        client[key] = updateData[key];
      }
    });

    // Handle password update separately
    if (updateData.password) {
      client.password = updateData.password;
    }

    client.UpdatedBy = userId;
    client.UpdatedAt = new Date();

    const updatedClient = await client.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser, languages, currencies] = await Promise.all([
      updatedClient.CreateBy ? User.findOne({ user_id: updatedClient.CreateBy }) : null,
      updatedClient.UpdatedBy ? User.findOne({ user_id: updatedClient.UpdatedBy }) : null,
      updatedClient.language.length > 0 ? Language.find({ Language_id: { $in: updatedClient.language } }) : [],
      updatedClient.currency.length > 0 ? Currency.find({ currency_id: { $in: updatedClient.currency } }) : []
    ]);

    // Create response object with populated data
    const clientResponse = updatedClient.toObject();
    clientResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    clientResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    clientResponse.language = languages.map(lang => ({
      Language_id: lang.Language_id,
      Language_name: lang.Language_name
    }));
    clientResponse.currency = currencies.map(curr => ({
      currency_id: curr.currency_id,
      name: curr.name,
      icon: curr.icon
    }));
    
    // Remove password from response
    delete clientResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: clientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
};

// Get Client by ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Clients.findOne({ Clients_id: parseInt(id) });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, languages, currencies] = await Promise.all([
      client.CreateBy ? User.findOne({ user_id: client.CreateBy }) : null,
      client.UpdatedBy ? User.findOne({ user_id: client.UpdatedBy }) : null,
      client.language.length > 0 ? Language.find({ Language_id: { $in: client.language } }) : [],
      client.currency.length > 0 ? Currency.find({ currency_id: { $in: client.currency } }) : []
    ]);

    // Get all employees for this client
    // Query employees linked to the client through client_id field or through CreateBy relationship
    let employees = [];
    try {
      // First, try to find employees with client_id field (if it exists in User model)
      employees = await User.find({ 
        $or: [
          { client_id: client.Clients_id },
          { Clients_id: client.Clients_id }
        ],
        Status: true 
      }).sort({ CreateAt: -1 });
      
      // If no employees found with client_id, try finding through CreateBy relationship
      // (employees created by users associated with this client)
      if (employees.length === 0 && client.CreateBy) {
        employees = await User.find({ 
          CreateBy: client.CreateBy,
          Status: true 
        }).sort({ CreateAt: -1 });
      }
    } catch (error) {
      // If client_id field doesn't exist, fall back to CreateBy relationship
      if (client.CreateBy) {
        employees = await User.find({ 
          CreateBy: client.CreateBy,
          Status: true 
        }).sort({ CreateAt: -1 });
      }
    }

    // Populate employee data
    const employeesResponse = await Promise.all(employees.map(async (employee) => {
      const [responsibility, role, language, country, state, city, createByUser] = await Promise.all([
        Responsibility.findOne({ Responsibility_id: employee.Responsibility_id }),
        Role.findOne({ Role_id: employee.Role_id }),
        Language.findOne({ Language_id: employee.Language_id }),
        Country.findOne({ Country_id: employee.Country_id }),
        State.findOne({ State_id: employee.State_id }),
        City.findOne({ City_id: employee.City_id }),
        employee.CreateBy ? User.findOne({ user_id: employee.CreateBy }) : null
      ]);

      const employeeObj = employee.toObject();
      employeeObj.Responsibility_id = responsibility ? { Responsibility_id: responsibility.Responsibility_id, Responsibility_name: responsibility.Responsibility_name } : null;
      employeeObj.Role_id = role ? { Role_id: role.Role_id, role_name: role.role_name } : null;
      employeeObj.Language_id = language ? { Language_id: language.Language_id, Language_name: language.Language_name } : null;
      employeeObj.Country_id = country ? { Country_id: country.Country_id, Country_name: country.Country_name, code: country.code } : null;
      employeeObj.State_id = state ? { State_id: state.State_id, state_name: state.state_name, Code: state.Code } : null;
      employeeObj.City_id = city ? { City_id: city.City_id, City_name: city.City_name, Code: city.Code } : null;
      employeeObj.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      delete employeeObj.password;
      return employeeObj;
    }));

    // Count employees by Role
    const employeeCountByRole = {};
    employees.forEach(employee => {
      const roleId = employee.Role_id;
      if (!employeeCountByRole[roleId]) {
        employeeCountByRole[roleId] = 0;
      }
      employeeCountByRole[roleId]++;
    });

    // Get role details and create count array
    const roleIds = Object.keys(employeeCountByRole).map(id => parseInt(id));
    const roles = await Role.find({ Role_id: { $in: roleIds } });
    
    const employeeCountByRoleResponse = roles.map(role => ({
      Role_id: role.Role_id,
      role_name: role.role_name,
      count: employeeCountByRole[role.Role_id] || 0
    }));

    // Create response object with populated data
    const clientResponse = client.toObject();
    clientResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    clientResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    clientResponse.language = languages.map(lang => ({
      Language_id: lang.Language_id,
      Language_name: lang.Language_name
    }));
    clientResponse.currency = currencies.map(curr => ({
      currency_id: curr.currency_id,
      name: curr.name,
      icon: curr.icon
    }));
    clientResponse.Employee = employeesResponse;
    clientResponse.EmployeeCountByRole = employeeCountByRoleResponse;

    // Remove password from response
    delete clientResponse.password;

    res.status(200).json({
      success: true,
      data: clientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
};

// Get All Clients
const getAllClients = async (req, res) => {
  try {
    const { filter } = req.query; // filter: all, active, repeat, inactive

    let query = { Status: true };
    let clients = [];

    // Get restaurant role
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    // Get all restaurant users
    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    const restaurantUserIds = restaurantUsers.map(u => u.user_id);
    const now = new Date();

    if (filter === 'active' || filter === 'inactive' || filter === 'repeat') {
      // For active/inactive/repeat, we need to check plan status
      const activeRestaurantIds = [];
      const inactiveRestaurantIds = [];
      const repeatRestaurantIds = [];

      for (const restaurant of restaurantUsers) {
        const plans = await Admin_Plan_buy_Restaurant.find({
          CreateBy: restaurant.user_id,
          paymentStatus: true,
          Status: true
        }).sort({ CreateAt: -1 });

        // Check if active
        let isActive = false;
        if (plans.length > 0) {
          const latestPlan = plans[0];
          if (latestPlan.isActive && latestPlan.expiry_date) {
            const expiryDate = new Date(latestPlan.expiry_date);
            if (expiryDate > now) {
              isActive = true;
            }
          } else if (latestPlan.isActive && !latestPlan.expiry_date) {
            isActive = true;
          }
        }

        // Check if repeat (more than 1 plan purchase)
        const isRepeat = plans.length > 1;

        if (isActive) {
          activeRestaurantIds.push(restaurant.user_id);
        } else {
          inactiveRestaurantIds.push(restaurant.user_id);
        }

        if (isRepeat) {
          repeatRestaurantIds.push(restaurant.user_id);
        }
      }

      // Get clients created by restaurants based on filter
      if (filter === 'active') {
        query.CreateBy = { $in: activeRestaurantIds };
      } else if (filter === 'inactive') {
        query.CreateBy = { $in: inactiveRestaurantIds };
      } else if (filter === 'repeat') {
        query.CreateBy = { $in: repeatRestaurantIds };
      }
    }

    // If filter is 'all' or not specified, get all clients
    clients = await Clients.find(query).sort({ CreateAt: -1 });

    // Calculate last year sales and orders
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const Pos_Point_sales_Order = require('../models/Pos_Point_sales_Order.model');
    const Quick_Order = require('../models/Quick_Order.model');

    // Manually fetch related data for all clients
    const clientsResponse = await Promise.all(clients.map(async (client) => {
      const [createByUser, languages, currencies] = await Promise.all([
        client.CreateBy ? User.findOne({ user_id: client.CreateBy }) : null,
        client.language.length > 0 ? Language.find({ Language_id: { $in: client.language } }) : [],
        client.currency.length > 0 ? Currency.find({ currency_id: { $in: client.currency } }) : []
      ]);

      // Get plan details
      let PlanDetails = null;
      if (client.CreateBy) {
        const activePlan = await Admin_Plan_buy_Restaurant.findOne({
          CreateBy: client.CreateBy,
          paymentStatus: true,
          isActive: true,
          Status: true
        }).sort({ expiry_date: -1 });

        if (activePlan) {
          const plan = await Admin_Plan.findOne({ Admin_Plan_id: activePlan.Admin_Plan_id });
          PlanDetails = plan ? {
            PlanName: plan.PlanName,
            Description: plan.Description,
            Price: plan.Price,
            RenewalDate: activePlan.expiry_date
          } : null;
        }
      }

      // Calculate last year sales and orders
      let lastYearSales = 0;
      let TotalOrdersLastYear = 0;

      if (client.CreateBy) {
        const restaurantId = client.CreateBy;
        
        // Get POS orders
        const posOrders = await Pos_Point_sales_Order.find({
          Restaurant_id: restaurantId,
          CreateAt: { $gte: oneYearAgo, $lt: now },
          Status: true
        });

        // Get employees
        const employees = await User.find({
          CreateBy: restaurantId,
          Status: true
        });
        const employeeIds = employees.map(e => e.user_id);

        // Get Quick orders
        const quickOrders = employeeIds.length > 0
          ? await Quick_Order.find({
              get_order_Employee_id: { $in: employeeIds },
              CreateAt: { $gte: oneYearAgo, $lt: now },
              Status: true
            })
          : [];

        lastYearSales = [...posOrders, ...quickOrders].reduce(
          (sum, order) => sum + (order.Total || 0),
          0
        );
        TotalOrdersLastYear = posOrders.length + quickOrders.length;
      }

      const clientObj = client.toObject();
      clientObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      clientObj.language = languages.map(lang => ({
        Language_id: lang.Language_id,
        Language_name: lang.Language_name
      }));
      clientObj.currency = currencies.map(curr => ({
        currency_id: curr.currency_id,
        name: curr.name,
        icon: curr.icon
      }));
      clientObj.PlanDetails = PlanDetails;
      clientObj.lastYearSales = parseFloat(lastYearSales.toFixed(2));
      clientObj.TotalOrdersLastYear = TotalOrdersLastYear;

      // Remove password from response
      delete clientObj.password;

      return clientObj;
    }));

    res.status(200).json({
      success: true,
      count: clientsResponse.length,
      data: clientsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
};

// Get Client by Auth (current logged in user)
const getClientByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const clients = await Clients.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!clients || clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clients not found for current user'
      });
    }

    // Manually fetch related data for all clients
    const clientsResponse = await Promise.all(clients.map(async (client) => {
      const [createByUser, updatedByUser, languages, currencies] = await Promise.all([
        client.CreateBy ? User.findOne({ user_id: client.CreateBy }) : null,
        client.UpdatedBy ? User.findOne({ user_id: client.UpdatedBy }) : null,
        client.language.length > 0 ? Language.find({ Language_id: { $in: client.language } }) : [],
        client.currency.length > 0 ? Currency.find({ currency_id: { $in: client.currency } }) : []
      ]);

      const clientObj = client.toObject();
      clientObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      clientObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
      clientObj.language = languages.map(lang => ({
        Language_id: lang.Language_id,
        Language_name: lang.Language_name
      }));
      clientObj.currency = currencies.map(curr => ({
        currency_id: curr.currency_id,
        name: curr.name,
        icon: curr.icon
      }));

      // Remove password from response
      delete clientObj.password;

      return clientObj;
    }));

    res.status(200).json({
      success: true,
      count: clientsResponse.length,
      data: clientsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
};

module.exports = {
  createClient,
  activeInactiveClient,
  updateClient,
  getClientById,
  getAllClients,
  getClientByAuth
};
