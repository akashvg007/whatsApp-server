import S3 from "aws-sdk/clients/s3";
import fs from "fs";
import { v4 as uuid } from "uuid";

const { AWS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env;

const accessKeyId = AWS_ID;
const secretAccessKey = AWS_SECRET;
const bucketName = AWS_BUCKET_NAME;

const s3 = new S3({
  accessKeyId,
  secretAccessKey,
});

// upload
export const uploadFileBuffer = (file) => {
  try {
    const myfile = file.originalname.split(".");
    const fileType = myfile[myfile.length - 1];
    const uploadParams = {
      Bucket: bucketName,
      Body: file.buffer,
      Key: `${uuid()}.${fileType}`,
    };
    return s3.upload(uploadParams).promise();
  } catch (err) {
    console.log("uploadFileBuffer::catch", err);
  }
};

export const uploadFile = (file) => {
  try {
    console.log("uploadFile", file);

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

export const uploadFileStream = (fileStream, type) => {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: `${uuid()}.${type}`,
  };
  return s3.upload(uploadParams).promise();
};

// download

export const getFileStream = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.getObject(downloadParams).createReadStream();
};
