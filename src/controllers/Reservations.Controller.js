const Reservations = require('../models/Reservations.model');
const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const Floor = require('../models/Floor.model');
const Table = require('../models/Table.model');

// Create reservation
const createReservation = async (req, res) => {
  try {
    const { 
      Reservations_online, 
      Customer_id, 
      slots, 
      slots_time, 
      title, 
      Floor, 
      Capacity_count, 
      people_count, 
      PaymentStatus, 
      Table_id, 
      Addone_Table_id, 
      Date_time, 
      Notes, 
      Status 
    } = req.body;
    
    const userId = req.user.user_id;

    const reservation = new Reservations({
      Reservations_online,
      Customer_id,
      slots,
      slots_time,
      title,
      Floor,
      Capacity_count,
      people_count,
      PaymentStatus,
      Table_id,
      Addone_Table_id,
      Date_time,
      Notes,
      Status,
      CreateBy: userId
    });

    const savedReservation = await reservation.save();
    
    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: savedReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  try {
    const { 
      id, 
      Reservations_online, 
      Customer_id, 
      slots, 
      slots_time, 
      title, 
      Floor, 
      Capacity_count, 
      people_count, 
      PaymentStatus, 
      Table_id, 
      Addone_Table_id, 
      Date_time, 
      Notes, 
      Status 
    } = req.body;
    
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Reservation ID is required in request body'
      });
    }

    const reservation = await Reservations.findOne({ Reservations_id: parseInt(id) });
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Update fields if provided
    if (Reservations_online !== undefined) reservation.Reservations_online = Reservations_online;
    if (Customer_id !== undefined) reservation.Customer_id = Customer_id;
    if (slots !== undefined) reservation.slots = slots;
    if (slots_time !== undefined) reservation.slots_time = slots_time;
    if (title !== undefined) reservation.title = title;
    if (Floor !== undefined) reservation.Floor = Floor;
    if (Capacity_count !== undefined) reservation.Capacity_count = Capacity_count;
    if (people_count !== undefined) reservation.people_count = people_count;
    if (PaymentStatus !== undefined) reservation.PaymentStatus = PaymentStatus;
    if (Table_id !== undefined) reservation.Table_id = Table_id;
    if (Addone_Table_id !== undefined) reservation.Addone_Table_id = Addone_Table_id;
    if (Date_time !== undefined) reservation.Date_time = Date_time;
    if (Notes !== undefined) reservation.Notes = Notes;
    if (Status !== undefined) reservation.Status = Status;
    
    reservation.UpdatedBy = userId;
    reservation.UpdatedAt = new Date();

    const updatedReservation = await reservation.save();
    
    res.status(200).json({
      success: true,
      message: 'Reservation updated successfully',
      data: updatedReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating reservation',
      error: error.message
    });
  }
};

// Get reservation by ID
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservations.findOne({ Reservations_id: parseInt(id) });
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, customer, floor, table, addonTable] = await Promise.all([
      reservation.CreateBy ? User.findOne({ user_id: reservation.CreateBy }) : null,
      reservation.UpdatedBy ? User.findOne({ user_id: reservation.UpdatedBy }) : null,
      reservation.Customer_id ? Customer.findOne({ Customer_id: reservation.Customer_id }) : null,
      reservation.Floor ? Floor.findOne({ floor_id: reservation.Floor }) : null,
      reservation.Table_id ? Table.findOne({ table_id: reservation.Table_id }) : null,
      reservation.Addone_Table_id ? Table.findOne({ table_id: reservation.Addone_Table_id }) : null
    ]);

    // Create response object with populated data
    const reservationResponse = reservation.toObject();
    reservationResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    reservationResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    reservationResponse.Customer = customer ? { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;
    reservationResponse.Floor = floor ? { floor_id: floor.floor_id, floor_name: floor.floor_name } : null;
    reservationResponse.Table = table ? { table_id: table.table_id, table_name: table.table_name } : null;
    reservationResponse.AddonTable = addonTable ? { table_id: addonTable.table_id, table_name: addonTable.table_name } : null;

    res.status(200).json({
      success: true,
      data: reservationResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation',
      error: error.message
    });
  }
};

// Get all reservations
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservations.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all reservations
    const reservationsWithPopulatedData = await Promise.all(
      reservations.map(async (reservation) => {
        const [createByUser, updatedByUser, customer, floor, table, addonTable] = await Promise.all([
          reservation.CreateBy ? User.findOne({ user_id: reservation.CreateBy }) : null,
          reservation.UpdatedBy ? User.findOne({ user_id: reservation.UpdatedBy }) : null,
          reservation.Customer_id ? Customer.findOne({ Customer_id: reservation.Customer_id }) : null,
          reservation.Floor ? Floor.findOne({ floor_id: reservation.Floor }) : null,
          reservation.Table_id ? Table.findOne({ table_id: reservation.Table_id }) : null,
          reservation.Addone_Table_id ? Table.findOne({ table_id: reservation.Addone_Table_id }) : null
        ]);

        const reservationResponse = reservation.toObject();
        reservationResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        reservationResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        reservationResponse.Customer = customer ? { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;
        reservationResponse.Floor = floor ? { floor_id: floor.floor_id, floor_name: floor.floor_name } : null;
        reservationResponse.Table = table ? { table_id: table.table_id, table_name: table.table_name } : null;
        reservationResponse.AddonTable = addonTable ? { table_id: addonTable.table_id, table_name: addonTable.table_name } : null;

        return reservationResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: reservationsWithPopulatedData.length,
      data: reservationsWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
};
const getReservationsWithFilter = async (req, res) => {
  try {
    const { search, slots, PaymentStatus, Floor, startDate, endDate } = req.query;

    const filter = {};

    // Basic filters
    if (slots) filter.slots = slots;
    if (PaymentStatus) filter.PaymentStatus = PaymentStatus;
    if (Floor) filter.Floor = Number(Floor);

    if (startDate || endDate) {
      filter.Date_time = {};
      if (startDate) filter.Date_time.$gte = new Date(startDate);
      if (endDate) filter.Date_time.$lte = new Date(endDate);
    }

    /* 🔥 GLOBAL KEYWORD SEARCH */
    if (search) {
      // Customers
      const customers = await Customer.find({
        $or: [
          { Name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('Customer_id');

      const customerIds = customers.map(c => c.Customer_id);

      // Users
      const users = await User.find({
        $or: [
          { Name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('user_id');

      const userIds = users.map(u => u.user_id);

      // Tables
      const tables = await Table.find({
        table_name: { $regex: search, $options: 'i' }
      }).select('table_id');

      const tableIds = tables.map(t => t.table_id);

      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { Notes: { $regex: search, $options: 'i' } },
        { slots: { $regex: search, $options: 'i' } },
        { PaymentStatus: { $regex: search, $options: 'i' } },
        { Customer_id: { $in: customerIds } },
        { CreateBy: { $in: userIds } },
        { UpdatedBy: { $in: userIds } },
        { Table_id: { $in: tableIds } },
        { Addone_Table_id: { $in: tableIds } }
      ];
    }

    const reservations = await Reservations.find(filter)
      .sort({ CreateAt: -1 });

    const result = await Promise.all(
      reservations.map(async (r) => {
        const [customer, user, table, addon] = await Promise.all([
          r.Customer_id ? Customer.findOne({ Customer_id: r.Customer_id }) : null,
          r.CreateBy ? User.findOne({ user_id: r.CreateBy }) : null,
          r.Table_id ? Table.findOne({ table_id: r.Table_id }) : null,
          r.Addone_Table_id ? Table.findOne({ table_id: r.Addone_Table_id }) : null
        ]);

        const obj = r.toObject();
        obj.Customer = customer;
        obj.CreateBy = user;
        obj.Table = table;
        obj.AddonTable = addon;

        return obj;
      })
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Global search failed',
      error: error.message
    });
  }
};


// Delete Reservation
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservations.findOne({ Reservations_id: parseInt(id) });
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    await Reservations.deleteOne({ Reservations_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting reservation',
      error: error.message
    });
  }
};

// Get Reservations by Auth (current logged in user)
const getReservationsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const reservations = await Reservations.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!reservations || reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservations not found for current user'
      });
    }

    // Manually fetch related data for all reservations
    const reservationsResponse = await Promise.all(reservations.map(async (reservation) => {
      const [createByUser, updatedByUser] = await Promise.all([
        reservation.CreateBy ? User.findOne({ user_id: reservation.CreateBy }) : null,
        reservation.UpdatedBy ? User.findOne({ user_id: reservation.UpdatedBy }) : null
      ]);

      const reservationObj = reservation.toObject();
      reservationObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      reservationObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return reservationObj;
    }));

    res.status(200).json({
      success: true,
      count: reservationsResponse.length,
      data: reservationsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
};

module.exports = {
  createReservation,
  updateReservation,
  getReservationById,
  getAllReservations,
  getReservationsByAuth,
  deleteReservation,
  getReservationsWithFilter
};
