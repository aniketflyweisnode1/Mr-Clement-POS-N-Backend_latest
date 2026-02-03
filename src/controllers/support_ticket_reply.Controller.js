const support_ticket_reply = require('../models/support_ticket_reply.model');
const support_ticket = require('../models/support_ticket.model');
const User = require('../models/User.model');

// Create support ticket reply
const createSupportTicketReply = async (req, res) => {
  try {
    const { support_ticket_id, reply, employee_id, Ticket_status, Status } = req.body;
    const userId = req.user.user_id;

    // Check if support ticket exists
    const existingTicket = await support_ticket.findOne({ support_ticket_id: parseInt(support_ticket_id) });
    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const supportTicketReply = new support_ticket_reply({
      support_ticket_id,
      reply,
      employee_id,
      Ticket_status,
      Status,
      CreateBy: userId
    });

    const savedSupportTicketReply = await supportTicketReply.save();

    // Update the support ticket status if Ticket_status is provided
    if (Ticket_status) {
      existingTicket.Ticket_status = Ticket_status;
      existingTicket.UpdatedBy = userId;
      existingTicket.UpdatedAt = new Date();
      await existingTicket.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Support ticket reply created successfully',
      data: savedSupportTicketReply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating support ticket reply',
      error: error.message
    });
  }
};

// Update support ticket reply
const updateSupportTicketReply = async (req, res) => {
  try {
    const { id, support_ticket_id, reply, employee_id, Ticket_status, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Support ticket reply ID is required in request body'
      });
    }

    const supportTicketReply = await support_ticket_reply.findOne({ support_ticket_reply_id: parseInt(id) });
    if (!supportTicketReply) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket reply not found'
      });
    }

    if (support_ticket_id !== undefined) supportTicketReply.support_ticket_id = support_ticket_id;
    if (reply !== undefined) supportTicketReply.reply = reply;
    if (employee_id !== undefined) supportTicketReply.employee_id = employee_id;
    if (Ticket_status !== undefined) supportTicketReply.Ticket_status = Ticket_status;
    if (Status !== undefined) supportTicketReply.Status = Status;
    
    supportTicketReply.UpdatedBy = userId;
    supportTicketReply.UpdatedAt = new Date();

    const updatedSupportTicketReply = await supportTicketReply.save();

    // Update the support ticket status if Ticket_status is provided
    if (Ticket_status) {
      const existingTicket = await support_ticket.findOne({ support_ticket_id: parseInt(support_ticket_id || supportTicketReply.support_ticket_id) });
      if (existingTicket) {
        existingTicket.Ticket_status = Ticket_status;
        existingTicket.UpdatedBy = userId;
        existingTicket.UpdatedAt = new Date();
        await existingTicket.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Support ticket reply updated successfully',
      data: updatedSupportTicketReply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating support ticket reply',
      error: error.message
    });
  }
};

// Get support ticket reply by ID
const getSupportTicketReplyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supportTicketReply = await support_ticket_reply.findOne({ support_ticket_reply_id: parseInt(id) });
    
    if (!supportTicketReply) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket reply not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, employee, supportTicket] = await Promise.all([
      supportTicketReply.CreateBy ? User.findOne({ user_id: supportTicketReply.CreateBy }) : null,
      supportTicketReply.UpdatedBy ? User.findOne({ user_id: supportTicketReply.UpdatedBy }) : null,
      supportTicketReply.employee_id ? User.findOne({ user_id: supportTicketReply.employee_id }) : null,
      supportTicketReply.support_ticket_id ? support_ticket.findOne({ support_ticket_id: supportTicketReply.support_ticket_id }) : null
    ]);

    // Create response object with populated data
    const supportTicketReplyResponse = supportTicketReply.toObject();
    supportTicketReplyResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    supportTicketReplyResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    supportTicketReplyResponse.Employee = employee ? { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null;
    supportTicketReplyResponse.SupportTicket = supportTicket ? { support_ticket_id: supportTicket.support_ticket_id, question: supportTicket.question } : null;

    res.status(200).json({
      success: true,
      data: supportTicketReplyResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket reply',
      error: error.message
    });
  }
};

// Get all support ticket replies
const getAllSupportTicketReplies = async (req, res) => {
  try {
    // Get ticket_id from query parameter for filtering
    const { ticket_id } = req.query;
    
    // Build query object
    const query = {};
    if (ticket_id) {
      query.support_ticket_id = parseInt(ticket_id);
    }
    
    const supportTicketReplies = await support_ticket_reply.find(query)
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all support ticket replies
    const supportTicketRepliesWithPopulatedData = await Promise.all(
      supportTicketReplies.map(async (supportTicketReply) => {
        const [createByUser, updatedByUser, employee, supportTicket] = await Promise.all([
          supportTicketReply.CreateBy ? User.findOne({ user_id: supportTicketReply.CreateBy }) : null,
          supportTicketReply.UpdatedBy ? User.findOne({ user_id: supportTicketReply.UpdatedBy }) : null,
          supportTicketReply.employee_id ? User.findOne({ user_id: supportTicketReply.employee_id }) : null,
          supportTicketReply.support_ticket_id ? support_ticket.findOne({ support_ticket_id: supportTicketReply.support_ticket_id }) : null
        ]);

        const supportTicketReplyResponse = supportTicketReply.toObject();
        supportTicketReplyResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        supportTicketReplyResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
        supportTicketReplyResponse.Employee = employee ? { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null;
        supportTicketReplyResponse.SupportTicket = supportTicket ? { support_ticket_id: supportTicket.support_ticket_id, question: supportTicket.question } : null;

        return supportTicketReplyResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: supportTicketRepliesWithPopulatedData.length,
      data: supportTicketRepliesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket replies',
      error: error.message
    });
  }
};

// Delete support ticket reply
const deleteSupportTicketReply = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supportTicketReply = await support_ticket_reply.findOne({ support_ticket_reply_id: parseInt(id) });
    
    if (!supportTicketReply) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket reply not found'
      });
    }

    await support_ticket_reply.deleteOne({ support_ticket_reply_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Support ticket reply deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting support ticket reply',
      error: error.message
    });
  }
};

// Get Support Ticket Reply by Auth (current logged in user)
const getSupportTicketReplyByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const supportTicketReplies = await support_ticket_reply.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!supportTicketReplies || supportTicketReplies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket replies not found for current user'
      });
    }

    // Manually fetch related data for all support ticket replies
    const supportTicketRepliesResponse = await Promise.all(supportTicketReplies.map(async (supportTicketReply) => {
      const [createByUser, updatedByUser] = await Promise.all([
        supportTicketReply.CreateBy ? User.findOne({ user_id: supportTicketReply.CreateBy }) : null,
        supportTicketReply.UpdatedBy ? User.findOne({ user_id: supportTicketReply.UpdatedBy }) : null
      ]);

      const supportTicketReplyObj = supportTicketReply.toObject();
      supportTicketReplyObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      supportTicketReplyObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return supportTicketReplyObj;
    }));

    res.status(200).json({
      success: true,
      count: supportTicketRepliesResponse.length,
      data: supportTicketRepliesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket replies',
      error: error.message
    });
  }
};

module.exports = {
  createSupportTicketReply,
  updateSupportTicketReply,
  getSupportTicketReplyById,
  getAllSupportTicketReplies,
  getSupportTicketReplyByAuth,
  deleteSupportTicketReply
};
