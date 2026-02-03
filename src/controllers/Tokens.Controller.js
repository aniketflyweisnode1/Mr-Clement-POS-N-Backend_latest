const Tokens = require('../models/Tokens.model');
const User = require('../models/User.model');

// Create token
const createToken = async (req, res) => {
  try {
    console.log(req.body);
    const { Token_no, TokenName, Details, Status } = req.body;
    const userId = req.user.user_id;

    const token = new Tokens({
      Token_no,
      TokenName,
      Details,
      Status,
      CreateBy: userId
    });

    const savedToken = await token.save();
    
    res.status(201).json({
      success: true,
      message: 'Token created successfully',
      data: savedToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating token',
      error: error.message
    });
  }
};

// Update token
const updateToken = async (req, res) => {
  try {
    const { id, Token_no, TokenName, Details, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Token ID is required in request body'
      });
    }

    const token = await Tokens.findOne({ Token_id: parseInt(id) });
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    if (Token_no !== undefined) token.Token_no = Token_no;
    if (TokenName !== undefined) token.TokenName = TokenName;
    if (Details !== undefined) token.Details = Details;
    if (Status !== undefined) token.Status = Status;
    
    token.UpdatedBy = userId;
    token.UpdatedAt = new Date();

    const updatedToken = await token.save();
    
    res.status(200).json({
      success: true,
      message: 'Token updated successfully',
      data: updatedToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating token',
      error: error.message
    });
  }
};

// Get token by ID
const getTokenById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const token = await Tokens.findOne({ Token_id: parseInt(id) });
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      token.CreateBy ? User.findOne({ user_id: token.CreateBy }) : null,
      token.UpdatedBy ? User.findOne({ user_id: token.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const tokenResponse = token.toObject();
    tokenResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    tokenResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: tokenResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching token',
      error: error.message
    });
  }
};

// Get all tokens
const getAllTokens = async (req, res) => {
  try {
    const tokens = await Tokens.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all tokens
    const tokensWithPopulatedData = await Promise.all(
      tokens.map(async (token) => {
        const [createByUser, updatedByUser] = await Promise.all([
          token.CreateBy ? User.findOne({ user_id: token.CreateBy }) : null,
          token.UpdatedBy ? User.findOne({ user_id: token.UpdatedBy }) : null
        ]);

        const tokenResponse = token.toObject();
        tokenResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        tokenResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return tokenResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: tokensWithPopulatedData.length,
      data: tokensWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tokens',
      error: error.message
    });
  }
};

// Get tokens by authenticated user
const getTokensByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const tokens = await Tokens.find({ CreateBy: userId })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all tokens
    const tokensWithPopulatedData = await Promise.all(
      tokens.map(async (token) => {
        const [createByUser, updatedByUser] = await Promise.all([
          token.CreateBy ? User.findOne({ user_id: token.CreateBy }) : null,
          token.UpdatedBy ? User.findOne({ user_id: token.UpdatedBy }) : null
        ]);

        const tokenResponse = token.toObject();
        tokenResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        tokenResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return tokenResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: tokensWithPopulatedData.length,
      data: tokensWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tokens by auth',
      error: error.message
    });
  }
};

// Delete token
const deleteToken = async (req, res) => {
  try {
    const { id } = req.params;
    
    const token = await Tokens.findOne({ Token_id: parseInt(id) });
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    await Tokens.deleteOne({ Token_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Token deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting token',
      error: error.message
    });
  }
};

module.exports = {
  createToken,
  updateToken,
  getTokenById,
  getAllTokens,
  getTokensByAuth,
  deleteToken
};
