/**
 * Generate a random 8-digit OTP
 * @returns {string} 8-digit OTP string
 */
const generateOTP = () => {
  // Generate a random 8-digit number
  const otp = Math.floor(10000000 + Math.random() * 90000000);
  return otp.toString();
};

/**
 * Generate a random 8-digit OTP with custom length
 * @param {number} length - Length of OTP (default: 8)
 * @returns {string} OTP string
 */
const generateCustomOTP = (length = 8) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Validate OTP format (8 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} true if valid, false otherwise
 */
const validateOTP = (otp) => {
  const otpRegex = /^\d{8}$/;
  return otpRegex.test(otp);
};

module.exports = {
  generateOTP,
  generateCustomOTP,
  validateOTP
};
