const City = require('../models/City.model');
const User = require('../models/User.model');
const State = require('../models/State.model');

// Create City
const createCity = async (req, res) => {
  try {
    const { State_id, City_name, Code, Status } = req.body;
    const userId = req.user.user_id;

    const city = new City({
      State_id,
      City_name,
      Code,
      Status,
      CreateBy: userId
    });

    const savedCity = await city.save();
    
    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: savedCity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating city',
      error: error.message
    });
  }
};

// Update City
const updateCity = async (req, res) => {
  try {
    const { id, State_id, City_name, Code, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'City ID is required in request body'
      });
    }

    const city = await City.findOne({ City_id: parseInt(id) });
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    if (State_id) city.State_id = State_id;
    if (City_name) city.City_name = City_name;
    if (Code) city.Code = Code;
    if (Status !== undefined) city.Status = Status;
    
    city.UpdatedBy = userId;
    city.UpdatedAt = new Date();

    const updatedCity = await city.save();
    
    res.status(200).json({
      success: true,
      message: 'City updated successfully',
      data: updatedCity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating city',
      error: error.message
    });
  }
};

// Get City by ID
const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const city = await City.findOne({ City_id: parseInt(id) });
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    // Manually fetch related data
    const [state, createByUser, updatedByUser] = await Promise.all([
      State.findOne({ State_id: city.State_id }),
      city.CreateBy ? User.findOne({ user_id: city.CreateBy }) : null,
      city.UpdatedBy ? User.findOne({ user_id: city.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const cityResponse = city.toObject();
    cityResponse.State_id = state ? { State_id: state.State_id, state_name: state.state_name, Code: state.Code } : null;
    cityResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    cityResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: cityResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching city',
      error: error.message
    });
  }
};

// Get All Cities
const getAllCities = async (req, res) => {
  try {
    const cities = await City.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all cities
    const citiesWithPopulatedData = await Promise.all(
      cities.map(async (city) => {
        const [state, createByUser, updatedByUser] = await Promise.all([
          State.findOne({ State_id: city.State_id }),
          city.CreateBy ? User.findOne({ user_id: city.CreateBy }) : null,
          city.UpdatedBy ? User.findOne({ user_id: city.UpdatedBy }) : null
        ]);

        const cityResponse = city.toObject();
        cityResponse.State_id = state ? { State_id: state.State_id, state_name: state.state_name, Code: state.Code } : null;
        cityResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        cityResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return cityResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: citiesWithPopulatedData.length,
      data: citiesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.message
    });
  }
};

// Get Cities by State ID
const getCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    
    if (!stateId || isNaN(parseInt(stateId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid state ID is required'
      });
    }
    
    const cities = await City.find({ 
      State_id: parseInt(stateId), 
      Status: true 
    })
    .sort({ City_name: 1 });

    // Manually fetch related data for all cities
    const citiesWithPopulatedData = await Promise.all(
      cities.map(async (city) => {
        const [state, createByUser, updatedByUser] = await Promise.all([
          State.findOne({ State_id: city.State_id }),
          city.CreateBy ? User.findOne({ user_id: city.CreateBy }) : null,
          city.UpdatedBy ? User.findOne({ user_id: city.UpdatedBy }) : null
        ]);

        const cityResponse = city.toObject();
        cityResponse.State_id = state ? { State_id: state.State_id, state_name: state.state_name, Code: state.Code } : null;
        cityResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        cityResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return cityResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: citiesWithPopulatedData.length,
      data: citiesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities by state',
      error: error.message
    });
  }
};

// Delete City
const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const city = await City.findOne({ City_id: parseInt(id) });
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    await City.deleteOne({ City_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting city',
      error: error.message
    });
  }
};

// Get City by Auth (current logged in user)
const getCityByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const cities = await City.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!cities || cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cities not found for current user'
      });
    }

    // Manually fetch related data for all cities
    const citiesResponse = await Promise.all(cities.map(async (city) => {
      const [createByUser, updatedByUser] = await Promise.all([
        city.CreateBy ? User.findOne({ user_id: city.CreateBy }) : null,
        city.UpdatedBy ? User.findOne({ user_id: city.UpdatedBy }) : null
      ]);

      const cityObj = city.toObject();
      cityObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      cityObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return cityObj;
    }));

    res.status(200).json({
      success: true,
      count: citiesResponse.length,
      data: citiesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.message
    });
  }
};

module.exports = {
  createCity,
  updateCity,
  getCityById,
  getAllCities,
  getCitiesByState,
  getCityByAuth,
  deleteCity
};
