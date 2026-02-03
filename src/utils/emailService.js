const nodemailer = require('nodemailer');

// Create transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to your email service
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });
};

/**
 * Send OTP email for forget password
 * @param {string} to - Recipient email
 * @param {string} otp - 8-digit OTP
 * @param {string} userName - User's name
 * @returns {Promise} Email send result
 */
const sendForgetPasswordOTP = async (to, otp, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: to,
      subject: 'Password Reset OTP - Mr Hangout Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #333; margin: 0;">🔐 Password Reset Request</h2>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password for your Mr Hangout Club account.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code:</p>
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Please enter this OTP in the app to reset your password. This OTP is valid for 10 minutes.
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                <strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email or contact our support team.
            </p>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 0;">
              Best regards,<br>
              <strong>Mr Hangout Club Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset confirmation email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {string} newPassword - New password (if provided)
 * @returns {Promise} Email send result
 */
const sendPasswordResetConfirmation = async (to, userName, newPassword = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: to,
      subject: 'Password Reset Successful - Mr Hangout Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; background-color: #d4edda; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #155724; margin: 0;">✅ Password Reset Successful</h2>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Your password has been successfully reset for your Mr Hangout Club account.
            </p>
            
            ${newPassword ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Your New Password:</p>
              <h3 style="color: #007bff; font-size: 18px; margin: 0; font-weight: bold;">${newPassword}</h3>
            </div>
            ` : ''}
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              You can now log in to your account using your new password.
            </p>
            
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #0c5460; font-size: 14px; margin: 0;">
                <strong>Security Tip:</strong> For your security, we recommend changing your password after logging in.
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 0;">
              Best regards,<br>
              <strong>Mr Hangout Club Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password details email after OTP verification
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {string} passwordInfo - Password information
 * @returns {Promise} Email send result
 */
const sendPasswordDetailsEmail = async (to, userName, passwordInfo) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: to,
      subject: 'Your Account Password Details - Mr Hangout Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; background-color: #e3f2fd; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #1976d2; margin: 0;">🔐 Account Password Details</h2>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              You have successfully verified your identity through OTP. Here are your account password details:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Password Information:</p>
              <p style="color: #007bff; font-size: 16px; margin: 0; font-weight: bold;">${passwordInfo}</p>
            </div>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              You can now log in to your Mr Hangout Club account using your credentials.
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                <strong>Security Notice:</strong> Keep your password secure and never share it with anyone. If you suspect any unauthorized access, please contact our support team immediately.
              </p>
            </div>
            
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #0c5460; font-size: 14px; margin: 0;">
                <strong>Need Help?</strong> If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 0;">
              Best regards,<br>
              <strong>Mr Hangout Club Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send renewal email with subscription details
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {object} subscriptionDetails - Subscription details object
 * @returns {Promise} Email send result
 */
const sendRenewalEmail = async (to, userName, subscriptionDetails) => {
  try {
    const transporter = createTransporter();
    
    // Format dates
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: to,
      subject: 'Subscription Renewal Reminder - Mr Hangout Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; background-color: #e3f2fd; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #1976d2; margin: 0;">📅 Subscription Renewal Reminder</h2>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              This is a reminder about your subscription details. Please review the information below:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; font-size: 18px; margin: 0 0 20px 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Subscription Details</h3>
              
              <div style="margin-bottom: 15px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>Current Plan:</strong></p>
                <p style="color: #333; font-size: 16px; margin: 0;">${subscriptionDetails.CurrentPlan ? subscriptionDetails.CurrentPlan.PlanName : 'N/A'}</p>
                ${subscriptionDetails.CurrentPlan && subscriptionDetails.CurrentPlan.Description ? `
                <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">${subscriptionDetails.CurrentPlan.Description}</p>
                ` : ''}
              </div>
              
              <div style="margin-bottom: 15px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>Purchased Date:</strong></p>
                <p style="color: #333; font-size: 16px; margin: 0;">${formatDate(subscriptionDetails.PuchasedDate)}</p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>Renewal Date:</strong></p>
                <p style="color: #333; font-size: 16px; margin: 0;">${formatDate(subscriptionDetails.RenewalDate)}</p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>First Purchase On:</strong></p>
                <p style="color: #333; font-size: 16px; margin: 0;">${formatDate(subscriptionDetails.FirstPurchaseOn)}</p>
              </div>
              
              <div style="margin-bottom: 0;">
                <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;"><strong>Number of Renewals:</strong></p>
                <p style="color: #333; font-size: 16px; margin: 0;">${subscriptionDetails.NoofRenewals}</p>
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                <strong>Renewal Notice:</strong> Your subscription will expire on ${formatDate(subscriptionDetails.RenewalDate)}. Please renew your plan to continue enjoying our services.
              </p>
            </div>
            
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #0c5460; font-size: 14px; margin: 0;">
                <strong>Need Help?</strong> If you have any questions about your subscription or need assistance with renewal, please don't hesitate to contact our support team.
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 0;">
              Best regards,<br>
              <strong>Mr Hangout Club Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendForgetPasswordOTP,
  sendPasswordResetConfirmation,
  sendPasswordDetailsEmail,
  sendRenewalEmail
};
