const Pos_Point_sales_Order = require('../models/Pos_Point_sales_Order.model');
const User = require('../models/User.model');
const Role = require('../models/Role.model');
const Items = require('../models/Items.model');
const item_Addons = require('../models/item_Addons.model');
const item_Variants = require('../models/item_Variants.model');
const Customer = require('../models/Customer.model');
const Table = require('../models/Table.model');
const Kitchen = require('../models/Kitchen.model');

const RESTAURANT_ROLE_NAME = 'restaurant';

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const handleControllerError = (res, error, fallbackMessage) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? fallbackMessage : error.message,
    error: error.message
  });
};

const isRestaurantRole = async (roleId) => {
  if (!roleId) return false;
  const role = await Role.findOne({ Role_id: roleId });
  return role?.role_name?.toLowerCase() === RESTAURANT_ROLE_NAME;
};

const resolveRestaurantIdForRequest = async ({ requesterIsRestaurant, requesterUserId, providedRestaurantId }) => {
  if (requesterIsRestaurant) {
    return requesterUserId;
  }

  if (providedRestaurantId === undefined || providedRestaurantId === null) {
    return providedRestaurantId ?? null;
  }

  const restaurantUser = await User.findOne({ user_id: providedRestaurantId });
  if (!restaurantUser) {
    throw createHttpError(404, 'Provided Restaurant_id does not match any user');
  }

  const restaurantRoleMatch = await isRestaurantRole(restaurantUser.Role_id);
  if (!restaurantRoleMatch) {
    throw createHttpError(400, 'Provided Restaurant_id is not associated with a restaurant role');
  }

  return providedRestaurantId;
};

const ensureRestaurantOwnership = (posOrder, requesterIsRestaurant, requesterUserId) => {
  if (requesterIsRestaurant && posOrder.Restaurant_id !== requesterUserId) {
    throw createHttpError(403, 'You are not allowed to modify orders for another restaurant');
  }
};

// Create POS order with automatic calculations
const createPosOrder = async (req, res) => {
  try {
    const { 
      items, 
      Tax, 
      Customer_id, 
      Dining_Option, 
      Table_id, 
      Kitchen_id, 
      Restaurant_id,
      Status,
      Order_Status,
      payment_status,
      transaction_id
    } = req.body;
    
    const userId = req.user.user_id;
    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    const restaurantIdForOrder = await resolveRestaurantIdForRequest({
      requesterIsRestaurant,
      requesterUserId: userId,
      providedRestaurantId: Restaurant_id
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must contain at least one item'
      });
    }

    let totalSubTotal = 0;
    const normalizedItems = items.map((item) => ({
      ...item,
      item_status: item.item_status || 'Preparing',
      item_size: item.item_size || null
    }));

    // Validate and calculate prices for each item
    for (const itemData of normalizedItems) {
      const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;
      
      if (!item_id || !item_Quentry) {
        return res.status(400).json({
          success: false,
          message: 'item_id and item_Quentry are required for each item'
        });
      }

      // Fetch item details to calculate prices
      const item = await Items.findOne({ Items_id: parseInt(item_id) });
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item with ID ${item_id} not found`
        });
      }

      // Calculate base price from item
      let basePrice = item['item-price'] || 0;
      let addonPrice = 0;
      let variantPrice = 0;

      // Calculate addon price if provided
      if (item_Addons_id) {
        const addon = await item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) });
        if (addon) {
          addonPrice = addon.prices || 0;
        }
        // If addon not found, addonPrice remains 0 (no error thrown)
      }

      // Calculate variant price if provided
      if (item_Variants_id) {
        const variant = await item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) });
        if (variant) {
          variantPrice = variant.prices || 0;
        }
        // If variant not found, variantPrice remains 0 (no error thrown)
      }

      // Calculate item subtotal: (base price + addon price + variant price) * quantity
      console.log("======================\n\n", basePrice, addonPrice, variantPrice);
      const unitPrice = basePrice + addonPrice + variantPrice;
      const itemSubTotal = unitPrice * item_Quentry;
      totalSubTotal += itemSubTotal;
    }

    // Calculate total: subtotal + tax
    const Total = totalSubTotal + Tax;

    // Validate payment_status if provided
    if (payment_status !== undefined) {
      const validPaymentStatuses = ['Pending', 'Failed', 'Cancelled', 'Success'];
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
    }

    const posOrder = new Pos_Point_sales_Order({
      items: normalizedItems,
      Tax,
      SubTotal: totalSubTotal,
      Total,
      Customer_id,
      Dining_Option,
      Table_id,
      Kitchen_id,
      Restaurant_id: restaurantIdForOrder,
      Order_Status: Order_Status || 'Preparing',
      payment_status: payment_status || 'Pending',
      transaction_id: transaction_id || null,
      Status,
      CreateBy: userId
    });

    const savedPosOrder = await posOrder.save();
    
    res.status(201).json({
      success: true,
      message: 'POS order created successfully',
      data: savedPosOrder
    });
  } catch (error) {
    return handleControllerError(res, error, 'Error creating POS order');
  }
};

// Update POS order
const updatePosOrder = async (req, res) => {
  try {
    const { 
      id, 
      items, 
      Tax, 
      Customer_id, 
      Dining_Option, 
      Table_id, 
      Kitchen_id, 
      Restaurant_id,
      Status,
      Order_Status,
      payment_status,
      transaction_id
    } = req.body;
    
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'POS order ID is required in request body'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(id) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'POS order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Validate payment_status if provided
    if (payment_status !== undefined) {
      const validPaymentStatuses = ['Pending', 'Failed', 'Cancelled', 'Success'];
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
    }

    // Update fields if provided
    if (items !== undefined) {
      const normalizedItems = items.map((item) => ({
        ...item,
        item_status: item.item_status || 'Preparing',
        item_size: item.item_size || null
      }));
      posOrder.items = normalizedItems;
    }
    if (Tax !== undefined) posOrder.Tax = Tax;
    if (Customer_id !== undefined) posOrder.Customer_id = Customer_id;
    if (Dining_Option !== undefined) posOrder.Dining_Option = Dining_Option;
    if (Table_id !== undefined) posOrder.Table_id = Table_id;
    if (Kitchen_id !== undefined) posOrder.Kitchen_id = Kitchen_id;
    if (Status !== undefined) posOrder.Status = Status;
    if (Order_Status !== undefined) posOrder.Order_Status = Order_Status;
    if (payment_status !== undefined) posOrder.payment_status = payment_status;
    if (transaction_id !== undefined) posOrder.transaction_id = transaction_id;
    if (Restaurant_id !== undefined || requesterIsRestaurant) {
      const resolvedRestaurantId = await resolveRestaurantIdForRequest({
        requesterIsRestaurant,
        requesterUserId: req.user.user_id,
        providedRestaurantId: Restaurant_id !== undefined ? Restaurant_id : posOrder.Restaurant_id
      });
      posOrder.Restaurant_id = resolvedRestaurantId;
    }

    // If order status is changed to "Served", "Completed", or "Cancelled", reset table status to 1 (Available/Waiting for next booking)
    if (Order_Status !== undefined && (Order_Status === 'Served' || Order_Status === 'Completed' || Order_Status === 'Cancelled') && posOrder.Table_id) {
      await Table.findOneAndUpdate(
        { Table_id: posOrder.Table_id },
        {
          'Table-Booking-Status_id': 1,
          UpdatedBy: userId,
          UpdatedAt: new Date()
        }
      );
    }

    // Recalculate prices if items changed
    if (items !== undefined) {
      let totalSubTotal = 0;

      // Validate and calculate prices for each item
      for (const itemData of posOrder.items) {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;
        
        if (!item_id || !item_Quentry) {
          return res.status(400).json({
            success: false,
            message: 'item_id and item_Quentry are required for each item'
          });
        }

        // Fetch item details to calculate prices
        const item = await Items.findOne({ Items_id: parseInt(item_id) });
        if (!item) {
          return res.status(404).json({
            success: false,
            message: `Item with ID ${item_id} not found`
          });
        }

        // Calculate base price from item
        let basePrice = item['item-price'] || 0;
        let addonPrice = 0;
        let variantPrice = 0;

        // Calculate addon price if provided
        if (item_Addons_id) {
          const addon = await item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) });
          if (addon) {
            addonPrice = addon.prices || 0;
          }
          // If addon not found, addonPrice remains 0 (no error thrown)
        }

        // Calculate variant price if provided
        if (item_Variants_id) {
          const variant = await item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) });
          if (variant) {
            variantPrice = variant.prices || 0;
          }
          // If variant not found, variantPrice remains 0 (no error thrown)
        }

        // Calculate item subtotal: (base price + addon price + variant price) * quantity
        const unitPrice = basePrice + addonPrice + variantPrice;
        const itemSubTotal = unitPrice * item_Quentry;
        totalSubTotal += itemSubTotal;
      }

      posOrder.SubTotal = totalSubTotal;
      posOrder.Total = totalSubTotal + posOrder.Tax;
    }
    
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    const updatedPosOrder = await posOrder.save();
    
    res.status(200).json({
      success: true,
      message: 'POS order updated successfully',
      data: updatedPosOrder
    });
  } catch (error) {
    return handleControllerError(res, error, 'Error updating POS order');
  }
};

// Get POS order by ID
const getPosOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(id) });
    
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'POS order not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, customer, table, kitchen] = await Promise.all([
      posOrder.CreateBy ? User.findOne({ user_id: posOrder.CreateBy }) : null,
      posOrder.UpdatedBy ? User.findOne({ user_id: posOrder.UpdatedBy }) : null,
      posOrder.Customer_id ? Customer.findOne({ Customer_id: posOrder.Customer_id }) : null,
      posOrder.Table_id ? Table.findOne({ table_id: posOrder.Table_id }) : null,
      posOrder.Kitchen_id ? Kitchen.findOne({ kitchen_id: posOrder.Kitchen_id }) : null
    ]);

    // Populate items array with detailed information
    const populatedItems = await Promise.all(
      posOrder.items.map(async (itemData) => {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;
        
        const [item, addon, variant] = await Promise.all([
          Items.findOne({ Items_id: parseInt(item_id) }),
          item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
          item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
        ]);

        return {
          item_id,
          item_Quentry,
          item_Addons_id,
          item_Variants_id,
          Item: item ? { item_id: item.Items_id, item_name: item.item_name, prices: item.prices } : null,
          Addon: addon ? { item_Addons_id: addon.item_Addons_id, Addons: addon.Addons, prices: addon.prices } : null,
          Variant: variant ? { item_Variants_id: variant.item_Variants_id, Variants: variant.Variants, prices: variant.prices } : null
        };
      })
    );

    // Create response object with populated data
    const posOrderResponse = posOrder.toObject();
    posOrderResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    posOrderResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    posOrderResponse.items = populatedItems;
    posOrderResponse.Customer = customer ? { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;
    posOrderResponse.Table = table ? { table_id: table.table_id, table_name: table.table_name } : null;
    posOrderResponse.Kitchen = kitchen ? { kitchen_id: kitchen.kitchen_id, kitchen_name: kitchen.kitchen_name } : null;

    res.status(200).json({
      success: true,
      data: posOrderResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching POS order',
      error: error.message
    });
  }
};

// Get all POS orders
const getAllPosOrders = async (req, res) => {
  try {
    const posOrders = await Pos_Point_sales_Order.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all POS orders
    const posOrdersWithPopulatedData = await Promise.all(
      posOrders.map(async (posOrder) => {
        const [createByUser, updatedByUser, customer, table, kitchen] = await Promise.all([
          posOrder.CreateBy ? User.findOne({ user_id: posOrder.CreateBy }) : null,
          posOrder.UpdatedBy ? User.findOne({ user_id: posOrder.UpdatedBy }) : null,
          posOrder.Customer_id ? Customer.findOne({ Customer_id: posOrder.Customer_id }) : null,
          posOrder.Table_id ? Table.findOne({ table_id: posOrder.Table_id }) : null,
          posOrder.Kitchen_id ? Kitchen.findOne({ kitchen_id: posOrder.kitchen_id }) : null
        ]);

        // Populate items array with detailed information
        const populatedItems = await Promise.all(
          posOrder.items.map(async (itemData) => {
            const { item_id, item_Quentry, item_Addons_id, item_Variants_id } = itemData;
            
            const [item, addon, variant] = await Promise.all([
              Items.findOne({ Items_id: parseInt(item_id) }),
              item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
              item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
            ]);

            return {
              item_id,
              item_Quentry,
              item_Addons_id,
              item_Variants_id,
              Item: item ? { item_id: item.Items_id, item_name: item.item_name, prices: item.prices } : null,
              Addon: addon ? { item_Addons_id: addon.item_Addons_id, Addons: addon.Addons, prices: addon.prices } : null,
              Variant: variant ? { item_Variants_id: variant.item_Variants_id, Variants: variant.Variants, prices: variant.prices } : null
            };
          })
        );

        const posOrderResponse = posOrder.toObject();
        posOrderResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        posOrderResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        posOrderResponse.items = populatedItems;
        posOrderResponse.Customer = customer ? { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;
        posOrderResponse.Table = table ? { table_id: table.table_id, table_name: table.table_name } : null;
        posOrderResponse.Kitchen = kitchen ? { kitchen_id: kitchen.kitchen_id, kitchen_name: kitchen.kitchen_name } : null;

        return posOrderResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: posOrdersWithPopulatedData.length,
      data: posOrdersWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching POS orders',
      error: error.message
    });
  }
};

// Helper function to get date range based on filter
const getDateRangeForFilter = (filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  startOfDay.setHours(0, 0, 0, 0);
  
  switch (filter?.toLowerCase()) {
    case 'today':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterdayStart = new Date(startOfDay);
      yesterdayStart.setDate(startOfDay.getDate() - 1);
      return {
        start: yesterdayStart,
        end: startOfDay
      };
    case 'week':
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - dayOfWeek);
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1)
      };
    default:
      return null; // No filter, return all
  }
};

// Get POS orders by authenticated user
const getPosOrdersByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { filter } = req.query; // filter: today, yesterday, week, month, year

    // Build query
    const query = { CreateBy: userId };

    // Apply date filter if provided
    if (filter) {
      const dateRange = getDateRangeForFilter(filter);
      if (dateRange) {
        query.CreateAt = {
          $gte: dateRange.start,
          $lt: dateRange.end
        };
      }
    }

    const posOrders = await Pos_Point_sales_Order.find(query)
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all POS orders
    const posOrdersWithPopulatedData = await Promise.all(
      posOrders.map(async (posOrder) => {
        const [createByUser, updatedByUser, customer, table, kitchen] = await Promise.all([
          posOrder.CreateBy ? User.findOne({ user_id: posOrder.CreateBy }) : null,
          posOrder.UpdatedBy ? User.findOne({ user_id: posOrder.UpdatedBy }) : null,
          posOrder.Customer_id ? Customer.findOne({ Customer_id: posOrder.Customer_id }) : null,
          posOrder.Table_id ? Table.findOne({ table_id: posOrder.Table_id }) : null,
          posOrder.Kitchen_id ? Kitchen.findOne({ kitchen_id: posOrder.Kitchen_id }) : null
        ]);

        // Populate items array with detailed information
        const populatedItems = await Promise.all(
          posOrder.items.map(async (itemData) => {
            const { item_id, item_Quentry, item_Addons_id, item_Variants_id, item_status, item_size } = itemData;
            
            const [item, addon, variant] = await Promise.all([
              Items.findOne({ Items_id: parseInt(item_id) }),
              item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
              item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
            ]);

            return {
              item_id,
              item_Quentry,
              item_Addons_id,
              item_Variants_id,
              item_status: item_status || 'Preparing',
              item_size: item_size || null,
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
          table_name: table.table_name,
          'Table-name': table['Table-name'],
          'Table-code': table['Table-code']
        } : null;
        posOrderResponse.Kitchen = kitchen ? { 
          kitchen_id: kitchen.kitchen_id, 
          kitchen_name: kitchen.kitchen_name
        } : null;

        return posOrderResponse;
      })
    );

    // Get date range info if filter is applied
    let filterInfo = null;
    if (filter) {
      const dateRange = getDateRangeForFilter(filter);
      if (dateRange) {
        filterInfo = {
          filter: filter,
          dateRange: {
            start: dateRange.start,
            end: dateRange.end
          }
        };
      }
    }

    res.status(200).json({
      success: true,
      count: posOrdersWithPopulatedData.length,
      filter: filterInfo,
      data: posOrdersWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching POS orders by user',
      error: error.message
    });
  }
};

// Delete POS Order
const deletePosOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(id) });
    
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'POS order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    await Pos_Point_sales_Order.deleteOne({ POS_Order_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'POS order deleted successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, 'Error deleting POS order');
  }
};

// Update POS order item status/size
const updatePosOrderItemStatus = async (req, res) => {
  try {
    const { id, item_id, item_status, item_size } = req.body;
    const userId = req.user.user_id;

    if (!id || !item_id) {
      return res.status(400).json({
        success: false,
        message: 'POS order ID and item ID are required'
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(id) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'POS order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    const targetItem = posOrder.items.find(item => parseInt(item.item_id) === parseInt(item_id));
    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in this order'
      });
    }

    if (item_status !== undefined) {
      targetItem.item_status = item_status;
    }
    if (item_size !== undefined) {
      targetItem.item_size = item_size;
    }

    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    const updatedOrder = await posOrder.save();

    res.status(200).json({
      success: true,
      message: 'POS order item updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    return handleControllerError(res, error, 'Error updating POS order item');
  }
};

// Update POS Order Status only
const updatePosOrderStatus = async (req, res) => {
  try {
    const { id, Order_Status } = req.body;
    const userId = req.user.user_id;

    if (!id || !Order_Status) {
      return res.status(400).json({
        success: false,
        message: 'POS order ID and Order_Status are required'
      });
    }

    // Validate Order_Status
    const validOrderStatuses = ['Preparing', 'Served', 'Cancelled', 'Completed'];
    if (!validOrderStatuses.includes(Order_Status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Order_Status. Must be one of: ${validOrderStatuses.join(', ')}`
      });
    }

    const posOrder = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(id) });
    if (!posOrder) {
      return res.status(404).json({
        success: false,
        message: 'POS order not found'
      });
    }

    const requesterIsRestaurant = await isRestaurantRole(req.user.role);
    ensureRestaurantOwnership(posOrder, requesterIsRestaurant, req.user.user_id);

    // Update order status
    posOrder.Order_Status = Order_Status;
    
    // Update all items' status to match the order status
    if (posOrder.items && Array.isArray(posOrder.items)) {
      posOrder.items = posOrder.items.map(item => ({
        ...item,
        item_status: Order_Status
      }));
    }
    
    posOrder.UpdatedBy = userId;
    posOrder.UpdatedAt = new Date();

    const updatedOrder = await posOrder.save();

    // If order status is "Served", "Completed", or "Cancelled", reset table status to 1 (Available/Waiting for next booking)
    if ((Order_Status === 'Served' || Order_Status === 'Completed' || Order_Status === 'Cancelled') && posOrder.Table_id) {
      await Table.findOneAndUpdate(
        { Table_id: posOrder.Table_id },
        {
          'Table-Booking-Status_id': 1,
          UpdatedBy: userId,
          UpdatedAt: new Date()
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'POS order status and items status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    return handleControllerError(res, error, 'Error updating POS order status');
  }
};

// Get Current Order on Table by Table ID (only active orders, not completed)
const getCurrentOrderOnTableByTableId = async (req, res) => {
  try {
    const { tableId } = req.params;
    const parsedTableId = parseInt(tableId);

    if (!tableId || isNaN(parsedTableId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid table ID is required'
      });
    }

    // Verify table exists
    const table = await Table.findOne({ Table_id: parsedTableId });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Find active POS order on this table (not Served, Completed, or Cancelled)
    const posOrder = await Pos_Point_sales_Order.findOne({
      Table_id: parsedTableId,
      Order_Status: { $nin: ['Served', 'Completed', 'Cancelled'] },
      Status: true
    }).sort({ CreateAt: -1 });

    // If no active POS order, return null
    if (!posOrder) {
      return res.status(200).json({
        success: true,
        message: 'No active order found on this table',
        data: null
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, customer, tableData, kitchen] = await Promise.all([
      posOrder.CreateBy ? User.findOne({ user_id: posOrder.CreateBy }) : null,
      posOrder.UpdatedBy ? User.findOne({ user_id: posOrder.UpdatedBy }) : null,
      posOrder.Customer_id ? Customer.findOne({ Customer_id: posOrder.Customer_id }) : null,
      posOrder.Table_id ? Table.findOne({ Table_id: posOrder.Table_id }) : null,
      posOrder.Kitchen_id ? Kitchen.findOne({ kitchen_id: posOrder.Kitchen_id }) : null
    ]);

    // Populate items array with detailed information
    const populatedItems = await Promise.all(
      posOrder.items.map(async (itemData) => {
        const { item_id, item_Quentry, item_Addons_id, item_Variants_id, item_status, item_size } = itemData;
        
        const [item, addon, variant] = await Promise.all([
          Items.findOne({ Items_id: parseInt(item_id) }),
          item_Addons_id ? item_Addons.findOne({ item_Addons_id: parseInt(item_Addons_id) }) : null,
          item_Variants_id ? item_Variants.findOne({ item_Variants_id: parseInt(item_Variants_id) }) : null
        ]);

        return {
          item_id,
          item_Quentry,
          item_Addons_id,
          item_Variants_id,
          item_status: item_status || 'Preparing',
          item_size: item_size || null,
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
    posOrderResponse.Table = tableData ? { 
      table_id: tableData.Table_id, 
      table_name: tableData['Table-name'],
      'Table-name': tableData['Table-name'],
      'Table-code': tableData['Table-code']
    } : null;
    posOrderResponse.Kitchen = kitchen ? { 
      kitchen_id: kitchen.kitchen_id, 
      kitchen_name: kitchen.kitchen_name
    } : null;

    res.status(200).json({
      success: true,
      message: 'Current order on table retrieved successfully',
      data: posOrderResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching current order on table',
      error: error.message
    });
  }
};

module.exports = {
  createPosOrder,
  updatePosOrder,
  getPosOrderById,
  getAllPosOrders,
  getPosOrdersByAuth,
  deletePosOrder,
  updatePosOrderItemStatus,
  updatePosOrderStatus,
  getCurrentOrderOnTableByTableId
};
