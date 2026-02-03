const Employee_Feedback = require('../models/Employee_Feedback.model');
const User = require('../models/User.model');

// Create Employee Feedback
const createEmployeeFeedback = async (req, res) => {
  try {
    const { employee_id, order_id, feedback, date, amount, ratings, willRecommendothers, OveralFeedback, staffBehavier, waitingTime, Status } = req.body;
    const userId = req.user.user_id;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: 'employee_id is required'
      });
    }

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'order_id is required'
      });
    }

    // Verify employee exists
    const employee = await User.findOne({ user_id: parseInt(employee_id) });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employeeFeedback = new Employee_Feedback({
      employee_id: parseInt(employee_id),
      order_id: parseInt(order_id),
      feedback: feedback || '',
      date: date ? new Date(date) : new Date(),
      amount: amount !== undefined ? parseFloat(amount) : 0,
      ratings: ratings || null,
      willRecommendothers: willRecommendothers !== undefined ? willRecommendothers : false,
      OveralFeedback: OveralFeedback || 'averoge',
      staffBehavier: staffBehavier || '',
      waitingTime: waitingTime !== undefined ? parseInt(waitingTime) : 0,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedFeedback = await employeeFeedback.save();

    // Populate employee data
    const employeeData = {
      user_id: employee.user_id,
      Name: employee.Name,
      last_name: employee.last_name,
      email: employee.email
    };

    const feedbackResponse = savedFeedback.toObject();
    feedbackResponse.employee_id = employeeData;

    res.status(201).json({
      success: true,
      message: 'Employee feedback created successfully',
      data: feedbackResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating employee feedback',
      error: error.message
    });
  }
};

// Get Employee Feedback with Overall Summary
const getEmployeeFeedback = async (req, res) => {
  try {
    const feedbacks = await Employee_Feedback.find({ Status: true }).sort({ CreateAt: -1 });

    // Calculate overall feedback summary
    const overallFeedback = {
      lovedit: 0,
      good: 0,
      averoge: 0,
      bad: 0,
      warst: 0
    };

    feedbacks.forEach(feedback => {
      if (feedback.OveralFeedback && overallFeedback.hasOwnProperty(feedback.OveralFeedback)) {
        overallFeedback[feedback.OveralFeedback]++;
      }
    });

    // Calculate average waiting time
    const validWaitingTimes = feedbacks.filter(f => f.waitingTime > 0);
    const avgWaitingTime = validWaitingTimes.length > 0
      ? validWaitingTimes.reduce((sum, f) => sum + f.waitingTime, 0) / validWaitingTimes.length
      : 0;

    // Get feedback list with employee details
    const feedbackList = await Promise.all(
      feedbacks.map(async (feedback) => {
        const employee = await User.findOne({ user_id: feedback.employee_id });
        return {
          emplyeeid: feedback.employee_id,
          feedback: feedback.feedback,
          orderid: feedback.order_id,
          date: feedback.date,
          amount: feedback.amount,
          ratings: feedback.ratings,
          willRecommendothers: feedback.willRecommendothers,
          employee_name: employee ? `${employee.Name} ${employee.last_name}` : 'Unknown'
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Employee feedback retrieved successfully',
      data: {
        OveralFeedback: overallFeedback,
        staffBehavier: {
          waitingTime: parseFloat(avgWaitingTime.toFixed(2))
        },
        list: feedbackList
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee feedback',
      error: error.message
    });
  }
};

module.exports = {
  createEmployeeFeedback,
  getEmployeeFeedback
};

