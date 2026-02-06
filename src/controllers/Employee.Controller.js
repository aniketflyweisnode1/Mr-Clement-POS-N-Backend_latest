const User = require('../models/User.model');
const User_Preferences = require('../models/User_Preferences.model');
const Notifications_Map_employee = require('../models/Notifications_Map_employee.model');
const Notifications = require('../models/Notifications.model');
const Pos_Point_sales_Order = require('../models/Pos_Point_sales_Order.model');
const Role = require('../models/Role.model');
const Items = require('../models/Items.model');
const item_Addons = require('../models/item_Addons.model');
const item_Variants = require('../models/item_Variants.model');
const Customer = require('../models/Customer.model');
const Table = require('../models/Table.model');
const Kitchen = require('../models/Kitchen.model');
const crypto = require('crypto');
const qrcode = require('qrcode');

// --- Employee Settings ---

const getEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id })
      .populate('Role_id', 'Role_id role_name')
      .select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "Employee profile retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    const { Name, phone, email } = req.body;
    const userId = req.user.user_id;

    const updateData = {};
    if (Name) updateData.Name = Name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    updateData.UpdatedBy = userId;
    updateData.UpdatedAt = new Date();

    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      updateData,
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, message: "Employee profile updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeePreferences = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    let prefs = await User_Preferences.findOne({ user_id: userId });
    
    if (!prefs) {
      // Return defaults if no preferences set
      return res.status(200).json({
        success: true,
        message: "Employee preferences retrieved successfully",
        data: {
          user_id: userId,
          language: "en",
          theme: "light",
          notifications: { email: true, push: true, sms: false },
          dashboard_layout: "compact",
          quick_actions: []
        }
      });
    }

    res.status(200).json({ success: true, message: "Employee preferences retrieved successfully", data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployeePreferences = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { language, theme, notifications, dashboard_layout, quick_actions } = req.body;

    const updateData = {
      user_id: userId,
      language,
      theme,
      notifications,
      dashboard_layout,
      quick_actions,
      UpdatedAt: new Date()
    };

    const prefs = await User_Preferences.findOneAndUpdate(
      { user_id: userId },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: "Employee preferences updated successfully", data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeeNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const notificationMaps = await Notifications_Map_employee.find({ 
      employee_id: userId, 
      Status: true 
    }).sort({ CreateAt: -1 });

    if (!notificationMaps || notificationMaps.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Employee notifications retrieved successfully",
        data: []
      });
    }

    const notificationsResponse = await Promise.all(notificationMaps.map(async (map) => {
      const notification = await Notifications.findOne({ Notifications_id: map.Notifications_id });
      return {
        notification_id: map.Notifications_Map_employee_id,
        title: "Notification",
        message: notification ? notification.Notifications : "Message unavailable",
        type: "general",
        is_read: map.isRead,
        created_at: map.CreateAt
      };
    }));

    res.status(200).json({ 
      success: true, 
      message: "Employee notifications retrieved successfully", 
      data: notificationsResponse 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const userId = req.user.user_id;

    const notificationMap = await Notifications_Map_employee.findOneAndUpdate(
      { Notifications_Map_employee_id: parseInt(notification_id), employee_id: userId },
      { isRead: true, UpdatedAt: new Date() },
      { new: true }
    );

    if (!notificationMap) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await Notifications_Map_employee.updateMany(
      { employee_id: userId, isRead: false },
      { isRead: true, UpdatedAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { marked_count: result.modifiedCount || result.nModified || 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Order Management ---

const isRestaurantRole = async (roleId) => {
  if (!roleId) return false;
  const role = await Role.findOne({ Role_id: roleId });
  return role?.role_name?.toLowerCase() === 'restaurant';
};

const ensureRestaurantOwnership = (posOrder, requesterIsRestaurant, requesterUserId) => {
  if (requesterIsRestaurant && posOrder.Restaurant_id !== requesterUserId) {
    throw new Error('You are not allowed to modify orders for another restaurant');
  }
};

const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.user_id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order can be completed
    if (posOrder.Order_Status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Order is already completed'
      });
    }

    if (posOrder.Order_Status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled order'
      });
    }

    // Update order status to Completed
    posOrder.Order_Status = 'Completed';
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    // Update all items' status to match the order status
    if (posOrder.items && Array.isArray(posOrder.items)) {
      posOrder.items = posOrder.items.map(item => ({
        ...item,
        item_status: 'Completed'
      }));
    }

    const updatedOrder = await posOrder.save();

    res.status(200).json({
      success: true,
      message: 'Order completed successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.user_id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order can be cancelled
    if (posOrder.Order_Status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (posOrder.Order_Status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed order'
      });
    }

    // Update order status to Cancelled
    posOrder.Order_Status = 'Cancelled';
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    // Update all items' status to match the order status
    if (posOrder.items && Array.isArray(posOrder.items)) {
      posOrder.items = posOrder.items.map(item => ({
        ...item,
        item_status: 'Cancelled'
      }));
    }

    const updatedOrder = await posOrder.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// --- Order Details and Payment ---

// Get served order details with proper item calculations
const getServedOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.user_id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order is served or completed
    if (posOrder.Order_Status !== 'Served' && posOrder.Order_Status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be served or completed to view details'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, customer, table, kitchen] = await Promise.all([
      posOrder.CreateBy ? User.findOne({ user_id: posOrder.CreateBy }) : null,
      posOrder.UpdatedBy ? User.findOne({ user_id: posOrder.UpdatedBy }) : null,
      posOrder.Customer_id ? Customer.findOne({ Customer_id: posOrder.Customer_id }) : null,
      posOrder.Table_id ? Table.findOne({ Table_id: posOrder.Table_id }) : null,
      posOrder.Kitchen_id ? Kitchen.findOne({ kitchen_id: posOrder.Kitchen_id }) : null
    ]);

    // Populate items array with detailed information and proper price calculations
    const populatedItems = await Promise.all(
      posOrder.items.map(async (itemData) => {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id, item_status, item_size } = itemData;

        const [item, addon, variant] = await Promise.all([
          Items.findOne({ Items_id: parseInt(item_id) }),
          item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
          item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
        ]);

        // Calculate prices
        let basePrice = item ? (item['item-price'] || 0) : 0;
        let addonPrice = addon ? (addon.prices || 0) : 0;
        let variantPrice = variant ? (variant.prices || 0) : 0;

        const unitPrice = basePrice + addonPrice + variantPrice;
        const totalPrice = unitPrice * item_Quentry;

        return {
          item_id,
          item_Quentry,
          item_Addons_id,
          item_Variants_id,
          item_status: item_status || 'Served',
          item_size: item_size || null,
          pricing: {
            base_price: basePrice,
            addon_price: addonPrice,
            variant_price: variantPrice,
            unit_price: unitPrice,
            total_price: totalPrice
          },
          Item: item ? {
            Items_id: item.Items_id,
            item_id: item.Items_id,
            item_name: item['item-name'],
            'item-name': item['item-name'],
            'item-code': item['item-code'],
            'item-price': item['item-price'],
            prices: item.prices
          } : null,
          Addon: addon ? {
            item_Addons_id: addon.item_Addons_id,
            Addons: addon.Addons,
            prices: addon.prices
          } : null,
          Variant: variant ? {
            item_Variants_id: variant.item_Variants_id,
            Variants: variant.Variants,
            prices: variant.prices
          } : null
        };
      })
    );

    // Calculate order totals
    const orderTotals = populatedItems.reduce((totals, item) => {
      totals.subtotal += item.pricing.total_price;
      return totals;
    }, { subtotal: 0 });

    orderTotals.tax = posOrder.Tax || 0;
    orderTotals.total = orderTotals.subtotal + orderTotals.tax;

    const posOrderResponse = posOrder.toObject();

    // Ensure all IDs are included in the response
    posOrderResponse.POS_Order_id = posOrder.POS_Order_id;
    posOrderResponse.Customer_id = posOrder.Customer_id;
    posOrderResponse.Table_id = posOrder.Table_id;
    posOrderResponse.Kitchen_id = posOrder.Kitchen_id;
    posOrderResponse.Restaurant_id = posOrder.Restaurant_id;
    posOrderResponse.CreateBy_id = posOrder.CreateBy;
    posOrderResponse.UpdatedBy_id = posOrder.UpdatedBy;

    // Populated relationships with complete data
    posOrderResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email,
      Employee_id: createByUser.Employee_id
    } : null;
    posOrderResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email,
      Employee_id: updatedByUser.Employee_id
    } : null;
    posOrderResponse.items = populatedItems;
    posOrderResponse.Customer = customer ? {
      Customer_id: customer.Customer_id,
      Name: customer.Name,
      phone: customer.phone,
      Address: customer.Address
    } : null;
    posOrderResponse.Table = table ? {
      table_id: table.table_id,
      table_name: table['Table-name'],
      'Table-name': table['Table-name'],
      'Table-code': table['Table-code']
    } : null;
    posOrderResponse.Kitchen = kitchen ? {
      kitchen_id: kitchen.kitchen_id,
      kitchen_name: kitchen.kitchen_name
    } : null;

    // Add calculated totals
    posOrderResponse.order_totals = orderTotals;

    res.status(200).json({
      success: true,
      message: 'Served order details retrieved successfully',
      data: posOrderResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching served order details',
      error: error.message
    });
  }
};

// Process payment for served order
const processOrderPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentAmount, transactionId } = req.body;
    const userId = req.user.user_id;

    if (!orderId || !paymentMethod || !paymentAmount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, payment method, and payment amount are required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order is served or completed
    if (posOrder.Order_Status !== 'Served' && posOrder.Order_Status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be served or completed to process payment'
      });
    }

    // Check if payment is already successful
    if (posOrder.payment_status === 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed for this order'
      });
    }

    // Calculate the actual order total from items
    let calculatedTotal = 0;
    if (posOrder.items && Array.isArray(posOrder.items)) {
      for (const itemData of posOrder.items) {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;

        // Fetch item details
        const [item, addon, variant] = await Promise.all([
          Items.findOne({ Items_id: parseInt(item_id) }),
          item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
          item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
        ]);

        // Calculate item price
        let basePrice = item ? (item['item-price'] || 0) : 0;
        let addonPrice = addon ? (addon.prices || 0) : 0;
        let variantPrice = variant ? (variant.prices || 0) : 0;

        const unitPrice = basePrice + addonPrice + variantPrice;
        const itemTotal = unitPrice * item_Quentry;

        calculatedTotal += itemTotal;
      }
    }

    // Add tax to the calculated total
    calculatedTotal += (posOrder.Tax || 0);

    // Validate payment amount matches calculated order total
    if (parseFloat(paymentAmount) !== calculatedTotal) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${paymentAmount}) does not match order total (${calculatedTotal})`
      });
    }

    // Update order payment status
    posOrder.payment_status = 'Success';
    posOrder.transaction_id = transactionId || null;
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    const updatedOrder = await posOrder.save();

    // Record customer transaction
    await recordCustomerTransaction(updatedOrder, paymentMethod);

    // Generate QR code for order details/receipt
    let qrCodeDataUrl;
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const orderUrl = `${baseUrl}/order/${updatedOrder.POS_Order_id}`;
      qrCodeDataUrl = await qrcode.toDataURL(orderUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
      qrCodeDataUrl = null;
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        order_id: updatedOrder.POS_Order_id,
        payment_status: updatedOrder.payment_status,
        payment_amount: paymentAmount,
        payment_method: paymentMethod,
        transaction_id: updatedOrder.transaction_id,
        updated_at: updatedOrder.UpdatedAt,
        qr_code_data: qrCodeDataUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// Helper function to record customer transaction (similar to POS controller)
const recordCustomerTransaction = async (posOrder, paymentMethod = 'Cash') => {
  try {
    const { CustomerTransaction } = require('../models/TriaxxPaymentModel.model');

    // Only record if order has a customer and transaction doesn't already exist
    if (!posOrder.Customer_id || posOrder.transaction_id) {
      return null;
    }

    // Determine payment method
    const paymentMethodUsed = paymentMethod === 'Cash' ? 'Cash' :
                             paymentMethod === 'Card' ? 'Bank_Card' :
                             paymentMethod === 'Mobile_Money' ? 'Mobile_Money' : 'Cash';

    // Calculate merchant receives (total - any provider fees)
    const merchantReceives = posOrder.Total;

    const transaction = new CustomerTransaction({
      merchant_id: posOrder.Restaurant_id,
      order_id: posOrder.POS_Order_id,
      customer_id: posOrder.Customer_id,
      transaction_amount: posOrder.Total,
      payment_method_used: paymentMethodUsed,
      transaction_status: 'Success',
      settlement_status: 'Settled',
      merchant_receives: merchantReceives,
      currency: 'XOF',
      CreateBy: posOrder.CreateBy
    });

    const savedTransaction = await transaction.save();

    // Update order with transaction reference
    posOrder.transaction_id = savedTransaction.CustomerTransaction_id;
    await posOrder.save();

    return savedTransaction;
  } catch (error) {
    console.error('Error recording customer transaction:', error);
    return null;
  }
};

// --- Payment Link Management ---

// Generate payment link for order
const generatePaymentLink = async (req, res) => {
  try {
    const { orderId, expiryHours = 24, paymentMethods = ['Cash', 'Card', 'Mobile_Money'] } = req.body;
    const userId = req.user.user_id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order is served or completed
    if (posOrder.Order_Status !== 'Served' && posOrder.Order_Status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment links can only be generated for served or completed orders'
      });
    }

    // Check if payment is already completed
    if (posOrder.payment_status === 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this order'
      });
    }

    // Generate unique payment token
    const paymentToken = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + parseInt(expiryHours));

    // Calculate order total
    const orderTotal = (posOrder.SubTotal || 0) + (posOrder.Tax || 0);

    // Create payment link data
    const paymentLinkData = {
      orderId: posOrder.POS_Order_id,
      paymentToken,
      amount: orderTotal,
      currency: 'XOF',
      expiryDate,
      paymentMethods,
      createdBy: userId,
      isActive: true
    };

    // Store payment link data in order (you might want to create a separate collection for this)
    // For now, we'll add it to the order as a temporary solution
    posOrder.payment_link = paymentLinkData;
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    await posOrder.save();

    // Generate the actual payment link URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentLink = `${baseUrl}/payment/${paymentToken}`;

    // Generate QR code as base64 data URL
    let qrCodeDataUrl;
    try {
      qrCodeDataUrl = await qrcode.toDataURL(paymentLink, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
      qrCodeDataUrl = null;
    }

    res.status(200).json({
      success: true,
      message: 'Payment link generated successfully',
      data: {
        order_id: posOrder.POS_Order_id,
        payment_link: paymentLink,
        payment_token: paymentToken,
        amount: orderTotal,
        currency: 'XOF',
        expiry_date: expiryDate,
        payment_methods: paymentMethods,
        qr_code_data: qrCodeDataUrl // Base64 encoded QR code image
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating payment link',
      error: error.message
    });
  }
};

// Validate and process payment through link
const processPaymentLink = async (req, res) => {
  try {
    const { paymentToken } = req.params;
    const { paymentMethod, paymentAmount, transactionId, customerEmail, customerPhone } = req.body;

    if (!paymentToken) {
      return res.status(400).json({
        success: false,
        message: 'Payment token is required'
      });
    }

    if (!paymentMethod || !paymentAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and amount are required'
      });
    }

    // Find order with this payment token
    const posOrder = await Pos_Point_sales_Order.findOne({
      'payment_link.paymentToken': paymentToken,
      'payment_link.isActive': true
    });

    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired payment link'
      });
    }

    const paymentLinkData = posOrder.payment_link;

    // Check if link has expired
    if (new Date() > new Date(paymentLinkData.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Payment link has expired'
      });
    }

    // Validate payment method
    if (!paymentLinkData.paymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Payment method ${paymentMethod} is not allowed for this link`
      });
    }

    // Validate payment amount
    if (parseFloat(paymentAmount) !== paymentLinkData.amount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${paymentAmount}) does not match the required amount (${paymentLinkData.amount})`
      });
    }

    // Check if payment is already completed
    if (posOrder.payment_status === 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this order'
      });
    }

    // Update order payment status
    posOrder.payment_status = 'Success';
    posOrder.transaction_id = transactionId || null;
    posOrder.UpdatedBy = paymentLinkData.createdBy; // Use the employee who created the link
    posOrder.UpdatedAt = new Date();

    // Deactivate the payment link
    posOrder.payment_link.isActive = false;

    const updatedOrder = await posOrder.save();

    // Record customer transaction
    await recordCustomerTransaction(updatedOrder, paymentMethod);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully through link',
      data: {
        order_id: updatedOrder.POS_Order_id,
        payment_status: updatedOrder.payment_status,
        payment_amount: paymentAmount,
        payment_method: paymentMethod,
        transaction_id: updatedOrder.transaction_id,
        processed_at: updatedOrder.UpdatedAt,
        customer_details: {
          email: customerEmail,
          phone: customerPhone
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment link',
      error: error.message
    });
  }
};

// Get payment link details (for validation)
const getPaymentLinkDetails = async (req, res) => {
  try {
    const { paymentToken } = req.params;

    if (!paymentToken) {
      return res.status(400).json({
        success: false,
        message: 'Payment token is required'
      });
    }

    // Find order with this payment token
    const posOrder = await Pos_Point_sales_Order.findOne({
      'payment_link.paymentToken': paymentToken
    });

    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired payment link'
      });
    }

    const paymentLinkData = posOrder.payment_link;

    // Check if link has expired
    const isExpired = new Date() > new Date(paymentLinkData.expiryDate);

    // Get basic order information
    const orderInfo = {
      order_id: posOrder.POS_Order_id,
      order_status: posOrder.Order_Status,
      payment_status: posOrder.payment_status,
      amount: paymentLinkData.amount,
      currency: paymentLinkData.currency,
      expiry_date: paymentLinkData.expiryDate,
      payment_methods: paymentLinkData.paymentMethods,
      is_expired: isExpired,
      is_active: paymentLinkData.isActive && !isExpired
    };

    // Get customer information if available
    if (posOrder.Customer_id) {
      const customer = await Customer.findOne({ Customer_id: posOrder.Customer_id });
      if (customer) {
        orderInfo.customer = {
          name: customer.Name,
          phone: customer.phone,
          email: customer.email
        };
      }
    }

    // Get restaurant information
    if (posOrder.Restaurant_id) {
      const restaurant = await User.findOne({ user_id: posOrder.Restaurant_id });
      if (restaurant) {
        orderInfo.restaurant = {
          name: restaurant.Name,
          address: restaurant.address
        };
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment link details retrieved successfully',
      data: orderInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment link details',
      error: error.message
    });
  }
};

const getPaymentLinkQR = async (req, res) => {
  try {
    const { paymentToken } = req.params;

    if (!paymentToken) {
      return res.status(400).json({
        success: false,
        message: 'Payment token is required'
      });
    }

    // Find order with this payment token
    const posOrder = await Pos_Point_sales_Order.findOne({
      'payment_link.paymentToken': paymentToken,
      'payment_link.isActive': true
    });

    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired payment link'
      });
    }

    const paymentLinkData = posOrder.payment_link;

    // Check if link has expired
    if (new Date() > new Date(paymentLinkData.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Payment link has expired'
      });
    }

    // Generate the payment link URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentLink = `${baseUrl}/payment/${paymentToken}`;

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await qrcode.toBuffer(paymentLink, {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Set response headers and send the image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="payment-qr.png"');
    res.send(qrCodeBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error.message
    });
  }
};

const validateCoupon = (couponCode, orderTotal) => {
  // Simple hardcoded coupon validation for demo
  const coupons = {
    'DISCOUNT10': { type: 'percentage', value: 10, minOrder: 0 },
    'FIXED5': { type: 'fixed', value: 5, minOrder: 20 },
    'WELCOME20': { type: 'percentage', value: 20, minOrder: 50 }
  };

  const coupon = coupons[couponCode.toUpperCase()];
  if (!coupon) {
    throw new Error('Invalid coupon code');
  }

  if (orderTotal < coupon.minOrder) {
    throw new Error(`Minimum order amount of ${coupon.minOrder} required for this coupon`);
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderTotal * coupon.value) / 100;
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, orderTotal);
  }

  return {
    discount,
    finalAmount: orderTotal - discount,
    couponDetails: coupon
  };
};

// Process payment with coupon code
const processPaymentWithCoupon = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentAmount, transactionId, couponCode } = req.body;
    const userId = req.user.user_id;

    if (!orderId || !paymentMethod || !paymentAmount || !couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, payment method, payment amount, and coupon code are required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order is served or completed
    if (posOrder.Order_Status !== 'Served' && posOrder.Order_Status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be served or completed to process payment'
      });
    }

    // Check if payment is already successful
    if (posOrder.payment_status === 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed for this order'
      });
    }

    // Calculate the actual order total from items
    let calculatedTotal = 0;
    if (posOrder.items && Array.isArray(posOrder.items)) {
      for (const itemData of posOrder.items) {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;

        // Fetch item details
        const [item, addon, variant] = await Promise.all([
          Items.findOne({ Items_id: parseInt(item_id) }),
          item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
          item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
        ]);

        // Calculate item price
        let basePrice = item ? (item['item-price'] || 0) : 0;
        let addonPrice = addon ? (addon.prices || 0) : 0;
        let variantPrice = variant ? (variant.prices || 0) : 0;

        const unitPrice = basePrice + addonPrice + variantPrice;
        const itemTotal = unitPrice * item_Quentry;

        calculatedTotal += itemTotal;
      }
    }

    // Add tax to the calculated total
    calculatedTotal += (posOrder.Tax || 0);

    // Validate and apply coupon
    const couponResult = validateCoupon(couponCode, calculatedTotal);

    // Validate payment amount matches discounted total
    if (parseFloat(paymentAmount) !== couponResult.finalAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${paymentAmount}) does not match discounted order total (${couponResult.finalAmount})`
      });
    }

    // Update order payment status
    posOrder.payment_status = 'Success';
    posOrder.transaction_id = transactionId || null;
    posOrder.coupon_applied = couponCode;
    posOrder.discount_amount = couponResult.discount;
    posOrder.final_amount = couponResult.finalAmount;
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    const updatedOrder = await posOrder.save();

    // Record customer transaction
    await recordCustomerTransaction(updatedOrder, paymentMethod);

    // Generate QR code for order details/receipt
    let qrCodeDataUrl;
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const orderUrl = `${baseUrl}/order/${updatedOrder.POS_Order_id}`;
      qrCodeDataUrl = await qrcode.toDataURL(orderUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
      qrCodeDataUrl = null;
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully with coupon',
      data: {
        order_id: updatedOrder.POS_Order_id,
        payment_status: updatedOrder.payment_status,
        original_amount: calculatedTotal,
        discount_amount: couponResult.discount,
        final_amount: couponResult.finalAmount,
        coupon_code: couponCode,
        payment_method: paymentMethod,
        transaction_id: updatedOrder.transaction_id,
        updated_at: updatedOrder.UpdatedAt,
        qr_code_data: qrCodeDataUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment with coupon',
      error: error.message
    });
  }
};

// Calculate split payment amounts for order
const calculateSplitAmounts = async (req, res) => {
  try {
    const { orderId, numberOfSplits } = req.body;
    const userId = req.user.user_id;

    if (!orderId || !numberOfSplits || numberOfSplits < 2 || numberOfSplits > 10) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and number of splits (2-10) are required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order is served or completed
    if (posOrder.Order_Status !== 'Served' && posOrder.Order_Status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be served or completed to calculate split amounts'
      });
    }

    // Calculate the actual order total from items
    let calculatedTotal = 0;
    if (posOrder.items && Array.isArray(posOrder.items)) {
      for (const itemData of posOrder.items) {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;

        // Fetch item details
        const [item, addon, variant] = await Promise.all([
          Items.findOne({ Items_id: parseInt(item_id) }),
          item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
          item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
        ]);

        // Calculate item price
        let basePrice = item ? (item['item-price'] || 0) : 0;
        let addonPrice = addon ? (addon.prices || 0) : 0;
        let variantPrice = variant ? (variant.prices || 0) : 0;

        const unitPrice = basePrice + addonPrice + variantPrice;
        const itemTotal = unitPrice * item_Quentry;

        calculatedTotal += itemTotal;
      }
    }

    // Add tax to the calculated total
    calculatedTotal += (posOrder.Tax || 0);

    // Calculate split amounts
    const baseAmount = Math.floor((calculatedTotal / numberOfSplits) * 100) / 100; // Round down to 2 decimal places
    const remainder = Math.round((calculatedTotal - (baseAmount * numberOfSplits)) * 100) / 100;

    const splitAmounts = [];
    for (let i = 0; i < numberOfSplits; i++) {
      let amount = baseAmount;
      if (i < remainder * 100) { // Distribute remainder cents
        amount += 0.01;
      }
      splitAmounts.push(Math.round(amount * 100) / 100); // Ensure 2 decimal places
    }

    res.status(200).json({
      success: true,
      message: 'Split amounts calculated successfully',
      data: {
        order_id: posOrder.POS_Order_id,
        total_amount: calculatedTotal,
        number_of_splits: numberOfSplits,
        split_amounts: splitAmounts,
        calculated_at: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating split amounts',
      error: error.message
    });
  }
};

// Process split payment for order
const processSplitPayment = async (req, res) => {
  try {
    const { orderId, payments, transactionId } = req.body;
    const userId = req.user.user_id;

    if (!orderId || !payments || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and payments array are required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(orderId) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Check if order is served or completed
    if (posOrder.Order_Status !== 'Served' && posOrder.Order_Status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be served or completed to process payment'
      });
    }

    // Check if payment is already successful
    if (posOrder.payment_status === 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed for this order'
      });
    }

    // Calculate the actual order total from items
    let calculatedTotal = 0;
    if (posOrder.items && Array.isArray(posOrder.items)) {
      for (const itemData of posOrder.items) {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;

        // Fetch item details
        const [item, addon, variant] = await Promise.all([
          Items.findOne({ Items_id: parseInt(item_id) }),
          item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
          item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
        ]);

        // Calculate item price
        let basePrice = item ? (item['item-price'] || 0) : 0;
        let addonPrice = addon ? (addon.prices || 0) : 0;
        let variantPrice = variant ? (variant.prices || 0) : 0;

        const unitPrice = basePrice + addonPrice + variantPrice;
        const itemTotal = unitPrice * item_Quentry;

        calculatedTotal += itemTotal;
      }
    }

    // Add tax to the calculated total
    calculatedTotal += (posOrder.Tax || 0);

    // Validate split payments
    let totalPaymentAmount = 0;
    const validMethods = ['Cash', 'Card', 'Mobile_Money'];
    const paymentDetails = [];

    for (const payment of payments) {
      const { paymentMethod, amount } = payment;

      if (!paymentMethod || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each payment must have a valid method and positive amount'
        });
      }

      if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment method: ${paymentMethod}`
        });
      }

      totalPaymentAmount += parseFloat(amount);
      paymentDetails.push({
        method: paymentMethod,
        amount: parseFloat(amount)
      });
    }

    // Validate total payment amount matches order total
    if (Math.abs(totalPaymentAmount - calculatedTotal) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Total payment amount (${totalPaymentAmount}) does not match order total (${calculatedTotal})`
      });
    }

    // Update order payment status
    posOrder.payment_status = 'Success';
    posOrder.transaction_id = transactionId || null;
    posOrder.split_payments = paymentDetails;
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    const updatedOrder = await posOrder.save();

    // Record customer transaction for each payment method
    for (const payment of paymentDetails) {
      await recordCustomerTransaction(updatedOrder, payment.method);
    }

    // Generate QR code for order details/receipt
    let qrCodeDataUrl;
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const orderUrl = `${baseUrl}/order/${updatedOrder.POS_Order_id}`;
      qrCodeDataUrl = await qrcode.toDataURL(orderUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
      qrCodeDataUrl = null;
    }

    res.status(200).json({
      success: true,
      message: 'Split payment processed successfully',
      data: {
        order_id: updatedOrder.POS_Order_id,
        payment_status: updatedOrder.payment_status,
        total_amount: calculatedTotal,
        split_payments: paymentDetails,
        transaction_id: updatedOrder.transaction_id,
        updated_at: updatedOrder.UpdatedAt,
        qr_code_data: qrCodeDataUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing split payment',
      error: error.message
    });
  }
};

module.exports = {
  getEmployeeProfile,
  updateEmployeeProfile,
  getEmployeePreferences,
  updateEmployeePreferences,
  getEmployeeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  completeOrder,
  cancelOrder,
  getServedOrderDetails,
  processOrderPayment,
  processPaymentWithCoupon,
  calculateSplitAmounts,
  processSplitPayment,
  generatePaymentLink,
  processPaymentLink,
  getPaymentLinkDetails,
  getPaymentLinkQR
};
