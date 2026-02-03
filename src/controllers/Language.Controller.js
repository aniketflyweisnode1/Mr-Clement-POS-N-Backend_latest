const Language = require('../models/Language.model');
const User = require('../models/User.model');

// Create Language
const createLanguage = async (req, res) => {
  try {
    const { Language_name, Status } = req.body;
    const userId = req.user.user_id;

    const language = new Language({
      Language_name,
      Status,
      CreateBy: userId
    });

    const savedLanguage = await language.save();
    
    res.status(201).json({
      success: true,
      message: 'Language created successfully',
      data: savedLanguage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating language',
      error: error.message
    });
  }
};

// Update Language
const updateLanguage = async (req, res) => {
  try {
    const { id, Language_name, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Language ID is required in request body'
      });
    }

    const language = await Language.findOne({ Language_id: parseInt(id) });
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    if (Language_name) language.Language_name = Language_name;
    if (Status !== undefined) language.Status = Status;
    
    language.UpdatedBy = userId;
    language.UpdatedAt = new Date();

    const updatedLanguage = await language.save();
    
    res.status(200).json({
      success: true,
      message: 'Language updated successfully',
      data: updatedLanguage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating language',
      error: error.message
    });
  }
};

// Get Language by ID
const getLanguageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await Language.findOne({ Language_id: parseInt(id) });
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      language.CreateBy ? User.findOne({ user_id: language.CreateBy }) : null,
      language.UpdatedBy ? User.findOne({ user_id: language.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const languageResponse = language.toObject();
    languageResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    languageResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: languageResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching language',
      error: error.message
    });
  }
};

// Get All Languages
const getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.find()
      .sort({ CreateAt: -1 });

    // Manually fetch related data for all languages
    const languagesWithPopulatedData = await Promise.all(
      languages.map(async (language) => {
        const [createByUser, updatedByUser] = await Promise.all([
          language.CreateBy ? User.findOne({ user_id: language.CreateBy }) : null,
          language.UpdatedBy ? User.findOne({ user_id: language.UpdatedBy }) : null
        ]);

        const languageResponse = language.toObject();
        languageResponse.CreateBy = createByUser ? { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
        languageResponse.UpdatedBy = updatedByUser ? { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

        return languageResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: languagesWithPopulatedData.length,
      data: languagesWithPopulatedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching languages',
      error: error.message
    });
  }
};

// Delete Language
const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await Language.findOne({ Language_id: parseInt(id) });
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    await Language.deleteOne({ Language_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Language deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting language',
      error: error.message
    });
  }
};

// Get Language by Auth (current logged in user)
const getLanguageByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log(userId,"userId")
    const languages = await Language.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!languages || languages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Languages not found for current user'
      });
    }

    // Manually fetch related data for all languages
    const languagesResponse = await Promise.all(languages.map(async (language) => {
      const [createByUser, updatedByUser] = await Promise.all([
        language.CreateBy ? User.findOne({ user_id: language.CreateBy }) : null,
        language.UpdatedBy ? User.findOne({ user_id: language.UpdatedBy }) : null
      ]);

      const languageObj = language.toObject();
      languageObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      languageObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return languageObj;
    }));

    res.status(200).json({
      success: true,
      count: languagesResponse.length,
      data: languagesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching languages',
      error: error.message
    });
  }
};

module.exports = {
  createLanguage,
  updateLanguage,
  getLanguageById,
  getAllLanguages,
  getLanguageByAuth,
  deleteLanguage
};
