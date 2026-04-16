import * as dotenv from "dotenv";
import { BlobServiceClient } from "@azure/storage-blob";

dotenv.config();

const azureBlobServiceClient = (blobClient: any, config: any) => {
  const { connectionString, directory } = config;

  const blobServiceClient = blobClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(directory);

  return containerClient;
};

const onboardingBlobConfig = {
  connectionString: process.env.RMA_ONBOARDING_AZ_CONNECTION,
  directory: process.env.RMA_ONBOARDING_AZ_BLOB || "client-onboarding",
};

export const onboardingBlobContainerClient = azureBlobServiceClient(
  BlobServiceClient,
  onboardingBlobConfig,
);
