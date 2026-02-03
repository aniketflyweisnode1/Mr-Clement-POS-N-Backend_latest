const Invoices = require('../models/Invoices.model');
const User = require('../models/User.model');
const Tokens = require('../models/Tokens.model');
const Quick_Order = require('../models/Quick_Order.model');
const Delivery_type = require('../models/Delivery_type.model');
const Customer_type = require('../models/Customer_type.model');
const Table = require('../models/Table.model');
const Items = require('../models/Items.model');

// Create invoice
const createInvoice = async (req, res) => {
  try {
    console.log(req.body);
    const { Token_id, order_id, Delivery_type_id, Customer_type, Table_id, Status } = req.body;
    const userId = req.user.user_id;

    const invoice = new Invoices({
      Token_id,
      order_id,
      Delivery_type_id,
      Customer_type,
      Table_id,
      Status,
      CreateBy: userId
    });

    const savedInvoice = await invoice.save();
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: savedInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id, Token_id, order_id, Delivery_type_id, Customer_type, Table_id, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID is required in request body'
      });
    }

    const invoice = await Invoices.findOne({ Invoices_id: parseInt(id) });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (Token_id !== undefined) invoice.Token_id = Token_id;
    if (order_id !== undefined) invoice.order_id = order_id;
    if (Delivery_type_id !== undefined) invoice.Delivery_type_id = Delivery_type_id;
    if (Customer_type !== undefined) invoice.Customer_type = Customer_type;
    if (Table_id !== undefined) invoice.Table_id = Table_id;
    if (Status !== undefined) invoice.Status = Status;
    
    invoice.UpdatedBy = userId;
    invoice.UpdatedAt = new Date();

    const updatedInvoice = await invoice.save();
    
    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoices.findOne({ Invoices_id: parseInt(id) });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, tokenData, orderData, deliveryTypeData, customerTypeData, tableData] = await Promise.all([
      invoice.CreateBy ? User.findOne({ user_id: invoice.CreateBy }) : null,
      invoice.UpdatedBy ? User.findOne({ user_id: invoice.UpdatedBy }) : null,
      invoice.Token_id ? Tokens.findOne({ Token_id: invoice.Token_id }) : null,
      invoice.order_id ? Quick_Order.findOne({ Quick_Order_id: invoice.order_id }) : null,
      invoice.Delivery_type_id ? Delivery_type.findOne({ Delivery_type_id: invoice.Delivery_type_id }) : null,
      invoice.Customer_type ? Customer_type.findOne({ Customer_type_id: invoice.Customer_type }) : null,
      invoice.Table_id ? Table.findOne({ Table_id: invoice.Table_id }) : null
    ]);

    // Create response object with populated data
    const invoiceResponse = invoice.toObject();
    invoiceResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    invoiceResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    invoiceResponse.Token_id = tokenData ? { Token_id: tokenData.Token_id, Token_no: tokenData.Token_no, TokenName: tokenData.TokenName } : null;
    invoiceResponse.order_id = orderData ? { Quick_Order_id: orderData.Quick_Order_id, client_mobile_no: orderData.client_mobile_no } : null;
    invoiceResponse.Delivery_type_id = deliveryTypeData ? { Delivery_type_id: deliveryTypeData.Delivery_type_id, Type_name: deliveryTypeData.Type_name } : null;
    invoiceResponse.Customer_type = customerTypeData ? { Customer_type_id: customerTypeData.Customer_type_id, type: customerTypeData.type } : null;
    invoiceResponse.Table_id = tableData ? { Table_id: tableData.Table_id, Table_name: tableData.Table_name } : null;

    res.status(200).json({
      success: true,
      data: invoiceResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoices.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all invoices
    const invoicesWithPopulatedData = await Promise.all(
      invoices.map(async (invoice) => {
        const [createByUser, updatedByUser, tokenData, orderData, deliveryTypeData, customerTypeData, tableData] = await Promise.all([
          invoice.CreateBy ? User.findOne({ user_id: invoice.CreateBy }) : null,
          invoice.UpdatedBy ? User.findOne({ user_id: invoice.UpdatedBy }) : null,
          invoice.Token_id ? Tokens.findOne({ Token_id: invoice.Token_id }) : null,
          invoice.order_id ? Quick_Order.findOne({ Quick_Order_id: invoice.order_id }) : null,
          invoice.Delivery_type_id ? Delivery_type.findOne({ Delivery_type_id: invoice.Delivery_type_id }) : null,
          invoice.Customer_type ? Customer_type.findOne({ Customer_type_id: invoice.Customer_type }) : null,
          invoice.Table_id ? Table.findOne({ Table_id: invoice.Table_id }) : null
        ]);

        // Fetch items from order if order exists
        let items = [];
        let totalPrice = null;
        if (orderData && orderData.item_ids && Array.isArray(orderData.item_ids)) {
          const itemIds = orderData.item_ids.map(item => item.item_id || item);
          const itemsData = await Items.find({ Items_id: { $in: itemIds } });
          
          // Map items with quantities from order
          items = orderData.item_ids.map(orderItem => {
            const itemId = orderItem.item_id || orderItem;
            const itemData = itemsData.find(item => item.Items_id === itemId);
            return {
              item_id: itemId,
              itemName: orderItem.itemName || (itemData ? itemData['item-name'] : 'Unknown Item'),
              quantity: orderItem.quantity || 1,
              price: itemData ? itemData['item-price'] : 0,
              total: (itemData ? itemData['item-price'] : 0) * (orderItem.quantity || 1)
            };
          });
          
          // Get total price from order
          totalPrice = orderData.Total || null;
        }

        const invoiceResponse = invoice.toObject();
        invoiceResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        invoiceResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        invoiceResponse.Token_id = tokenData ? { Token_id: tokenData.Token_id, Token_no: tokenData.Token_no, TokenName: tokenData.TokenName } : null;
        invoiceResponse.order_id = orderData ? { Quick_Order_id: orderData.Quick_Order_id, client_mobile_no: orderData.client_mobile_no } : null;
        invoiceResponse.Delivery_type_id = deliveryTypeData ? { Delivery_type_id: deliveryTypeData.Delivery_type_id, Type_name: deliveryTypeData.Type_name } : null;
        invoiceResponse.Customer_type = customerTypeData ? { Customer_type_id: customerTypeData.Customer_type_id, type: customerTypeData.type } : null;
        invoiceResponse.Table_id = tableData ? { Table_id: tableData.Table_id, Table_name: tableData.Table_name } : null;
        invoiceResponse.items = items;
        invoiceResponse.total_price = totalPrice;

        return invoiceResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: invoicesWithPopulatedData.length,
      data: invoicesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

// Get invoices by authenticated user
const getInvoicesByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const invoices = await Invoices.find({ CreateBy: userId })
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all invoices
    const invoicesWithPopulatedData = await Promise.all(
      invoices.map(async (invoice) => {
        const [createByUser, updatedByUser, tokenData, orderData, deliveryTypeData, customerTypeData, tableData] = await Promise.all([
          invoice.CreateBy ? User.findOne({ user_id: invoice.CreateBy }) : null,
          invoice.UpdatedBy ? User.findOne({ user_id: invoice.UpdatedBy }) : null,
          invoice.Token_id ? Tokens.findOne({ Token_id: invoice.Token_id }) : null,
          invoice.order_id ? Quick_Order.findOne({ Quick_Order_id: invoice.order_id }) : null,
          invoice.Delivery_type_id ? Delivery_type.findOne({ Delivery_type_id: invoice.Delivery_type_id }) : null,
          invoice.Customer_type ? Customer_type.findOne({ Customer_type_id: invoice.Customer_type }) : null,
          invoice.Table_id ? Table.findOne({ Table_id: invoice.Table_id }) : null
        ]);

        // Fetch items from order if order exists
        let items = [];
        let totalPrice = null;
        if (orderData && orderData.item_ids && Array.isArray(orderData.item_ids)) {
          const itemIds = orderData.item_ids.map(item => item.item_id || item);
          const itemsData = await Items.find({ Items_id: { $in: itemIds } });
          
          // Map items with quantities from order
          items = orderData.item_ids.map(orderItem => {
            const itemId = orderItem.item_id || orderItem;
            const itemData = itemsData.find(item => item.Items_id === itemId);
            return {
              item_id: itemId,
              itemName: orderItem.itemName || (itemData ? itemData['item-name'] : 'Unknown Item'),
              quantity: orderItem.quantity || 1,
              price: itemData ? itemData['item-price'] : 0,
              total: (itemData ? itemData['item-price'] : 0) * (orderItem.quantity || 1)
            };
          });
          
          // Get total price from order
          totalPrice = orderData.Total || null;
        }

        const invoiceResponse = invoice.toObject();
        invoiceResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        invoiceResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        invoiceResponse.Token_id = tokenData ? { Token_id: tokenData.Token_id, Token_no: tokenData.Token_no, TokenName: tokenData.TokenName } : null;
        invoiceResponse.order_id = orderData ? { Quick_Order_id: orderData.Quick_Order_id, client_mobile_no: orderData.client_mobile_no } : null;
        invoiceResponse.Delivery_type_id = deliveryTypeData ? { Delivery_type_id: deliveryTypeData.Delivery_type_id, Type_name: deliveryTypeData.Type_name } : null;
        invoiceResponse.Customer_type = customerTypeData ? { Customer_type_id: customerTypeData.Customer_type_id, type: customerTypeData.type } : null;
        invoiceResponse.Table_id = tableData ? { Table_id: tableData.Table_id, Table_name: tableData.Table_name } : null;
        invoiceResponse.items = items;
        invoiceResponse.total_price = totalPrice;

        return invoiceResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: invoicesWithPopulatedData.length,
      data: invoicesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices by auth',
      error: error.message
    });
  }
};

// Delete Invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoices.findOne({ Invoices_id: parseInt(id) });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await Invoices.deleteOne({ Invoices_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};

module.exports = {
  createInvoice,
  updateInvoice,
  getInvoiceById,
  getAllInvoices,
  getInvoicesByAuth,
  deleteInvoice
};
