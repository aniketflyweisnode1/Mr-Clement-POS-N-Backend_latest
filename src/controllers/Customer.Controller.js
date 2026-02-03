const Customer = require('../models/Customer.model');
const User = require('../models/User.model');
const Table = require('../models/Table.model');
const Customer_type = require('../models/Customer_type.model');

// Create customer
const createCustomer = async (req, res) => {
  try {
    const { phone, Name, DOB, Customer_type_id, Table_id, Address, Notes, Status } = req.body;
    const userId = req.user.user_id;

    const customer = new Customer({
      phone,
      Name,
      DOB,
      Customer_type_id,
      Table_id,
      Address,
      Notes,
      Status,
      CreateBy: userId
    });

    const savedCustomer = await customer.save();
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: savedCustomer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id, phone, Name, DOB, Customer_type_id, Table_id, Address, Notes, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required in request body'
      });
    }

    const customer = await Customer.findOne({ Customer_id: parseInt(id) });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (phone !== undefined) customer.phone = phone;
    if (Name !== undefined) customer.Name = Name;
    if (DOB !== undefined) customer.DOB = DOB;
    if (Customer_type_id !== undefined) customer.Customer_type_id = Customer_type_id;
    if (Table_id !== undefined) customer.Table_id = Table_id;
    if (Address !== undefined) customer.Address = Address;
    if (Notes !== undefined) customer.Notes = Notes;
    if (Status !== undefined) customer.Status = Status;
    
    customer.UpdatedBy = userId;
    customer.UpdatedAt = new Date();

    const updatedCustomer = await customer.save();
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findOne({ Customer_id: parseInt(id) });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, table, customerType] = await Promise.all([
      customer.CreateBy ? User.findOne({ user_id: customer.CreateBy }) : null,
      customer.UpdatedBy ? User.findOne({ user_id: customer.UpdatedBy }) : null,
      customer.Table_id ? Table.findOne({ table_id: customer.Table_id }) : null,
      customer.Customer_type_id ? Customer_type.findOne({ Customer_type_id: customer.Customer_type_id }) : null
    ]);

    // Create response object with populated data
    const customerResponse = customer.toObject();
    customerResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    customerResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    customerResponse.Table = table ? { table_id: table.table_id, table_name: table.table_name } : null;
            customerResponse.CustomerType = customerType ? { Customer_type_id: customerType.Customer_type_id, type: customerType.type } : null;

    res.status(200).json({
      success: true,
      data: customerResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all customers
    const customersWithPopulatedData = await Promise.all(
      customers.map(async (customer) => {
        const [createByUser, updatedByUser, table, customerType] = await Promise.all([
          customer.CreateBy ? User.findOne({ user_id: customer.CreateBy }) : null,
          customer.UpdatedBy ? User.findOne({ user_id: customer.UpdatedBy }) : null,
          customer.Table_id ? Table.findOne({ table_id: customer.Table_id }) : null,
          customer.Customer_type_id ? Customer_type.findOne({ Customer_type_id: customer.Customer_type_id }) : null
        ]);

        const customerResponse = customer.toObject();
        customerResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        customerResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        customerResponse.Table = table ? { table_id: table.table_id, table_name: table.table_name } : null;
        customerResponse.CustomerType = customerType ? { Customer_type_id: customerType.Customer_type_id, type: customerType.type } : null;

        return customerResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: customersWithPopulatedData.length,
      data: customersWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findOne({ Customer_id: parseInt(id) });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await Customer.deleteOne({ Customer_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// Get Customer by Auth (current logged in user)
const getCustomerByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const customers = await Customer.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customers not found for current user'
      });
    }

    // Manually fetch related data for all customers
    const customersResponse = await Promise.all(customers.map(async (customer) => {
      const [createByUser, updatedByUser] = await Promise.all([
        customer.CreateBy ? User.findOne({ user_id: customer.CreateBy }) : null,
        customer.UpdatedBy ? User.findOne({ user_id: customer.UpdatedBy }) : null
      ]);

      const customerObj = customer.toObject();
      customerObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      customerObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return customerObj;
    }));

    res.status(200).json({
      success: true,
      count: customersResponse.length,
      data: customersResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  getCustomerById,
  getAllCustomers,
  getCustomerByAuth,
  deleteCustomer
};
