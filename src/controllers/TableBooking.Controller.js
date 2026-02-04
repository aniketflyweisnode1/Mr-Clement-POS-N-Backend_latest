const Reservations = require('../models/Reservations.model');
const Customer = require('../models/Customer.model');
const User = require('../models/User.model');
const Floor = require('../models/Floor.model');
const Table = require('../models/Table.model');
const TableBookingStatus = require('../models/Table-Booking-Status.model');

// Create Table Booking
const createTableBooking = async (req, res) => {
  try {
    const {
      customer_name,
      customer_mobile,
      customer_email,
      table_id,
      floor_id,
      booking_date,
      booking_time,
      duration_hours,
      number_of_guests,
      special_requests,
      booking_status_id
    } = req.body;

    const userId = req.user.user_id;

    // Validate required fields
    if (!customer_name || !customer_mobile || !table_id || !floor_id || !booking_date || !booking_time || !number_of_guests || !booking_status_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find or create customer
    let customer = await Customer.findOne({ phone: customer_mobile, Status: true });
    if (!customer) {
      // Create new customer
      customer = new Customer({
        Name: customer_name,
        phone: customer_mobile,
        DOB: new Date('1990-01-01'), // Default DOB
        CreateBy: userId
      });
      await customer.save();
    }

    // Validate table exists
    const table = await Table.findOne({ Table_id: parseInt(table_id), Status: true });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Validate floor exists
    const floor = await Floor.findOne({ Floor_id: parseInt(floor_id), Status: true });
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    // Validate booking status exists
    const bookingStatus = await TableBookingStatus.findOne({ 'Table-Booking-Status_id': parseInt(booking_status_id), Status: true });
    if (!bookingStatus) {
      return res.status(404).json({
        success: false,
        message: 'Booking status not found'
      });
    }

    // Combine date and time
    const bookingDateTime = new Date(`${booking_date}T${booking_time}`);

    // Create reservation (table booking)
    const reservation = new Reservations({
      Reservations_online: false, // Table booking is offline
      Customer_id: customer.Customer_id,
      slots: 'Lunch', // Default slot, can be improved
      slots_time: booking_time,
      title: `Table Booking for ${customer_name}`,
      Floor: parseInt(floor_id),
      Capacity_count: table.Capacity || number_of_guests, // Use table capacity or guest count
      people_count: number_of_guests,
      PaymentStatus: 'UnPaid', // Default
      Table_id: parseInt(table_id),
      Date_time: bookingDateTime,
      Notes: special_requests || '',
      Status: true,
      CreateBy: userId
    });

    const savedReservation = await reservation.save();

    res.status(201).json({
      success: true,
      message: 'Table booking created successfully',
      data: {
        booking_id: savedReservation.Reservations_id,
        customer_name,
        customer_mobile,
        table_id,
        floor_id,
        booking_date,
        booking_time,
        number_of_guests,
        special_requests,
        booking_status_id,
        created_at: savedReservation.CreateAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating table booking',
      error: error.message
    });
  }
};

// Update Table Booking
const updateTableBooking = async (req, res) => {
  try {
    const {
      booking_id,
      customer_name,
      customer_mobile,
      customer_email,
      table_id,
      floor_id,
      booking_date,
      booking_time,
      duration_hours,
      number_of_guests,
      special_requests,
      booking_status_id
    } = req.body;

    const userId = req.user.user_id;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const reservation = await Reservations.findOne({ Reservations_id: parseInt(booking_id) });
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Table booking not found'
      });
    }

    // Update customer if name or mobile changed
    if (customer_name || customer_mobile) {
      let customer = await Customer.findOne({ Customer_id: reservation.Customer_id });
      if (customer) {
        if (customer_name) customer.Name = customer_name;
        if (customer_mobile) customer.phone = customer_mobile;
        customer.UpdatedBy = userId;
        customer.UpdatedAt = new Date();
        await customer.save();
      }
    }

    // Update other fields
    if (table_id) reservation.Table_id = parseInt(table_id);
    if (floor_id) reservation.Floor = parseInt(floor_id);
    if (booking_date && booking_time) {
      reservation.Date_time = new Date(`${booking_date}T${booking_time}`);
    } else if (booking_time) {
      const currentDate = reservation.Date_time.toISOString().split('T')[0];
      reservation.Date_time = new Date(`${currentDate}T${booking_time}`);
    }
    if (number_of_guests) reservation.people_count = number_of_guests;
    if (special_requests !== undefined) reservation.Notes = special_requests;

    reservation.UpdatedBy = userId;
    reservation.UpdatedAt = new Date();

    const updatedReservation = await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Table booking updated successfully',
      data: {
        booking_id: updatedReservation.Reservations_id,
        customer_name,
        customer_mobile,
        table_id: updatedReservation.Table_id,
        floor_id: updatedReservation.Floor,
        booking_date: updatedReservation.Date_time.toISOString().split('T')[0],
        booking_time: updatedReservation.Date_time.toISOString().split('T')[1].substring(0, 5),
        number_of_guests: updatedReservation.people_count,
        special_requests: updatedReservation.Notes,
        booking_status_id,
        updated_at: updatedReservation.UpdatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating table booking',
      error: error.message
    });
  }
};

// Get Table Bookings
const getTableBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, status } = req.query;
    const userId = req.user.user_id;

    const filter = { CreateBy: userId, Status: true };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.Date_time = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      // This would need mapping from status name to booking_status_id
      // For now, skip this filter
    }

    const bookings = await Reservations.find(filter)
      .sort({ CreateAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reservations.countDocuments(filter);

    // Populate data
    const bookingsWithData = await Promise.all(bookings.map(async (booking) => {
      const [customer, table, floor] = await Promise.all([
        booking.Customer_id ? Customer.findOne({ Customer_id: booking.Customer_id }) : null,
        booking.Table_id ? Table.findOne({ Table_id: booking.Table_id }) : null,
        booking.Floor ? Floor.findOne({ Floor_id: booking.Floor }) : null
      ]);

      return {
        booking_id: booking.Reservations_id,
        customer_name: customer ? customer.Name : '',
        customer_mobile: customer ? customer.phone : '',
        table_id: booking.Table_id,
        table_name: table ? table.Title : '',
        floor_id: booking.Floor,
        floor_name: floor ? floor.Floor_Name : '',
        booking_date: booking.Date_time.toISOString().split('T')[0],
        booking_time: booking.Date_time.toISOString().split('T')[1].substring(0, 5),
        number_of_guests: booking.people_count,
        special_requests: booking.Notes,
        booking_status: 'confirmed',
        created_at: booking.CreateAt
      };
    }));

    res.status(200).json({
      success: true,
      data: bookingsWithData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table bookings',
      error: error.message
    });
  }
};

module.exports = {
  createTableBooking,
  updateTableBooking,
  getTableBookings
};
