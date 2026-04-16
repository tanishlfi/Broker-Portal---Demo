import React, { useState } from "react";
import useToken from "../../../hooks/useToken";
import axios from "axios";
import { rmaAPI } from "../../../src/AxiosParams";
import {
  Avatar,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useQuery } from "react-query";

const DocumentsList = ({ policyId, policyNumber }) => {
  const accessToken = useToken();
  const getDocuments = (accessToken, policyNumber) => {
    return axios.get(
      `${rmaAPI}/scn/api/Document/Document/GetDocumentsByKey/CaseCode/${policyNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  };

  const getDocumentTypes = (accessToken) => {
    return axios.get(`${rmaAPI}/mdm/api/lookup/DocumentType`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };
  const PolicyDocuments = useQuery(
    `getPolicyDocuments${policyId}`,
    () => getDocuments(accessToken, policyNumber),
    {
      enabled: !!accessToken && !!policyNumber,
    }
  );

  const DocumentTypes = useQuery(
    `DocumentTypes`,
    () => getDocumentTypes(accessToken),
    {
      enabled: !!accessToken,
    }
  );

  if (PolicyDocuments.isLoading || DocumentTypes.isLoading)
    return <p>Loading...</p>;

  return (
    <>
      <ListDocuments
        policyNumber={policyId}
        documents={PolicyDocuments.data?.data}
        documentTypes={DocumentTypes.data?.data}
      />
    </>
  );
};

export default DocumentsList;

const ListDocuments = ({ policyNumber, documents, documentTypes }) => {
  const accessToken = useToken();
  const [downloadStatus, setDownloadStatus] = useState({});

  // Create a map of document types for quick lookup
  const documentTypeMap = documentTypes?.reduce((map, type) => {
    map[type.id] = type.description;
    return map;
  }, {});

  // Remove duplicate documents based on id
  const filteredDocuments = documents?.filter(
    (document, index, self) =>
      index ===
      self.findIndex((t) => t.id === document.id && t.set === document.set)
  );

  // Add documentType.description to each document
  const documentsWithDescription = filteredDocuments?.map((document) => ({
    ...document,
    description: documentTypeMap[document.documentType] || "",
  }));

  const handleDownload = async ({ docId, name, mimeType }) => {
    setDownloadStatus((prevStatus) => ({
      ...prevStatus,
      [docId]: "Downloading...",
    }));
    try {
      const response = await axios.get(
        `${rmaAPI}/scn/api/Document/Document/GetDocumentBinary/${docId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Convert Base64 to Blob
      const base64String = response?.data?.fileAsBase64;
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create a link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus((prevStatus) => ({
        ...prevStatus,
        [docId]: "Download successful",
      }));
    } catch (error) {
      // console.error("Download error:", error);
      setDownloadStatus((prevStatus) => ({
        ...prevStatus,
        [docId]: "Download Failed",
      }));
    }
  };

  return (
    <>
      {documentsWithDescription?.map((document) => {
        return (
          <React.Fragment key={document.id}>
            <ListItemButton
              onClick={() => {
                handleDownload({
                  docId: document.id,
                  name: `${policyNumber}-${document.fileName}`,
                  mimeType: document.fileExtension,
                });
              }}
              sx={{ m: 0, pt: 1 }}
              alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>
                  <DownloadIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.secondary">
                      {document.description}
                    </Typography>
                    {"   -   "}
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.secondary">
                      {new Date(document.createdDate).toLocaleDateString()}
                    </Typography>
                  </>
                }
                secondary={
                  <>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body1"
                      color="text.primary">
                      {document.fileName}
                    </Typography>
                    {downloadStatus[document.id] && (
                      <Typography
                        sx={{ display: "block" }}
                        component="span"
                        variant="body2"
                        color={
                          downloadStatus[document.id] === "Download Failed"
                            ? "error"
                            : "secondary"
                        }>
                        {downloadStatus[document.id]}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItemButton>
          </React.Fragment>
        );
      })}
    </>
  );
};
