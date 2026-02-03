const { processScheduledMessages } = require('../controllers/Admin_Message.Controller');

// Run scheduler to check for messages scheduled for today and create Admin_Message_with_client records
const startMessageScheduler = () => {
  // Run every hour (3600000 ms = 1 hour)
  const interval = setInterval(async () => {
    console.log('Running scheduled message processor at', new Date().toISOString());
    try {
      const result = await processScheduledMessages();
      if (result.processed > 0) {
        console.log('Scheduled messages processed:', result);
      }
    } catch (error) {
      console.error('Error in scheduled message processor:', error);
    }
  }, 60 * 60 * 1000); // Run every hour

  // Also run immediately on startup
  setTimeout(async () => {
    console.log('Running initial scheduled message processor at', new Date().toISOString());
    try {
      const result = await processScheduledMessages();
      console.log('Initial scheduled messages processed:', result);
    } catch (error) {
      console.error('Error in initial scheduled message processor:', error);
    }
  }, 5000); // Run 5 seconds after startup

  console.log('Message scheduler started (runs every hour)');
  
  // Return interval so it can be cleared if needed
  return interval;
};

module.exports = {
  startMessageScheduler
};

