const fs = require('fs');
const path = require('path');

class JsonFileHandler {
  constructor(directory = 'data') {
    this.directory = directory;
    this.ensureDirectoryExists();
  }

  
  ensureDirectoryExists() {
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }
  }

  
  createJsonFile(filename, data) {
    try {
      const filePath = path.join(this.directory, `${filename}.json`);
      if (fs.existsSync(filePath)) {
        throw new Error(`File ${filename}.json already exists`);
      }
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonData, 'utf8');
      return {
        success: true,
        message: `JSON file ${filename}.json created successfully`,
        filePath: filePath,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creating JSON file: ${error.message}`,
        error: error.message
      };
    }
  }

  
  readJsonFile(filename) {
    try {
      const filePath = path.join(this.directory, `${filename}.json`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filename}.json does not exist`);
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      return {
        success: true,
        message: `JSON file ${filename}.json read successfully`,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: `Error reading JSON file: ${error.message}`,
        error: error.message
      };
    }
  }

  deleteJsonFile(filename) {
    try {
      const filePath = path.join(this.directory, `${filename}.json`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filename}.json does not exist`);
      }

      fs.unlinkSync(filePath);

      return {
        success: true,
        message: `JSON file ${filename}.json deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error deleting JSON file: ${error.message}`,
        error: error.message
      };
    }
  }

        
  listJsonFiles() {
    try {
      const files = fs.readdirSync(this.directory);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      return {
        success: true,
        message: `Found ${jsonFiles.length} JSON files`,
        files: jsonFiles
      };
    } catch (error) {
      return {
        success: false,
        message: `Error listing JSON files: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = JsonFileHandler;
