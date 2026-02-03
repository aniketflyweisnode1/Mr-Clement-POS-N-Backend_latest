const State = require('../models/State.model');
const User = require('../models/User.model');
const Country = require('../models/Country.model');

// Create State
const createState = async (req, res) => {
  try {
    const { Country_id, state_name, Code, Status } = req.body;
    const userId = req.user.user_id;

    const state = new State({
      Country_id,
      state_name,
      Code,
      Status,
      CreateBy: userId
    });

    const savedState = await state.save();
    
    res.status(201).json({
      success: true,
      message: 'State created successfully',
      data: savedState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating state',
      error: error.message
    });
  }
};

// Update State
const updateState = async (req, res) => {
  try {
    const { id, Country_id, state_name, Code, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'State ID is required in request body'
      });
    }

    const state = await State.findOne({ State_id: parseInt(id) });
    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    if (Country_id) state.Country_id = Country_id;
    if (state_name) state.state_name = state_name;
    if (Code) state.Code = Code;
    if (Status !== undefined) state.Status = Status;
    
    state.UpdatedBy = userId;
    state.UpdatedAt = new Date();

    const updatedState = await state.save();
    
    res.status(200).json({
      success: true,
      message: 'State updated successfully',
      data: updatedState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating state',
      error: error.message
    });
  }
};

// Get State by ID
const getStateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const state = await State.findOne({ State_id: parseInt(id) });
    
    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    // Manually fetch related data
    const [country, createByUser, updatedByUser] = await Promise.all([
      Country.findOne({ Country_id: state.Country_id }),
      state.CreateBy ? User.findOne({ user_id: state.CreateBy }) : null,
      state.UpdatedBy ? User.findOne({ user_id: state.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const stateResponse = state.toObject();
    stateResponse.Country_id = country ? { Country_id: country.Country_id, Country_name: country.Country_name, code: country.code } : null;
    stateResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    stateResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: stateResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching state',
      error: error.message
    });
  }
};

// Get All States
const getAllStates = async (req, res) => {
  try {
    const states = await State.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all states
    const statesWithPopulatedData = await Promise.all(
      states.map(async (state) => {
        const [country, createByUser, updatedByUser] = await Promise.all([
          Country.findOne({ Country_id: state.Country_id }),
          state.CreateBy ? User.findOne({ user_id: state.CreateBy }) : null,
          state.UpdatedBy ? User.findOne({ user_id: state.UpdatedBy }) : null
        ]);

        const stateResponse = state.toObject();
        stateResponse.Country_id = country ? { Country_id: country.Country_id, Country_name: country.Country_name, code: country.code } : null;
        stateResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        stateResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return stateResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: statesWithPopulatedData.length,
      data: statesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states',
      error: error.message
    });
  }
};

// Get States by Country ID
const getStatesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    
    const states = await State.find({ 
      Country_id: countryId
    })
    .sort({ state_name: 1 });

    // Manually fetch related data for all states
    const statesWithPopulatedData = await Promise.all(
      states.map(async (state) => {
        const [country, createByUser, updatedByUser] = await Promise.all([
          Country.findOne({ Country_id: state.Country_id }),
          state.CreateBy ? User.findOne({ user_id: state.CreateBy }) : null,
          state.UpdatedBy ? User.findOne({ user_id: state.UpdatedBy }) : null
        ]);

        const stateResponse = state.toObject();
        stateResponse.Country_id = country ? { Country_id: country.Country_id, Country_name: country.Country_name, code: country.code } : null;
        stateResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        stateResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return stateResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: statesWithPopulatedData.length,
      data: statesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states by country',
      error: error.message
    });
  }
};

// Delete State
const deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    
    const state = await State.findOne({ State_id: parseInt(id) });
    
    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    await State.deleteOne({ State_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'State deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting state',
      error: error.message
    });
  }
};

// Get State by Auth (current logged in user)
const getStateByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const states = await State.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!states || states.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'States not found for current user'
      });
    }

    // Manually fetch related data for all states
    const statesResponse = await Promise.all(states.map(async (state) => {
      const [createByUser, updatedByUser] = await Promise.all([
        state.CreateBy ? User.findOne({ user_id: state.CreateBy }) : null,
        state.UpdatedBy ? User.findOne({ user_id: state.UpdatedBy }) : null
      ]);

      const stateObj = state.toObject();
      stateObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      stateObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return stateObj;
    }));

    res.status(200).json({
      success: true,
      count: statesResponse.length,
      data: statesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states',
      error: error.message
    });
  }
};

module.exports = {
  createState,
  updateState,
  getStateById,
  getAllStates,
  getStatesByCountry,
  getStateByAuth,
  deleteState
};
