import {
  Box,
  Card,
  LinearProgress,
  List,
  ListSubheader,
  Paper,
  Stack,
  Grid,
  Button,
} from "@mui/material";
import React from "react";
import ContentItem from "./ContentItem";
import { nodeSa } from "src/AxiosParams";
import { useMutation, useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import axios from "axios";
import useToken from "hooks/useToken";
import { useState } from "react";

const ViewFileCard = ({ fileId }) => {
  const accessToken = useToken();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const GetFileInfo = useQuery(
    `GetFile${fileId}`,
    () => {
      return axios.get(`${nodeSa}/onboarding/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken && !!fileId,
      // onSuccess: (data) => {
      //   console.log("data", data.data.data);
      // },
    },
  );

  const UpdateFile = useMutation(
    async () => {
      return axios.patch(
        `${nodeSa}/onboarding/files/${fileId}`,
        {
          status: "submitted",
          statusDescription: "File submitted for approval",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
    {
      onSuccess: (data) => {
        // console.log("File status updated:", data);
        GetFileInfo.refetch();
        setIsSubmitting(false);
      },
    },
  );

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = () => {
    setIsSubmitting(true); // Set state to true before making the request
    // add a delay to simulate the request
    sleep(2000).then(() => {
      UpdateFile.mutate();
    });
  };

  return (
    <div>
      {GetFileInfo?.isLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <Stack spacing={2} sx={{ pb: 2 }}>
          <Card>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  File Information
                </ListSubheader>
              </Grid>

              <Grid item xs={4}>
                <List
                  dense
                  sx={{
                    width: "100%",
                  }}
                >
                  <ContentItem
                    title={"File Name"}
                    value={GetFileInfo?.data?.data?.data?.orgFileName}
                  />
                  <ContentItem
                    title={"File Inception Date"}
                    value={GetFileInfo?.data?.data?.data?.joinDate}
                  />
                  <ContentItem
                    title={"File status"}
                    value={GetFileInfo?.data?.data?.data?.statusDescription}
                  />
                </List>
              </Grid>
              <Grid item xs={4}>
                <List
                  dense
                  sx={{
                    width: "100%",
                  }}
                >
                  <ContentItem
                    title="Policy Created By"
                    value={GetFileInfo?.data?.data?.data?.createdBy}
                  />

                  <ContentItem
                    title="Approver"
                    value={GetFileInfo?.data?.data?.data?.approverId || "TBD"}
                  />
                </List>
              </Grid>
              <Grid item xs={4}>
                <List
                  dense
                  sx={{
                    width: "100%",
                  }}
                >
                  <ContentItem
                    title="Brokerage Name"
                    value={GetFileInfo?.data?.data?.data?.brokerageName}
                  />
                  <ContentItem
                    title="Scheme / Representative Name"
                    value={GetFileInfo?.data?.data?.data?.scheme}
                  />
                </List>
              </Grid>
            </Grid>

            <Grid container sx={{ p: 2 }}>
              <Stack direction="row" spacing={2}>
                <DownloadFileButton
                  id={fileId}
                  name={GetFileInfo?.data?.data?.data?.orgFileName}
                  label="Download Original File"
                  url={`${nodeSa}/onboarding/file_upload/download/${fileId}`}
                />
                {
                  // only show this if value for documents GetFileInfo?.data?.data?.data?.documents.exceptionFile is not null
                  GetFileInfo?.data?.data?.data?.documents?.exceptions && (
                    <DownloadFileButton
                      id={fileId}
                      name={`exceptions_${GetFileInfo?.data?.data?.data?.orgFileName}`}
                      label="Download Rejections File"
                      url={`${nodeSa}/onboarding/fileDownload/${fileId}/exceptions`}
                      color={"error"}
                    />
                  )
                }
                {
                  // only show this if value for documents GetFileInfo?.data?.data?.data?.documents.duplicateFile is not null
                  GetFileInfo?.data?.data?.data?.documents?.duplicates && (
                    <DownloadFileButton
                      id={fileId}
                      name={`duplicates_${GetFileInfo?.data?.data?.data?.orgFileName}`}
                      label="Download Duplicates File"
                      url={`${nodeSa}/onboarding/fileDownload/${fileId}/duplicates`}
                      color={"warning"}
                    />
                  )
                }
                {
                  // only show this if value for documents GetFileInfo?.data?.data?.data?.documents?.vopdFile is not null
                  GetFileInfo?.data?.data?.data?.documents?.vopd && (
                    <DownloadFileButton
                      id={fileId}
                      name={`vopd_${GetFileInfo?.data?.data?.data?.orgFileName}`}
                      label="Download VOPD File"
                      url={`${nodeSa}/onboarding/fileDownload/${fileId}/vopd`}
                      color={"info"}
                    />
                  )
                }
                {
                  // only show this if value for documents GetFileInfo?.data?.data?.data?.documents?.submittedFile is not null
                  GetFileInfo?.data?.data?.data?.documents?.cleaned && (
                    <DownloadFileButton
                      id={fileId}
                      name={`submitted_${GetFileInfo?.data?.data?.data?.orgFileName}`}
                      label="Download Cleaned File"
                      url={`${nodeSa}/onboarding/fileDownload/${fileId}/cleaned`}
                      color={"success"}
                    />
                  )
                }
              </Stack>
            </Grid>
          </Card>
          {GetFileInfo?.data?.data?.data?.documents?.cleaned &&
            GetFileInfo?.data?.data?.data?.status !== "submitted" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            )}
        </Stack>
      )}
    </div>
  );
};

export default ViewFileCard;

const DownloadFileButton = ({ name, label, url, color = "primary" }) => {
  const accessToken = useToken();

  const handleDownload = async () => {
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
      <Button variant="outlined" color={color} onClick={handleDownload}>
        {label}
      </Button>
    </>
  );
};
