const Audits = require('../models/Audits.model');
const User = require('../models/User.model');

// Create Audit
const createAudit = async (req, res) => {
  try {
    const {
      environment,
      ipAddress,
      Reservations,
      file,
      ChineseRamen,
      Employee_id,
      Status
    } = req.body;

    const audit = new Audits({
      environment,
      ipAddress,
      Reservations,
      file,
      ChineseRamen,
      Employee_id,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedAudit = await audit.save();
    
    // Manually fetch related data
    const [createByUser, employee, updatedByUser] = await Promise.all([
      savedAudit.CreateBy ? User.findOne({ user_id: savedAudit.CreateBy }) : null,
      savedAudit.Employee_id ? User.findOne({ user_id: savedAudit.Employee_id }) : null,
      savedAudit.UpdatedBy ? User.findOne({ user_id: savedAudit.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const auditResponse = savedAudit.toObject();
    auditResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    auditResponse.Employee_id = employee ? 
      { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null;
    auditResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Audit created successfully',
      data: auditResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating audit',
      error: error.message
    });
  }
};

// Update Audit
const updateAudit = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Audit ID is required in request body'
      });
    }

    const audit = await Audits.findOne({ Audits_id: parseInt(id) });
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Audits_id') {
        audit[key] = updateData[key];
      }
    });

    audit.UpdatedBy = userId;
    audit.UpdatedAt = new Date();

    const updatedAudit = await audit.save();
    
    // Manually fetch related data
    const [createByUser, employee, updatedByUser] = await Promise.all([
      updatedAudit.CreateBy ? User.findOne({ user_id: updatedAudit.CreateBy }) : null,
      updatedAudit.Employee_id ? User.findOne({ user_id: updatedAudit.Employee_id }) : null,
      updatedAudit.UpdatedBy ? User.findOne({ user_id: updatedAudit.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const auditResponse = updatedAudit.toObject();
    auditResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    auditResponse.Employee_id = employee ? 
      { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null;
    auditResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Audit updated successfully',
      data: auditResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating audit',
      error: error.message
    });
  }
};

// Get Audit by ID
const getAuditById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const audit = await Audits.findOne({ Audits_id: parseInt(id) });
    
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit not found'
      });
    }

    // Manually fetch related data
    const [createByUser, employee, updatedByUser] = await Promise.all([
      audit.CreateBy ? User.findOne({ user_id: audit.CreateBy }) : null,
      audit.Employee_id ? User.findOne({ user_id: audit.Employee_id }) : null,
      audit.UpdatedBy ? User.findOne({ user_id: audit.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const auditResponse = audit.toObject();
    auditResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    auditResponse.Employee_id = employee ? 
      { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null;
    auditResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: auditResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit',
      error: error.message
    });
  }
};

// Get All Audits
const getAllAudits = async (req, res) => {
  try {
    const audits = await Audits.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all audits
    const auditsResponse = await Promise.all(audits.map(async (audit) => {
      const [createByUser, employee] = await Promise.all([
        audit.CreateBy ? User.findOne({ user_id: audit.CreateBy }) : null,
        audit.Employee_id ? User.findOne({ user_id: audit.Employee_id }) : null
      ]);

      const auditObj = audit.toObject();
      auditObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      auditObj.Employee_id = employee ? 
        { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null;

      return auditObj;
    }));

    res.status(200).json({
      success: true,
      count: auditsResponse.length,
      data: auditsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audits',
      error: error.message
    });
  }
};

// Get Audit by Auth (current logged in user)
const getAuditByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const audits = await Audits.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!audits || audits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Audits not found for current user'
      });
    }

    // Manually fetch related data for all audits
    const auditsResponse = await Promise.all(audits.map(async (audit) => {
      const [createByUser, employee, updatedByUser] = await Promise.all([
        audit.CreateBy ? User.findOne({ user_id: audit.CreateBy }) : null,
        audit.Employee_id ? User.findOne({ user_id: audit.Employee_id }) : null,
        audit.UpdatedBy ? User.findOne({ user_id: audit.UpdatedBy }) : null
      ]);

      const auditObj = audit.toObject();
      auditObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      auditObj.Employee_id = employee ? 
        { user_id: employee.user_id, Name: employee.Name, email: employee.email } : null;
      auditObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return auditObj;
    }));

    res.status(200).json({
      success: true,
      count: auditsResponse.length,
      data: auditsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audits',
      error: error.message
    });
  }
};

// Get Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const audits = await Audits.find({ Status: true }).sort({ CreateAt: -1 });

    const auditLogs = audits.map(audit => ({
      aciton: audit.Reservations || audit.file || audit.ChineseRamen || 'Unknown',
      Environment: audit.environment,
      timestamp: audit.CreateAt,
      ipAddress: audit.ipAddress
    }));

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      count: auditLogs.length,
      data: auditLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
};

module.exports = {
  createAudit,
  updateAudit,
  getAuditById,
  getAllAudits,
  getAuditLogs,
  getAuditByAuth
};
