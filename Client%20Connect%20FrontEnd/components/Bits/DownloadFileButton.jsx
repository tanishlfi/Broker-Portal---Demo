import axios from "axios";
import useToken from "hooks/useToken";
import React from "react";
import { useState } from "react";
import { useMutation } from "react-query";
import { nodeSa } from "src/AxiosParams";
import {
  Button,
  Typography,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";

const DownloadFileButton = ({ documents }) => {
  const accessToken = useToken();

  const handleDownload = async ({ url, name }) => {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {documents &&
        documents.length > 0 &&
        documents?.map((document) => {
          if (document?.id) {
            return (
              <React.Fragment key={document?.id}>
                <ListItemButton
                  onClick={() => {
                    handleDownload({
                      url: `${nodeSa}/supportingDocuments/${document?.id}`,
                      name: document?.orgFileName,
                    });
                  }}
                  sx={{ m: 0, pt: 1 }}
                  alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <FolderIcon />
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
                          Document Name
                        </Typography>
                        {"   -   "}
                        <Typography
                          sx={{ display: "inline" }}
                          component="span"
                          variant="body2"
                          color="text.secondary">
                          {new Date(document?.createdAt).toLocaleDateString()}
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
                          {document?.orgFileName}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </React.Fragment>
            );
          } else {
            <></>;
          }
        })}
    </>
  );
};

export default DownloadFileButton;
