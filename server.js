const express = require("express");
const http = require("http");
const connectDB = require('./src/config/database.js');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./src/routes/index.js');
const { startMessageScheduler } = require('./src/cronjobs/messageScheduler.js');
const logger = require('./src/utils/logger.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3006;
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// HTTP Request Logger (Morgan) - logs to Winston
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { 
  stream: logger.stream 
}));

// Connect to Database
connectDB();

// Start message scheduler cronjob
startMessageScheduler();

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use('/api/v1', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
server.listen(port, async () => {
    logger.info(`🚀 Server is running on port ${port}`);
    logger.info(`📍 API Base URL: http://localhost:${port}/api/v1`);
});
