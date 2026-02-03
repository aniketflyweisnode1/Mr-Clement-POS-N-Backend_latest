const generateEmployeeId = async () => {
  let employeeId;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate a random 10-digit number
    employeeId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    // Check if this employee ID already exists
    const User = require('../models/User.model');
    const existingUser = await User.findOne({ Employee_id: employeeId });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return employeeId;
};

module.exports = { generateEmployeeId };
