const JsonFileHandler = require('../utils/jsonFileHandler');
const JsonFileData = require('../models/JsonFileData.model');

// Create a new JSON file with data
const createJsonFile = async (req, res) => {
  try {
    const { filename, data, data_type = 'other', description = '', tags = [] } = req.body;
    const userId = req.user?.user_id;

    if (!filename || !data) {
      return res.status(400).json({
        success: false,
        message: 'Filename and data are required'
      });
    }

    if (typeof filename !== 'string' || filename.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Filename must be a non-empty string'
      });
    }

    if (typeof data !== 'object' || data === null) {
      return res.status(400).json({
        success: false,
        message: 'Data must be a valid object'
      });
    }

    const jsonHandler = new JsonFileHandler();
    
    const result = jsonHandler.createJsonFile(filename, data);

    if (result.success) {
      const fileSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
      
      // const jsonFileData = new JsonFileData({
      //   filename: filename,
      //   original_filename: `${filename}.json`,
      //   file_path: result.filePath,
      //   data_content: data,
      //   file_size: fileSize,
      //   data_type: data_type,
      //   description: description,
      //   tags: tags,
      //   CreateBy: userId || 1 
      // });

      // await jsonFileData.save();

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          filename: `${filename}.json`,
          filePath: result.filePath,
          savedData: result.data,
          // databaseRecord: {
          //   json_file_id: jsonFileData.json_file_id,
          //   data_type: jsonFileData.data_type,
          //   description: jsonFileData.description,
          //   tags: jsonFileData.tags
          // }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating JSON file',
      error: error.message
    });
  }
};


// Fill all JSON files to database
const fillAllJsonFilesToDatabase = async (req, res) => {
  try {
    const { target_model, user_rules} = req.body;
    const userId = req.user?.user_id;
    const auto_delete = false;
    const folder_path = 'data';
    if (!target_model) {
      return res.status(400).json({
        success: false,
        message: 'Target model is required'
      });
    }

    const jsonHandler = new JsonFileHandler(folder_path);

    const listResult = jsonHandler.listJsonFiles();

    if (!listResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Error listing JSON files',
        error: listResult.error
      });
    }

    if (listResult.files.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No JSON files found in folder: ${folder_path}`,
        data: {
          folder_path: folder_path,
          target_model: target_model,
          processed_files: 0,
          total_files: 0
        }
      });
    }

    let totalProcessedRecords = 0;
    let processedFiles = 0;
    let failedFiles = 0;
    let deletedFiles = 0;
    let allErrors = [];
    let fileResults = [];

    for (const file of listResult.files) {
      const filename = file.replace('.json', ''); 
      try {
        const fileResult = jsonHandler.readJsonFile(filename);
        if (!fileResult.success) {
          failedFiles++;
          allErrors.push({
            filename: filename,
            error: fileResult.error,
            type: 'read_error'
          });
          continue;
        }

        const jsonData = fileResult.data;
        let processedRecords = 0;
        let fileErrors = [];

        try {
          if (Array.isArray(jsonData)) {
            
            for (let i = 0; i < jsonData.length; i++) {
              try {
                const record = jsonData[i];
                const mappedData = user_rules ? mapDataWithRules(record, user_rules) : record;
                
                mappedData.CreateBy = userId || 1;        
                
                const Model = require(`../models/${target_model}.model.js`);
                const newRecord = new Model(mappedData);
                await newRecord.save();
                processedRecords++;
              } catch (recordError) {
                fileErrors.push({
                  index: i,
                  error: recordError.message,
                  data: jsonData[i]
                });
              }
            }
          } else if (typeof jsonData === 'object') {
            
            try {
              const mappedData = user_rules ? mapDataWithRules(jsonData, user_rules) : jsonData;
              mappedData.CreateBy = userId || 1;
              
              const Model = require(`../models/${target_model}.model.js`);
              const newRecord = new Model(mappedData);
              await newRecord.save();
              processedRecords++;
            } catch (recordError) {
              fileErrors.push({
                error: recordError.message,
                data: jsonData
              });
            }
          }

          totalProcessedRecords += processedRecords;
          processedFiles++;
          
          const jsonFileRecord = await JsonFileData.findOne({ filename: filename });
          if (jsonFileRecord) {
            jsonFileRecord.is_processed = true;
            jsonFileRecord.processed_at = new Date();
            jsonFileRecord.status = 'archived';
            await jsonFileRecord.save();
          }

          if (auto_delete && processedRecords > 0) {
            try {
              const deleteResult = jsonHandler.deleteJsonFile(filename);
              if (deleteResult.success) {
                deletedFiles++;
                if (jsonFileRecord) {
                  jsonFileRecord.status = 'deleted';
                  jsonFileRecord.UpdatedBy = userId || 1;
                  jsonFileRecord.UpdatedAt = new Date();
                  await jsonFileRecord.save();
                }
              }
            } catch (deleteError) {
              allErrors.push({
                filename: filename,
                error: `Failed to delete file: ${deleteError.message}`,
                type: 'delete_error'
              });
            }
          }

          fileResults.push({
            filename: filename,
            processed_records: processedRecords,
            errors: fileErrors.length > 0 ? fileErrors : null,
            success: true,
            file_deleted: auto_delete && processedRecords > 0
          });

        } catch (modelError) {
          failedFiles++;
          allErrors.push({
            filename: filename,
            error: modelError.message,
            type: 'model_error'
          });
          
          fileResults.push({
            filename: filename,
            processed_records: 0,
            errors: [modelError.message],
            success: false
          });
        }

      } catch (fileError) {
        failedFiles++;
        allErrors.push({
          filename: filename,
          error: fileError.message,
          type: 'processing_error'
        });
        
        fileResults.push({
          filename: filename,
          processed_records: 0,
          errors: [fileError.message],
          success: false
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${processedFiles} files with ${totalProcessedRecords} total records from folder: ${folder_path}${auto_delete ? ` and deleted ${deletedFiles} files` : ''}`,
      data: {
        folder_path: folder_path,
        target_model: target_model,
        total_files: listResult.files.length,
        processed_files: processedFiles,
        failed_files: failedFiles,
        deleted_files: deletedFiles,
        total_processed_records: totalProcessedRecords,
        auto_delete_enabled: auto_delete,
        file_results: fileResults,
        errors: allErrors.length > 0 ? allErrors : null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error filling all JSON files to database',
      error: error.message
    });
  }
};

// Helper function to map data with rules
const mapDataWithRules = (data, user_rules) => {
  const mappedData = {};
  
  for (const [targetField, sourceField] of Object.entries(user_rules)) {
    if (data.hasOwnProperty(sourceField)) {
      mappedData[targetField] = data[sourceField];
    }
  }
  
  return mappedData;
};

module.exports = {
  createJsonFile,
  fillAllJsonFilesToDatabase
};
