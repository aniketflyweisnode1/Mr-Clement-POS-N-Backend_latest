const Customer_type = require('../models/Customer_type.model');
const User = require('../models/User.model');

// Create customer type
const createCustomerType = async (req, res) => {
  try {
    console.log(req.body);
    const { type, Status } = req.body;
    const userId = req.user.user_id;

    const customerType = new Customer_type({
      type,
      Status,
      CreateBy: userId
    });

    const savedCustomerType = await customerType.save();
    
    res.status(201).json({
      success: true,
      message: 'Customer type created successfully',
      data: savedCustomerType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating customer type',
      error: error.message
    });
  }
};

// Update customer type
const updateCustomerType = async (req, res) => {
  try {
    const { id, type, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Customer type ID is required in request body'
      });
    }

    const customerType = await Customer_type.findOne({ Customer_type_id: parseInt(id) });
    if (!customerType) {
      return res.status(404).json({
        success: false,
        message: 'Customer type not found'
      });
    }

    if (type !== undefined) customerType.type = type;
    if (Status !== undefined) customerType.Status = Status;
    
    customerType.UpdatedBy = userId;
    customerType.UpdatedAt = new Date();

    const updatedCustomerType = await customerType.save();
    
    res.status(200).json({
      success: true,
      message: 'Customer type updated successfully',
      data: updatedCustomerType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating customer type',
      error: error.message
    });
  }
};

// Get customer type by ID
const getCustomerTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customerType = await Customer_type.findOne({ Customer_type_id: parseInt(id) });
    
    if (!customerType) {
      return res.status(404).json({
        success: false,
        message: 'Customer type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      customerType.CreateBy ? User.findOne({ user_id: customerType.CreateBy }) : null,
      customerType.UpdatedBy ? User.findOne({ user_id: customerType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const customerTypeResponse = customerType.toObject();
    customerTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    customerTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: customerTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer type',
      error: error.message
    });
  }
};

// Get all customer types
const getAllCustomerTypes = async (req, res) => {
  try {
    const customerTypes = await Customer_type.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all customer types
    const customerTypesWithPopulatedData = await Promise.all(
      customerTypes.map(async (customerType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          customerType.CreateBy ? User.findOne({ user_id: customerType.CreateBy }) : null,
          customerType.UpdatedBy ? User.findOne({ user_id: customerType.UpdatedBy }) : null
        ]);

        const customerTypeResponse = customerType.toObject();
        customerTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        customerTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return customerTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: customerTypesWithPopulatedData.length,
      data: customerTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer types',
      error: error.message
    });
  }
};

// Delete Customer Type
const deleteCustomerType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customerType = await Customer_type.findOne({ Customer_type_id: parseInt(id) });
    
    if (!customerType) {
      return res.status(404).json({
        success: false,
        message: 'Customer type not found'
      });
    }

    await Customer_type.deleteOne({ Customer_type_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Customer type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting customer type',
      error: error.message
    });
  }
};

// Get Customer Type by Auth (current logged in user)
const getCustomerTypeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const customerTypes = await Customer_type.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!customerTypes || customerTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer types not found for current user'
      });
    }

    // Manually fetch related data for all customer types
    const customerTypesResponse = await Promise.all(customerTypes.map(async (customerType) => {
      const [createByUser, updatedByUser] = await Promise.all([
        customerType.CreateBy ? User.findOne({ user_id: customerType.CreateBy }) : null,
        customerType.UpdatedBy ? User.findOne({ user_id: customerType.UpdatedBy }) : null
      ]);

      const customerTypeObj = customerType.toObject();
      customerTypeObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      customerTypeObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return customerTypeObj;
    }));

    res.status(200).json({
      success: true,
      count: customerTypesResponse.length,
      data: customerTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer types',
      error: error.message
    });
  }
};

module.exports = {
  createCustomerType,
  updateCustomerType,
  getCustomerTypeById,
  getAllCustomerTypes,
  getCustomerTypeByAuth,
  deleteCustomerType
};
