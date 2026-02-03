const Transaction = require('../models/Transaction.model');
const User = require('../models/User.model');

// Create Transaction
const createTransaction = async (req, res) => {
  try {
    const { 
      user_id, 
      amount, 
      status, 
      payment_method, 
      transactionType, 
      reference_number,
      CGST,
      SGST,
      TotalGST,
      bank_id,
      PaymentDetails_id
    } = req.body;
    const userId = req.user.user_id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'amount is required'
      });
    }

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: 'payment_method is required'
      });
    }

    // Set default transactionType if not provided
    const finalTransactionType = transactionType || 'Pending';

    // Verify user exists
    const user = await User.findOne({ user_id: parseInt(user_id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate TotalGST if not provided
    const calculatedTotalGST = TotalGST !== undefined ? TotalGST : (CGST || 0) + (SGST || 0);

    const transaction = new Transaction({
      user_id: parseInt(user_id),
      amount: parseFloat(amount),
      status: status || 'Pending',
      payment_method,
      transactionType: finalTransactionType,
      reference_number: reference_number || null,
      CGST: CGST || 0,
      SGST: SGST || 0,
      TotalGST: calculatedTotalGST,
      bank_id: bank_id ? parseInt(bank_id) : null,
      PaymentDetails_id: PaymentDetails_id ? parseInt(PaymentDetails_id) : null,
      isDownloaded: false,
      fileDownlodedPath: null,
      created_by: userId
    });

    const savedTransaction = await transaction.save();

    // Fetch related data
    const [createdByUser, transactionUser] = await Promise.all([
      User.findOne({ user_id: savedTransaction.created_by }),
      User.findOne({ user_id: savedTransaction.user_id })
    ]);

    const transactionResponse = savedTransaction.toObject();
    transactionResponse.created_by = createdByUser ? {
      user_id: createdByUser.user_id,
      Name: createdByUser.Name,
      email: createdByUser.email
    } : null;
    transactionResponse.user_id = transactionUser ? {
      user_id: transactionUser.user_id,
      Name: transactionUser.Name,
      email: transactionUser.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transactionResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

// Update Transaction
const updateTransaction = async (req, res) => {
  try {
    const { 
      id,
      user_id,
      amount,
      status,
      payment_method,
      transactionType,
      reference_number,
      CGST,
      SGST,
      TotalGST,
      bank_id,
      PaymentDetails_id,
      isDownloaded,
      fileDownlodedPath
    } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required in request body'
      });
    }

    const transaction = await Transaction.findOne({ 
      transagtion_id: parseInt(id) 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (user_id !== undefined) {
      const user = await User.findOne({ user_id: parseInt(user_id) });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      transaction.user_id = parseInt(user_id);
    }
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (status !== undefined) transaction.status = status;
    if (payment_method !== undefined) transaction.payment_method = payment_method;
    if (transactionType !== undefined) transaction.transactionType = transactionType;
    if (reference_number !== undefined) transaction.reference_number = reference_number;
    if (CGST !== undefined) transaction.CGST = CGST;
    if (SGST !== undefined) transaction.SGST = SGST;
    if (TotalGST !== undefined) {
      transaction.TotalGST = TotalGST;
    } else if (CGST !== undefined || SGST !== undefined) {
      // Recalculate TotalGST if CGST or SGST changed
      transaction.TotalGST = (transaction.CGST || 0) + (transaction.SGST || 0);
    }
    if (bank_id !== undefined) transaction.bank_id = bank_id ? parseInt(bank_id) : null;
    if (PaymentDetails_id !== undefined) transaction.PaymentDetails_id = PaymentDetails_id ? parseInt(PaymentDetails_id) : null;
    if (isDownloaded !== undefined) transaction.isDownloaded = isDownloaded;
    if (fileDownlodedPath !== undefined) transaction.fileDownlodedPath = fileDownlodedPath;
    
    transaction.updated_at = new Date();

    const updatedTransaction = await transaction.save();

    // Fetch related data
    const [createdByUser, transactionUser] = await Promise.all([
      User.findOne({ user_id: updatedTransaction.created_by }),
      User.findOne({ user_id: updatedTransaction.user_id })
    ]);

    const transactionResponse = updatedTransaction.toObject();
    transactionResponse.created_by = createdByUser ? {
      user_id: createdByUser.user_id,
      Name: createdByUser.Name,
      email: createdByUser.email
    } : null;
    transactionResponse.user_id = transactionUser ? {
      user_id: transactionUser.user_id,
      Name: transactionUser.Name,
      email: transactionUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transactionResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

// Get Transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ 
      transagtion_id: parseInt(id) 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Fetch related data
    const [createdByUser, transactionUser] = await Promise.all([
      User.findOne({ user_id: transaction.created_by }),
      User.findOne({ user_id: transaction.user_id })
    ]);

    const transactionResponse = transaction.toObject();
    transactionResponse.created_by = createdByUser ? {
      user_id: createdByUser.user_id,
      Name: createdByUser.Name,
      email: createdByUser.email
    } : null;
    transactionResponse.user_id = transactionUser ? {
      user_id: transactionUser.user_id,
      Name: transactionUser.Name,
      email: transactionUser.email
    } : null;

    res.status(200).json({
      success: true,
      data: transactionResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// Get All Transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ created_at: -1 });

    // Fetch related data for all transactions
    const transactionsWithPopulatedData = await Promise.all(
      transactions.map(async (transaction) => {
        const [createdByUser, transactionUser] = await Promise.all([
          User.findOne({ user_id: transaction.created_by }),
          User.findOne({ user_id: transaction.user_id })
        ]);

        const transactionResponse = transaction.toObject();
        transactionResponse.created_by = createdByUser ? {
          user_id: createdByUser.user_id,
          Name: createdByUser.Name,
          email: createdByUser.email
        } : null;
        transactionResponse.user_id = transactionUser ? {
          user_id: transactionUser.user_id,
          Name: transactionUser.Name,
          email: transactionUser.email
        } : null;

        return transactionResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: transactionsWithPopulatedData.length,
      data: transactionsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// Get Transaction by Auth (current logged in user)
const getTransactionByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find transactions created by or for the current user
    const transactions = await Transaction.find({ 
      $or: [
        { created_by: userId },
        { user_id: userId }
      ]
    }).sort({ created_at: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found for current user'
      });
    }

    // Fetch related data for all transactions
    const transactionsWithPopulatedData = await Promise.all(
      transactions.map(async (transaction) => {
        const [createdByUser, transactionUser] = await Promise.all([
          User.findOne({ user_id: transaction.created_by }),
          User.findOne({ user_id: transaction.user_id })
        ]);

        const transactionResponse = transaction.toObject();
        transactionResponse.created_by = createdByUser ? {
          user_id: createdByUser.user_id,
          Name: createdByUser.Name,
          email: createdByUser.email
        } : null;
        transactionResponse.user_id = transactionUser ? {
          user_id: transactionUser.user_id,
          Name: transactionUser.Name,
          email: transactionUser.email
        } : null;

        return transactionResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: transactionsWithPopulatedData.length,
      data: transactionsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ 
      transagtion_id: parseInt(id) 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.deleteOne({ transagtion_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
};

// Get Transaction Chart (total transactions value for this month and last month)
const getTransactionChart = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get current month transactions
    const currentMonthTransactions = await Transaction.find({
      status: 'success',
      transaction_date: { $gte: currentMonthStart, $lt: nextMonthStart }
    });

    // Get last month transactions
    const lastMonthTransactions = await Transaction.find({
      status: 'success',
      transaction_date: { $gte: lastMonthStart, $lt: currentMonthStart }
    });

    const month = currentMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastMonth = lastMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const percentageChange = lastMonth > 0 
      ? parseFloat((((month - lastMonth) / lastMonth) * 100).toFixed(2))
      : (month > 0 ? 100 : 0);

    res.status(200).json({
      success: true,
      message: 'Transaction chart retrieved successfully',
      Chart: {
        month: parseFloat(month.toFixed(2)),
        lastMonth: parseFloat(lastMonth.toFixed(2)),
        percentageChange
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction chart',
      error: error.message
    });
  }
};

module.exports = {
  createTransaction,
  updateTransaction,
  getTransactionById,
  getAllTransactions,
  getTransactionByAuth,
  deleteTransaction,
  getTransactionChart
};

