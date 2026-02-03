const wallet = require('../models/wallet.model');
const User = require('../models/User.model');

// Create Wallet
const createWallet = async (req, res) => {
  try {
    const {
      Amount,
      Status
    } = req.body;

    const walletData = new wallet({
      Amount: Amount || 0,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedWallet = await walletData.save();
    
    // Manually fetch related data
    const createByUser = savedWallet.CreateBy ? 
      await User.findOne({ user_id: savedWallet.CreateBy }) : null;

    // Create response object with populated data
    const walletResponse = savedWallet.toObject();
    walletResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Wallet created successfully',
      data: walletResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating wallet',
      error: error.message
    });
  }
};

// Update All Wallets
const updateAllWallets = async (req, res) => {
  try {
    const { wallets } = req.body;
    const userId = req.user.user_id;

    if (!wallets || !Array.isArray(wallets)) {
      return res.status(400).json({
        success: false,
        message: 'Wallets array is required in request body'
      });
    }

    const savedWallets = [];
    for (const walletData of wallets) {
      const newWallet = new wallet({
        Amount: walletData.Amount || 0,
        Status: walletData.Status !== undefined ? walletData.Status : true,
        CreateBy: userId
      });
      const savedWallet = await newWallet.save();
      savedWallets.push(savedWallet);
    }

    // Manually fetch related data for all wallets
    const walletsResponse = await Promise.all(savedWallets.map(async (walletData) => {
      const createByUser = walletData.CreateBy ? 
        await User.findOne({ user_id: walletData.CreateBy }) : null;

      const walletObj = walletData.toObject();
      walletObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return walletObj;
    }));

    res.status(201).json({
      success: true,
      message: 'All wallets created successfully',
      count: walletsResponse.length,
      data: walletsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating all wallets',
      error: error.message
    });
  }
};

// Update Wallet
const updateWallet = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Wallet ID is required in request body'
      });
    }

    const walletData = await wallet.findOne({ wallet_id: parseInt(id) });
    if (!walletData) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'wallet_id') {
        walletData[key] = updateData[key];
      }
    });

    walletData.UpdatedBy = userId;
    walletData.UpdatedAt = new Date();

    const updatedWallet = await walletData.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedWallet.CreateBy ? User.findOne({ user_id: updatedWallet.CreateBy }) : null,
      updatedWallet.UpdatedBy ? User.findOne({ user_id: updatedWallet.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const walletResponse = updatedWallet.toObject();
    walletResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    walletResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Wallet updated successfully',
      data: walletResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating wallet',
      error: error.message
    });
  }
};

// Get Wallet by ID
const getWalletById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const walletData = await wallet.findOne({ wallet_id: parseInt(id) });
    
    if (!walletData) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      walletData.CreateBy ? User.findOne({ user_id: walletData.CreateBy }) : null,
      walletData.UpdatedBy ? User.findOne({ user_id: walletData.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const walletResponse = walletData.toObject();
    walletResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    walletResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: walletResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet',
      error: error.message
    });
  }
};

// Get All Wallets
const getAllWallets = async (req, res) => {
  try {
    const wallets = await wallet.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all wallets
    const walletsResponse = await Promise.all(wallets.map(async (walletData) => {
      const createByUser = walletData.CreateBy ? 
        await User.findOne({ user_id: walletData.CreateBy }) : null;

      const walletObj = walletData.toObject();
      walletObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return walletObj;
    }));

    res.status(200).json({
      success: true,
      count: walletsResponse.length,
      data: walletsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallets',
      error: error.message
    });
  }
};

// Get Wallet by Auth (current logged in user)
const getWalletByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const wallets = await wallet.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!wallets || wallets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wallets not found for current user'
      });
    }

    // Manually fetch related data for all wallets
    const walletsResponse = await Promise.all(wallets.map(async (walletData) => {
      const [createByUser, updatedByUser] = await Promise.all([
        walletData.CreateBy ? User.findOne({ user_id: walletData.CreateBy }) : null,
        walletData.UpdatedBy ? User.findOne({ user_id: walletData.UpdatedBy }) : null
      ]);

      const walletObj = walletData.toObject();
      walletObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      walletObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return walletObj;
    }));

    res.status(200).json({
      success: true,
      count: walletsResponse.length,
      data: walletsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallets',
      error: error.message
    });
  }
};

module.exports = {
  createWallet,
  updateAllWallets,
  updateWallet,
  getWalletById,
  getAllWallets,
  getWalletByAuth
};
