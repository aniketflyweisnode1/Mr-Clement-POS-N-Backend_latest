const express = require('express');
const router = express.Router();
const {
  createJsonFile,
  fillAllJsonFilesToDatabase,
} = require('../../controllers/JsonFile.Controller.js');


// Create a new JSON file with data
router.post('/create',  createJsonFile);

// Fill all JSON files in target folder to database (POST)
router.post('/fill-all-to-database',  fillAllJsonFilesToDatabase);

module.exports = router;
