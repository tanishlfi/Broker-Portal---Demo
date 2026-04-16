import {
  Avatar,
  Box,
  Card,
  CardContent,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import useToken from "hooks/useToken";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";

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

const AdditionalTabs = ({ policyId, policyNumber }) => {
  const accessToken = useToken();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const PolicyDocuments = useQuery(
    `getPolicyDocuments${policyId}`,
    () => getDocuments(accessToken, policyNumber),
    {
      enabled: !!accessToken,
    }
  );

  const DocumentTypes = useQuery(
    `DocumentTypes`,
    () => getDocumentTypes(accessToken),
    {
      enabled: !!accessToken,
    }
  );

  return (
    <Card sx={{ my: 4 }}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="additional tabs">
            <Tab label="Documents" {...a11yProps(0)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {(PolicyDocuments?.isFetching || DocumentTypes?.isFetching) && (
            <LinearProgress />
          )}
          {PolicyDocuments?.isSuccess && DocumentTypes?.isSuccess && (
            <CardContent>
              <List>
                <ListDocuments
                  policyNumber={policyNumber}
                  documents={PolicyDocuments?.data?.data}
                  documentTypes={DocumentTypes?.data?.data}
                />
              </List>
            </CardContent>
          )}
        </CustomTabPanel>
      </Box>
    </Card>
  );
};

export default AdditionalTabs;

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Input = styled("input")({
  display: "none",
});

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
