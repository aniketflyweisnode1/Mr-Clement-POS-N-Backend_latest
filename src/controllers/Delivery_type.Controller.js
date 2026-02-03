const Delivery_type = require('../models/Delivery_type.model');
const User = require('../models/User.model');

// Create delivery type
const createDeliveryType = async (req, res) => {
  try {
    console.log(req.body);
    const { Type_name, Status } = req.body;
    const userId = req.user.user_id;

    const deliveryType = new Delivery_type({
      Type_name,
      Status,
      CreateBy: userId
    });

    const savedDeliveryType = await deliveryType.save();
    
    res.status(201).json({
      success: true,
      message: 'Delivery type created successfully',
      data: savedDeliveryType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating delivery type',
      error: error.message
    });
  }
};

// Update delivery type
const updateDeliveryType = async (req, res) => {
  try {
    const { id, Type_name, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Delivery type ID is required in request body'
      });
    }

    const deliveryType = await Delivery_type.findOne({ Delivery_type_id: parseInt(id) });
    if (!deliveryType) {
      return res.status(404).json({
        success: false,
        message: 'Delivery type not found'
      });
    }

    if (Type_name !== undefined) deliveryType.Type_name = Type_name;
    if (Status !== undefined) deliveryType.Status = Status;
    
    deliveryType.UpdatedBy = userId;
    deliveryType.UpdatedAt = new Date();

    const updatedDeliveryType = await deliveryType.save();
    
    res.status(200).json({
      success: true,
      message: 'Delivery type updated successfully',
      data: updatedDeliveryType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating delivery type',
      error: error.message
    });
  }
};

// Get delivery type by ID
const getDeliveryTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryType = await Delivery_type.findOne({ Delivery_type_id: parseInt(id) });
    
    if (!deliveryType) {
      return res.status(404).json({
        success: false,
        message: 'Delivery type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      deliveryType.CreateBy ? User.findOne({ user_id: deliveryType.CreateBy }) : null,
      deliveryType.UpdatedBy ? User.findOne({ user_id: deliveryType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const deliveryTypeResponse = deliveryType.toObject();
    deliveryTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    deliveryTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: deliveryTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery type',
      error: error.message
    });
  }
};

// Get all delivery types
const getAllDeliveryTypes = async (req, res) => {
  try {
    const deliveryTypes = await Delivery_type.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all delivery types
    const deliveryTypesWithPopulatedData = await Promise.all(
      deliveryTypes.map(async (deliveryType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          deliveryType.CreateBy ? User.findOne({ user_id: deliveryType.CreateBy }) : null,
          deliveryType.UpdatedBy ? User.findOne({ user_id: deliveryType.UpdatedBy }) : null
        ]);

        const deliveryTypeResponse = deliveryType.toObject();
        deliveryTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        deliveryTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return deliveryTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: deliveryTypesWithPopulatedData.length,
      data: deliveryTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery types',
      error: error.message
    });
  }
};

// Get delivery types by authenticated user
const getDeliveryTypesByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const deliveryTypes = await Delivery_type.find({ CreateBy: userId })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all delivery types
    const deliveryTypesWithPopulatedData = await Promise.all(
      deliveryTypes.map(async (deliveryType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          deliveryType.CreateBy ? User.findOne({ user_id: deliveryType.CreateBy }) : null,
          deliveryType.UpdatedBy ? User.findOne({ user_id: deliveryType.UpdatedBy }) : null
        ]);

        const deliveryTypeResponse = deliveryType.toObject();
        deliveryTypeResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        deliveryTypeResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return deliveryTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: deliveryTypesWithPopulatedData.length,
      data: deliveryTypesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery types by auth',
      error: error.message
    });
  }
};

// Delete Delivery Type
const deleteDeliveryType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryType = await Delivery_type.findOne({ Delivery_type_id: parseInt(id) });
    
    if (!deliveryType) {
      return res.status(404).json({
        success: false,
        message: 'Delivery type not found'
      });
    }

    await Delivery_type.deleteOne({ Delivery_type_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Delivery type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting delivery type',
      error: error.message
    });
  }
};

module.exports = {
  createDeliveryType,
  updateDeliveryType,
  getDeliveryTypeById,
  getAllDeliveryTypes,
  getDeliveryTypesByAuth,
  deleteDeliveryType
};
