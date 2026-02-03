const Country = require('../models/Country.model');
const User = require('../models/User.model');

// Create Country
const createCountry = async (req, res) => {
  try {
    const { Country_name, code, Status } = req.body;
    const userId = req.user.user_id;

    const country = new Country({
      Country_name,
      code,
      Status,
      CreateBy: userId
    });

    const savedCountry = await country.save();
    
    res.status(201).json({
      success: true,
      message: 'Country created successfully',
      data: savedCountry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating country',
      error: error.message
    });
  }
};

// Update Country
const updateCountry = async (req, res) => {
  try {
    const { id, Country_name, code, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Country ID is required in request body'
      });
    }

    const country = await Country.findOne({ Country_id: parseInt(id) });
    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    if (Country_name) country.Country_name = Country_name;
    if (code) country.code = code;
    if (Status !== undefined) country.Status = Status;
    
    country.UpdatedBy = userId;
    country.UpdatedAt = new Date();

    const updatedCountry = await country.save();
    
    res.status(200).json({
      success: true,
      message: 'Country updated successfully',
      data: updatedCountry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating country',
      error: error.message
    });
  }
};

// Get Country by ID
const getCountryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const country = await Country.findOne({ Country_id: parseInt(id) });
    
    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      country.CreateBy ? User.findOne({ user_id: country.CreateBy }) : null,
      country.UpdatedBy ? User.findOne({ user_id: country.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const countryResponse = country.toObject();
    countryResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    countryResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: countryResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching country',
      error: error.message
    });
  }
};

// Get All Countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all countries
    const countriesWithPopulatedData = await Promise.all(
      countries.map(async (country) => {
        const [createByUser, updatedByUser] = await Promise.all([
          country.CreateBy ? User.findOne({ user_id: country.CreateBy }) : null,
          country.UpdatedBy ? User.findOne({ user_id: country.UpdatedBy }) : null
        ]);

        const countryResponse = country.toObject();
        countryResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        countryResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return countryResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: countriesWithPopulatedData.length,
      data: countriesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching countries',
      error: error.message
    });
  }
};

// Delete Country
const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const country = await Country.findOne({ Country_id: parseInt(id) });
    
    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    await Country.deleteOne({ Country_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Country deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting country',
      error: error.message
    });
  }
};

// Get Country by Auth (current logged in user)
const getCountryByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const countries = await Country.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!countries || countries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Countries not found for current user'
      });
    }

    // Manually fetch related data for all countries
    const countriesResponse = await Promise.all(countries.map(async (country) => {
      const [createByUser, updatedByUser] = await Promise.all([
        country.CreateBy ? User.findOne({ user_id: country.CreateBy }) : null,
        country.UpdatedBy ? User.findOne({ user_id: country.UpdatedBy }) : null
      ]);

      const countryObj = country.toObject();
      countryObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      countryObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return countryObj;
    }));

    res.status(200).json({
      success: true,
      count: countriesResponse.length,
      data: countriesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching countries',
      error: error.message
    });
  }
};

module.exports = {
  createCountry,
  updateCountry,
  getCountryById,
  getAllCountries,
  getCountryByAuth,
  deleteCountry
};
