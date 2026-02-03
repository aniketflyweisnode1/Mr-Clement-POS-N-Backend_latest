const Admin_POS_MyDevices_sold_in_restaurant = require('../models/Admin_POS_MyDevices_sold_in_restaurant.model');
const User = require('../models/User.model');
const MyDevices = require('../models/MyDevices.model');
const Transaction = require('../models/Transaction.model');
const Admin_Plan_buy_Restaurant = require('../models/Admin_Plan_buy_Restaurant.model');
const Admin_Plan = require('../models/Admin_Plan.model');
const Clients = require('../models/Clients.model');
const Role = require('../models/Role.model');

// Create Admin POS MyDevices Sold in Restaurant
const createAdminPOSMyDevicesSoldInRestaurant = async (req, res) => {
  try {
    const { user_id, MyDevices_id, isAcitve, Trangeciton_id, paymentState, PrintersCount, SystemsCount, Status } = req.body;
    const userId = req.user.user_id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    if (!MyDevices_id) {
      return res.status(400).json({
        success: false,
        message: 'MyDevices_id is required'
      });
    }

    // Verify user exists
    const user = await User.findOne({ user_id: parseInt(user_id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify MyDevices exists
    const myDevice = await MyDevices.findOne({ MyDevices_id: parseInt(MyDevices_id) });
    if (!myDevice) {
      return res.status(404).json({
        success: false,
        message: 'MyDevices not found'
      });
    }

    // Verify Transaction exists if provided
    if (Trangeciton_id) {
      const transaction = await Transaction.findOne({ transagtion_id: parseInt(Trangeciton_id) });
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
    }

    const adminPOSMyDevicesSold = new Admin_POS_MyDevices_sold_in_restaurant({
      user_id: parseInt(user_id),
      MyDevices_id: parseInt(MyDevices_id),
      isAcitve: isAcitve !== undefined ? isAcitve : false,
      Trangeciton_id: Trangeciton_id ? parseInt(Trangeciton_id) : null,
      paymentState: paymentState !== undefined ? paymentState : false,
      PrintersCount: PrintersCount !== undefined ? parseInt(PrintersCount) : 0,
      SystemsCount: SystemsCount !== undefined ? parseInt(SystemsCount) : 0,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedSold = await adminPOSMyDevicesSold.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData, myDeviceData, transactionData] = await Promise.all([
      User.findOne({ user_id: savedSold.CreateBy }),
      savedSold.UpdatedBy ? User.findOne({ user_id: savedSold.UpdatedBy }) : null,
      User.findOne({ user_id: savedSold.user_id }),
      MyDevices.findOne({ MyDevices_id: savedSold.MyDevices_id }),
      savedSold.Trangeciton_id ? Transaction.findOne({ transagtion_id: savedSold.Trangeciton_id }) : null
    ]);

    const soldResponse = savedSold.toObject();
    soldResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    soldResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    soldResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    soldResponse.MyDevices_id = myDeviceData ? {
      MyDevices_id: myDeviceData.MyDevices_id,
      Name: myDeviceData.Name,
      type: myDeviceData.type
    } : null;
    soldResponse.Trangeciton_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method
    } : null;

    res.status(201).json({
      success: true,
      message: 'Admin POS MyDevices sold in restaurant created successfully',
      data: soldResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin POS MyDevices sold in restaurant',
      error: error.message
    });
  }
};

// Update Admin POS MyDevices Sold in Restaurant
const updateAdminPOSMyDevicesSoldInRestaurant = async (req, res) => {
  try {
    const { id, user_id, MyDevices_id, isAcitve, Trangeciton_id, paymentState, PrintersCount, SystemsCount, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin_MyDevices_sold_in_restaurant_id is required in request body'
      });
    }

    const adminPOSMyDevicesSold = await Admin_POS_MyDevices_sold_in_restaurant.findOne({
      Admin_MyDevices_sold_in_restaurant_id: parseInt(id)
    });

    if (!adminPOSMyDevicesSold) {
      return res.status(404).json({
        success: false,
        message: 'Admin POS MyDevices sold in restaurant not found'
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
      adminPOSMyDevicesSold.user_id = parseInt(user_id);
    }

    if (MyDevices_id !== undefined) {
      const myDevice = await MyDevices.findOne({ MyDevices_id: parseInt(MyDevices_id) });
      if (!myDevice) {
        return res.status(404).json({
          success: false,
          message: 'MyDevices not found'
        });
      }
      adminPOSMyDevicesSold.MyDevices_id = parseInt(MyDevices_id);
    }

    if (isAcitve !== undefined) adminPOSMyDevicesSold.isAcitve = isAcitve;
    if (paymentState !== undefined) adminPOSMyDevicesSold.paymentState = paymentState;
    if (PrintersCount !== undefined) adminPOSMyDevicesSold.PrintersCount = parseInt(PrintersCount);
    if (SystemsCount !== undefined) adminPOSMyDevicesSold.SystemsCount = parseInt(SystemsCount);
    if (Status !== undefined) adminPOSMyDevicesSold.Status = Status;

    if (Trangeciton_id !== undefined) {
      if (Trangeciton_id) {
        const transaction = await Transaction.findOne({ transagtion_id: parseInt(Trangeciton_id) });
        if (!transaction) {
          return res.status(404).json({
            success: false,
            message: 'Transaction not found'
          });
        }
        adminPOSMyDevicesSold.Trangeciton_id = parseInt(Trangeciton_id);
      } else {
        adminPOSMyDevicesSold.Trangeciton_id = null;
      }
    }

    adminPOSMyDevicesSold.UpdatedBy = userId;
    adminPOSMyDevicesSold.UpdatedAt = new Date();

    const updatedSold = await adminPOSMyDevicesSold.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData, myDeviceData, transactionData] = await Promise.all([
      User.findOne({ user_id: updatedSold.CreateBy }),
      User.findOne({ user_id: updatedSold.UpdatedBy }),
      User.findOne({ user_id: updatedSold.user_id }),
      MyDevices.findOne({ MyDevices_id: updatedSold.MyDevices_id }),
      updatedSold.Trangeciton_id ? Transaction.findOne({ transagtion_id: updatedSold.Trangeciton_id }) : null
    ]);

    const soldResponse = updatedSold.toObject();
    soldResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    soldResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    soldResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    soldResponse.MyDevices_id = myDeviceData ? {
      MyDevices_id: myDeviceData.MyDevices_id,
      Name: myDeviceData.Name,
      type: myDeviceData.type
    } : null;
    soldResponse.Trangeciton_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method
    } : null;

    res.status(200).json({
      success: true,
      message: 'Admin POS MyDevices sold in restaurant updated successfully',
      data: soldResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin POS MyDevices sold in restaurant',
      error: error.message
    });
  }
};

// Get Admin POS MyDevices Sold in Restaurant by ID
const getAdminPOSMyDevicesSoldInRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminPOSMyDevicesSold = await Admin_POS_MyDevices_sold_in_restaurant.findOne({
      Admin_MyDevices_sold_in_restaurant_id: parseInt(id)
    });

    if (!adminPOSMyDevicesSold) {
      return res.status(404).json({
        success: false,
        message: 'Admin POS MyDevices sold in restaurant not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, userData, myDeviceData, transactionData] = await Promise.all([
      User.findOne({ user_id: adminPOSMyDevicesSold.CreateBy }),
      adminPOSMyDevicesSold.UpdatedBy ? User.findOne({ user_id: adminPOSMyDevicesSold.UpdatedBy }) : null,
      User.findOne({ user_id: adminPOSMyDevicesSold.user_id }),
      MyDevices.findOne({ MyDevices_id: adminPOSMyDevicesSold.MyDevices_id }),
      adminPOSMyDevicesSold.Trangeciton_id ? Transaction.findOne({ transagtion_id: adminPOSMyDevicesSold.Trangeciton_id }) : null
    ]);

    const soldResponse = adminPOSMyDevicesSold.toObject();
    soldResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    soldResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    soldResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    soldResponse.MyDevices_id = myDeviceData ? {
      MyDevices_id: myDeviceData.MyDevices_id,
      Name: myDeviceData.Name,
      type: myDeviceData.type
    } : null;
    soldResponse.Trangeciton_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method
    } : null;

    res.status(200).json({
      success: true,
      data: soldResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin POS MyDevices sold in restaurant',
      error: error.message
    });
  }
};

// Get All Admin POS MyDevices Sold in Restaurant
const getAllAdminPOSMyDevicesSoldInRestaurant = async (req, res) => {
  try {
    const adminPOSMyDevicesSolds = await Admin_POS_MyDevices_sold_in_restaurant.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all records
    const soldsWithPopulatedData = await Promise.all(
      adminPOSMyDevicesSolds.map(async (sold) => {
        const [createByUser, updatedByUser, userData, myDeviceData, transactionData] = await Promise.all([
          User.findOne({ user_id: sold.CreateBy }),
          sold.UpdatedBy ? User.findOne({ user_id: sold.UpdatedBy }) : null,
          User.findOne({ user_id: sold.user_id }),
          MyDevices.findOne({ MyDevices_id: sold.MyDevices_id }),
          sold.Trangeciton_id ? Transaction.findOne({ transagtion_id: sold.Trangeciton_id }) : null
        ]);

        const soldResponse = sold.toObject();
        soldResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        soldResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        soldResponse.user_id = userData ? {
          user_id: userData.user_id,
          Name: userData.Name,
          email: userData.email
        } : null;
        soldResponse.MyDevices_id = myDeviceData ? {
          MyDevices_id: myDeviceData.MyDevices_id,
          Name: myDeviceData.Name,
          type: myDeviceData.type
        } : null;
        soldResponse.Trangeciton_id = transactionData ? {
          transagtion_id: transactionData.transagtion_id,
          amount: transactionData.amount,
          status: transactionData.status,
          payment_method: transactionData.payment_method
        } : null;

        return soldResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: soldsWithPopulatedData.length,
      data: soldsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin POS MyDevices solds in restaurant',
      error: error.message
    });
  }
};

// Get Admin POS MyDevices Sold in Restaurant by Auth (current logged in user)
const getAdminPOSMyDevicesSoldInRestaurantByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find solds for the current user
    const adminPOSMyDevicesSolds = await Admin_POS_MyDevices_sold_in_restaurant.find({
      user_id: userId,
      Status: true
    }).sort({ CreateAt: -1 });

    if (adminPOSMyDevicesSolds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin POS MyDevices solds found for current user'
      });
    }

    // Fetch related data for all records
    const soldsWithPopulatedData = await Promise.all(
      adminPOSMyDevicesSolds.map(async (sold) => {
        const [createByUser, updatedByUser, myDeviceData, transactionData] = await Promise.all([
          User.findOne({ user_id: sold.CreateBy }),
          sold.UpdatedBy ? User.findOne({ user_id: sold.UpdatedBy }) : null,
          MyDevices.findOne({ MyDevices_id: sold.MyDevices_id }),
          sold.Trangeciton_id ? Transaction.findOne({ transagtion_id: sold.Trangeciton_id }) : null
        ]);

        const soldResponse = sold.toObject();
        soldResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        soldResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        soldResponse.MyDevices_id = myDeviceData ? {
          MyDevices_id: myDeviceData.MyDevices_id,
          Name: myDeviceData.Name,
          type: myDeviceData.type
        } : null;
        soldResponse.Trangeciton_id = transactionData ? {
          transagtion_id: transactionData.transagtion_id,
          amount: transactionData.amount,
          status: transactionData.status,
          payment_method: transactionData.payment_method
        } : null;

        return soldResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: soldsWithPopulatedData.length,
      data: soldsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin POS MyDevices solds in restaurant',
      error: error.message
    });
  }
};

// Delete Admin POS MyDevices Sold in Restaurant
const deleteAdminPOSMyDevicesSoldInRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const adminPOSMyDevicesSold = await Admin_POS_MyDevices_sold_in_restaurant.findOne({
      Admin_MyDevices_sold_in_restaurant_id: parseInt(id)
    });

    if (!adminPOSMyDevicesSold) {
      return res.status(404).json({
        success: false,
        message: 'Admin POS MyDevices sold in restaurant not found'
      });
    }

    await Admin_POS_MyDevices_sold_in_restaurant.deleteOne({ Admin_MyDevices_sold_in_restaurant_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Admin POS MyDevices sold in restaurant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin POS MyDevices sold in restaurant',
      error: error.message
    });
  }
};

// Get POS Hardware Devices Dashboard
const getPOSHardwareDevices_Dashboard = async (req, res) => {
  try {
    // Get restaurant role
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    // Get all restaurant users (clients)
    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    const TotalClientsCount = restaurantUsers.length;

    // Get all sold devices
    const allSoldDevices = await Admin_POS_MyDevices_sold_in_restaurant.find({
      Status: true,
      paymentState: true
    });

    // Calculate TotalPrintersCount and TotalpostSystemsCount
    let TotalPrintersCount = 0;
    let TotalpostSystemsCount = 0;
    let TotalPrice = 0;

    // Get device details to calculate prices
    const deviceIds = [...new Set(allSoldDevices.map(d => d.MyDevices_id))];
    const devices = await MyDevices.find({ MyDevices_id: { $in: deviceIds } });
    const deviceMap = devices.reduce((map, device) => {
      map[device.MyDevices_id] = device;
      return map;
    }, {});

    allSoldDevices.forEach(sold => {
      TotalPrintersCount += sold.PrintersCount || 0;
      TotalpostSystemsCount += sold.SystemsCount || 0;
      const device = deviceMap[sold.MyDevices_id];
      if (device && device.price) {
        TotalPrice += device.price * ((sold.PrintersCount || 0) + (sold.SystemsCount || 0));
      }
    });

    // Calculate HardwareDeviesSolde_Chart - monthly data
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month sold devices
    const currentMonthSold = await Admin_POS_MyDevices_sold_in_restaurant.find({
      Status: true,
      paymentState: true,
      CreateAt: { $gte: currentMonth, $lt: now }
    });

    // Get last month sold devices
    const lastMonthSold = await Admin_POS_MyDevices_sold_in_restaurant.find({
      Status: true,
      paymentState: true,
      CreateAt: { $gte: lastMonth, $lt: currentMonth }
    });

    const currentMonthCount = currentMonthSold.length;
    const lastMonthCount = lastMonthSold.length;
    const soldPercentageChange = lastMonthCount > 0 
      ? parseFloat((((currentMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(2))
      : (currentMonthCount > 0 ? 100 : 0);

    // Generate monthly chart data (last 12 months)
    const monthlyChartData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthSold = await Admin_POS_MyDevices_sold_in_restaurant.countDocuments({
        Status: true,
        paymentState: true,
        CreateAt: { $gte: monthStart, $lt: monthEnd }
      });

      monthlyChartData.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        counts: monthSold
      });
    }

    // Get SoldDetials list
    const soldDetails = await Promise.all(
      allSoldDevices.map(async (sold) => {
        const [user, planBuy, device] = await Promise.all([
          User.findOne({ user_id: sold.user_id }),
          Admin_Plan_buy_Restaurant.findOne({ 
            CreateBy: sold.user_id,
            paymentStatus: true,
            Status: true
          }).sort({ CreateAt: -1 }),
          MyDevices.findOne({ MyDevices_id: sold.MyDevices_id })
        ]);

        const plan = planBuy ? await Admin_Plan.findOne({ Admin_Plan_id: planBuy.Admin_Plan_id }) : null;

        return {
          restaurant_id: sold.user_id,
          Name: user ? `${user.Name} ${user.last_name}` : 'Unknown',
          Plan_id: planBuy ? planBuy.Admin_Plan_id : null,
          Purchased: plan ? plan.PlanName : null,
          Plan_Date: planBuy ? planBuy.paymentSuccessDate || planBuy.CreateAt : null,
          Device_id: sold.MyDevices_id,
          Device_Name: device ? device.Name : null
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'POS Hardware Devices Dashboard retrieved successfully',
      data: {
        TotalClientsCount,
        TotalPrintersCount,
        TotalpostSystemsCount,
        HardwareDeviesSolde_Chart: {
          TotalPrice: parseFloat(TotalPrice.toFixed(2)),
          Sold: soldPercentageChange,
          monthlyData: monthlyChartData
        },
        SoldDetials: soldDetails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching POS Hardware Devices Dashboard',
      error: error.message
    });
  }
};

// PosDeviceSection API
const PosDeviceSection = async (req, res) => {
  try {
    // Get restaurant role
    const restaurantRole = await Role.findOne({ 
      role_name: { $regex: /^restaurant$/i } 
    });

    if (!restaurantRole) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant role not found'
      });
    }

    // Get all restaurant users (clients)
    const restaurantUsers = await User.find({
      Role_id: restaurantRole.Role_id,
      Status: true
    });

    const TotalClientsCount = restaurantUsers.length;

    // Get all sold devices
    const allSoldDevices = await Admin_POS_MyDevices_sold_in_restaurant.find({
      Status: true,
      paymentState: true
    });

    // Calculate TotalPrintersCount and TotalPosSystemsCount
    let TotalPrintersCount = 0;
    let TotalPosSystemsCount = 0;
    let HardwareSoldcost = 0;

    // Get device details to calculate prices
    const deviceIds = [...new Set(allSoldDevices.map(d => d.MyDevices_id))];
    const devices = await MyDevices.find({ MyDevices_id: { $in: deviceIds } });
    const deviceMap = devices.reduce((map, device) => {
      map[device.MyDevices_id] = device;
      return map;
    }, {});

    allSoldDevices.forEach(sold => {
      TotalPrintersCount += sold.PrintersCount || 0;
      TotalPosSystemsCount += sold.SystemsCount || 0;
      const device = deviceMap[sold.MyDevices_id];
      if (device && device.price) {
        HardwareSoldcost += device.price * ((sold.PrintersCount || 0) + (sold.SystemsCount || 0));
      }
    });

    // MonthChart - Last 12 months
    const now = new Date();
    const MonthChart = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthSold = await Admin_POS_MyDevices_sold_in_restaurant.countDocuments({
        CreateAt: { $gte: monthDate, $lt: monthEnd },
        Status: true,
        paymentState: true
      });

      MonthChart.push({
        Month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count: monthSold
      });
    }

    // HordwareSoldList
    const HordwareSoldList = await Promise.all(
      allSoldDevices.map(async (sold) => {
        const [user, planBuy, device] = await Promise.all([
          User.findOne({ user_id: sold.user_id }),
          Admin_Plan_buy_Restaurant.findOne({ 
            CreateBy: sold.user_id,
            paymentStatus: true,
            Status: true
          }).sort({ CreateAt: -1 }),
          MyDevices.findOne({ MyDevices_id: sold.MyDevices_id })
        ]);

        const plan = planBuy ? await Admin_Plan.findOne({ Admin_Plan_id: planBuy.Admin_Plan_id }) : null;
        const client = user ? await Clients.findOne({ CreateBy: user.user_id }) : null;

        return {
          Restaurant_id: sold.user_id,
          BusinessName: client ? client.Business_Name : (user ? user.Name : 'Unknown'),
          PlanPurchased: plan ? plan.PlanName : null,
          PurchasedDate: sold.CreateAt,
          DeviceName: device ? device.Name : null
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'POS Device Section data retrieved successfully',
      data: {
        TotalClientsCount,
        TotalPrintersCount,
        TotalPosSystemsCount,
        HardwareSoldcost: parseFloat(HardwareSoldcost.toFixed(2)),
        MonthChart,
        HordwareSoldList
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching POS Device Section data',
      error: error.message
    });
  }
};

module.exports = {
  createAdminPOSMyDevicesSoldInRestaurant,
  updateAdminPOSMyDevicesSoldInRestaurant,
  getAdminPOSMyDevicesSoldInRestaurantById,
  getAllAdminPOSMyDevicesSoldInRestaurant,
  getAdminPOSMyDevicesSoldInRestaurantByAuth,
  deleteAdminPOSMyDevicesSoldInRestaurant,
  getPOSHardwareDevices_Dashboard,
  PosDeviceSection
};

