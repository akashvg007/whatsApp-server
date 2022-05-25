const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const { v4 } = require("uuid");

const { AWS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env;

const accessKeyId = AWS_ID;
const secretAccessKey = AWS_SECRET;
const bucketName = AWS_BUCKET_NAME;

const s3 = new S3({
  accessKeyId,
  secretAccessKey,
});

const uploadFileBuffer = (file) => {
  try {
    const myfile = file.originalname.split(".");
    const fileType = myfile[myfile.length - 1];
    const uploadParams = {
      Bucket: bucketName,
      Body: file.buffer,
      Key: `${v4()}.${fileType}`,
    };
    return s3.upload(uploadParams).promise();
  } catch (err) {
    console.log("uploadFileBuffer::catch", err);
  }
};

const uploadFile = (file) => {
  try {
    const fileStream = fs.createReadStream(file?.path);
    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: file.filename,
    };
    return s3.upload(uploadParams).promise();
  } catch (err) {
    console.log("uploadFile::catch", err);
  }
};

const uploadFileStream = (fileStream, type) => {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: `${v4()}.${type}`,
  };
  return s3.upload(uploadParams).promise();
};

const getFileStream = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.getObject(downloadParams).createReadStream();
};

module.exports = {
  uploadFileBuffer,
  uploadFile,
  uploadFileStream,
  getFileStream,
};
