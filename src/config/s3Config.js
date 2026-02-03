const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || 'us-east-1'
});

// Create S3 instance
const s3 = new AWS.S3();

// S3 bucket configuration
const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'mr-hangout-club-files',
  region: process.env.S3_REGION || 'us-east-1',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// Upload file to S3
const uploadToS3 = async (file, folder = 'uploads') => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    
    const params = {
      Bucket: s3Config.bucketName,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      fileName: file.name
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: s3Config.bucketName,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return {
      success: true
    };
  } catch (error) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get signed URL for file access
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: s3Config.bucketName,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return {
      success: true,
      url: url
    };
  } catch (error) {
    console.error('S3 signed URL error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  s3,
  s3Config,
  uploadToS3,
  deleteFromS3,
  getSignedUrl
};
