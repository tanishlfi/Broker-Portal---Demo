import path from "path";
import fs from "fs";
import { BlobServiceClient } from "@azure/storage-blob";

export const downloadFileAZ = async (
  conn: string,
  container: string,
  filename: string,
) => {
  try {
    const filePath = path.join(__dirname, `../downloads/${filename}`);
    // Create the BlobServiceClient object which will be used to create a container client
    // const blobServiceClient: BlobServiceClient = BlobServiceClient.fromConnectionString(conn);
    const blobServiceClient = new BlobServiceClient(conn);
    const containerClient = blobServiceClient.getContainerClient(container);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.downloadToFile(filePath);
    return filePath;
  } catch (e) {
    console.log(`Error Downloading File "${filename}". Error: ${e}`);
    return false;
  }
};

export const uploadFileAZ = async (
  conn: string,
  container: string,
  filename: string,
  fileLoc: Buffer,
) => {
  try {
    // console.log(`Uploading file "${filename}" to Azure Storage`);
    // Create the BlobServiceClient object which will be used to create a container client
    // const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
    const blobServiceClient = new BlobServiceClient(conn);

    // create container if it doesn't exist
    if (!(await blobServiceClient.getContainerClient(container).exists())) {
      await blobServiceClient.createContainer(container);
    }
    const containerClient = blobServiceClient.getContainerClient(container);

    await containerClient.uploadBlockBlob(filename, fileLoc, fileLoc.length);
    // containerClient.uploadBlockBlob(filename, fileLoc, fileLoc.length);
    console.log(`File "${filename}" uploaded to Azure Storage`);
    return true;
  } catch (e) {
    console.log(`Error Uploading File "${filename}". Error: ${e}`);
    return false;
  }
};
