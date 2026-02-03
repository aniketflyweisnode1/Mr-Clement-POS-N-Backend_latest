const currency = require('../models/currency.model');
const User = require('../models/User.model');

// Create Currency
const createCurrency = async (req, res) => {
  try {
    const {
      name,
      icon,
      Status
    } = req.body;

    const currencyData = new currency({
      name,
      icon,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedCurrency = await currencyData.save();
    
    // Manually fetch related data
    const createByUser = savedCurrency.CreateBy ? 
      await User.findOne({ user_id: savedCurrency.CreateBy }) : null;

    // Create response object with populated data
    const currencyResponse = savedCurrency.toObject();
    currencyResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Currency created successfully',
      data: currencyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating currency',
      error: error.message
    });
  }
};

// Update Currency
const updateCurrency = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Currency ID is required in request body'
      });
    }

    const currencyData = await currency.findOne({ currency_id: parseInt(id) });
    if (!currencyData) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'currency_id') {
        currencyData[key] = updateData[key];
      }
    });

    currencyData.UpdatedBy = userId;
    currencyData.UpdatedAt = new Date();

    const updatedCurrency = await currencyData.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedCurrency.CreateBy ? User.findOne({ user_id: updatedCurrency.CreateBy }) : null,
      updatedCurrency.UpdatedBy ? User.findOne({ user_id: updatedCurrency.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const currencyResponse = updatedCurrency.toObject();
    currencyResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    currencyResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Currency updated successfully',
      data: currencyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating currency',
      error: error.message
    });
  }
};

// Get Currency by ID
const getCurrencyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const currencyData = await currency.findOne({ currency_id: parseInt(id) });
    
    if (!currencyData) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      currencyData.CreateBy ? User.findOne({ user_id: currencyData.CreateBy }) : null,
      currencyData.UpdatedBy ? User.findOne({ user_id: currencyData.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const currencyResponse = currencyData.toObject();
    currencyResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    currencyResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: currencyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching currency',
      error: error.message
    });
  }
};

// Get All Currencies
const getAllCurrencies = async (req, res) => {
  try {
    const currencies = await currency.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all currencies
    const currenciesResponse = await Promise.all(currencies.map(async (currencyData) => {
      const createByUser = currencyData.CreateBy ? 
        await User.findOne({ user_id: currencyData.CreateBy }) : null;

      const currencyObj = currencyData.toObject();
      currencyObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return currencyObj;
    }));

    res.status(200).json({
      success: true,
      count: currenciesResponse.length,
      data: currenciesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching currencies',
      error: error.message
    });
  }
};

// Get Currency by Auth (current logged in user)
const getCurrencyByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const currencies = await currency.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!currencies || currencies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Currencies not found for current user'
      });
    }

    // Manually fetch related data for all currencies
    const currenciesResponse = await Promise.all(currencies.map(async (currencyData) => {
      const [createByUser, updatedByUser] = await Promise.all([
        currencyData.CreateBy ? User.findOne({ user_id: currencyData.CreateBy }) : null,
        currencyData.UpdatedBy ? User.findOne({ user_id: currencyData.UpdatedBy }) : null
      ]);

      const currencyObj = currencyData.toObject();
      currencyObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      currencyObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return currencyObj;
    }));

    res.status(200).json({
      success: true,
      count: currenciesResponse.length,
      data: currenciesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching currencies',
      error: error.message
    });
  }
};
// Soft Delete Currency by currency_id
const deleteCurrency = async (req, res) => {
  try {
    const { id } = req.params; // currency_id
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Currency ID is required'
      });
    }

    const currencyData = await currency.findOne({
      currency_id: parseInt(id)
    });

    if (!currencyData) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    currencyData.Status = false;
    currencyData.UpdatedBy = userId;
    currencyData.UpdatedAt = new Date();

    await currencyData.save();

    res.status(200).json({
      success: true,
      message: 'Currency deleted successfully',
      data: {
        currency_id: currencyData.currency_id,
        name: currencyData.name,
        Status: currencyData.Status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting currency',
      error: error.message
    });
  }
};

// Hard Delete Currency by currency_id
const deleteCurrencyPermanently = async (req, res) => {
  try {
    const { id } = req.params; // currency_id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Currency ID is required'
      });
    }

    const deletedCurrency = await currency.findOneAndDelete({
      currency_id: parseInt(id)
    });

    if (!deletedCurrency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Currency permanently deleted',
      data: {
        currency_id: deletedCurrency.currency_id,
        name: deletedCurrency.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting currency',
      error: error.message
    });
  }
};


module.exports = {
  createCurrency,
  updateCurrency,
  getCurrencyById,
  getAllCurrencies,
  getCurrencyByAuth,
  deleteCurrency,
  deleteCurrencyPermanently
};
