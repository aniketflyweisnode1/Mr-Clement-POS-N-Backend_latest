const Faq = require('../models/Faq.model');
const User = require('../models/User.model');

// Create FAQ
const createFaq = async (req, res) => {
  try {
    const { faq_question, faq_answer, Status } = req.body;
    const userId = req.user.user_id;

    const faq = new Faq({
      faq_question,
      faq_answer,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedFaq = await faq.save();
    
    // Fetch creator details
    const createByUser = await User.findOne({ user_id: savedFaq.CreateBy });

    // Create response object with populated data
    const faqResponse = savedFaq.toObject();
    faqResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faqResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

// Update FAQ
const updateFaq = async (req, res) => {
  try {
    const { faq_in_id, faq_question, faq_answer, Status } = req.body;
    const userId = req.user.user_id;

    const faq = await Faq.findOne({ faq_in_id });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Update fields
    if (faq_question !== undefined) faq.faq_question = faq_question;
    if (faq_answer !== undefined) faq.faq_answer = faq_answer;
    if (Status !== undefined) faq.Status = Status;
    faq.UpdatedBy = userId;
    faq.UpdatedAt = new Date();

    const updatedFaq = await faq.save();
    
    // Fetch creator and updater details
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: updatedFaq.CreateBy }),
      User.findOne({ user_id: updatedFaq.UpdatedBy })
    ]);

    // Create response object with populated data
    const faqResponse = updatedFaq.toObject();
    faqResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;
    faqResponse.UpdatedBy = updatedByUser ? { 
      user_id: updatedByUser.user_id, 
      Name: updatedByUser.Name, 
      email: updatedByUser.email 
    } : null;

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faqResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

// Get FAQ by ID
const getFaqById = async (req, res) => {
  try {
    const { faq_in_id } = req.params;

    const faq = await Faq.findOne({ faq_in_id });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Fetch creator and updater details
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: faq.CreateBy }),
      faq.UpdatedBy ? User.findOne({ user_id: faq.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const faqResponse = faq.toObject();
    faqResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;
    faqResponse.UpdatedBy = updatedByUser ? { 
      user_id: updatedByUser.user_id, 
      Name: updatedByUser.Name, 
      email: updatedByUser.email 
    } : null;

    res.status(200).json({
      success: true,
      message: 'FAQ retrieved successfully',
      data: faqResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving FAQ',
      error: error.message
    });
  }
};

// Get All FAQs
const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ Status: true }).sort({ CreateAt: -1 });

    // Fetch creator and updater details for all FAQs
    const faqsWithUsers = await Promise.all(
      faqs.map(async (faq) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: faq.CreateBy }),
          faq.UpdatedBy ? User.findOne({ user_id: faq.UpdatedBy }) : null
        ]);

        const faqResponse = faq.toObject();
        faqResponse.CreateBy = createByUser ? { 
          user_id: createByUser.user_id, 
          Name: createByUser.Name, 
          email: createByUser.email 
        } : null;
        faqResponse.UpdatedBy = updatedByUser ? { 
          user_id: updatedByUser.user_id, 
          Name: updatedByUser.Name, 
          email: updatedByUser.email 
        } : null;

        return faqResponse;
      })
    );

    res.status(200).json({
      success: true,
      message: 'FAQs retrieved successfully',
      data: faqsWithUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving FAQs',
      error: error.message
    });
  }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
  try {
    const { faq_in_id } = req.params;
    
    const faq = await Faq.findOne({ faq_in_id });
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await Faq.deleteOne({ faq_in_id });
    
    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    });
  }
};

// Get FAQ by Auth (current logged in user)
const getFaqByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const faqs = await Faq.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!faqs || faqs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQs not found for current user'
      });
    }

    // Manually fetch related data for all FAQs
    const faqsResponse = await Promise.all(faqs.map(async (faq) => {
      const [createByUser, updatedByUser] = await Promise.all([
        faq.CreateBy ? User.findOne({ user_id: faq.CreateBy }) : null,
        faq.UpdatedBy ? User.findOne({ user_id: faq.UpdatedBy }) : null
      ]);

      const faqObj = faq.toObject();
      faqObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      faqObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return faqObj;
    }));

    res.status(200).json({
      success: true,
      count: faqsResponse.length,
      data: faqsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

module.exports = {
  createFaq,
  updateFaq,
  getFaqById,
  getAllFaqs,
  getFaqByAuth,
  deleteFaq
};
