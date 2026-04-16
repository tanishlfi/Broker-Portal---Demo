import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Chip,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Snackbar,
} from "@mui/material";
import styled from "@emotion/styled";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { nodeSa } from "src/AxiosParams";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertPopup from "components/Bits/AlertPopup";

const ListOfFiles = ({ approvals }) => {
  const accessToken = useToken();
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const returnLink = (id) => {
    return approvals === "Approvals"
      ? `/Onboarding/FileApprovals/${id}`
      : `/Onboarding/MyFiles/${id}`;
  };

  const GetListOfFiles = useQuery(
    `GetListOfFiles${approvals}`,
    () => {
      const url =
        approvals === "Approvals"
          ? `${nodeSa}/onboarding/file_upload?approvals=true`
          : `${nodeSa}/onboarding/file_upload`;
      return axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      refetchInterval: 15000,
    },
  );

  const deleteFile = useMutation(
    (id) => {
      return axios.delete(`${nodeSa}/onboarding/files/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`GetListOfFiles${approvals}`);
      },
    },
  );

  const columns = [
    {
      field: "scheme",
      headerName: "Scheme",
      width: 300,
    },
    {
      field: "orgFileName",
      headerName: "File Name",
      width: 300,
    },
    {
      field: "statusDescription",
      headerName: "Status",
      width: 220,
      renderCell: (params) => {
        return (
          <Chip
            variant="outlined"
            color={
              params.row?.deletedAt
                ? "error"
                : params.row?.status === "pending"
                ? "warning"
                : params.row?.status === "processing" ||
                  params.row?.status === "downloaded" ||
                  params.row?.status === "submitted"
                ? "secondary"
                : params.row?.status === "Uploaded"
                ? "info"
                : "error"
            }
            label={
              params.row?.deletedAt ? "Deleted" : params.row?.statusDescription
            }
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Uploaded Date",
      width: 200,
      valueGetter: (params) => {
        return new Date(params.row.createdAt).toLocaleString();
      },
    },
    {
      field: "actions",
      headerName: "Original File",
      width: 250,
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={2}>
            <DownloadFileButton
              id={params.row.id}
              name={params.row?.orgFileName}
              label="Download Original File"
              url={`${nodeSa}/onboarding/file_upload/download/${params.row.id}`}
            />
          </Stack>
        );
      },
    },
    {
      field: "Members List",
      headerName: "Actions",
      width: 200,
      align: "right",
      renderCell: (params) => {
        return (
          <>
            {!params.row?.deletedAt &&
            (params.row?.status === "Uploaded" ||
              params.row?.status === "submitted") ? (
              <>
                <Button
                  onClick={() => {
                    router.push(returnLink(params.row.id));
                  }}
                  variant="contained"
                  color="secondary"
                >
                  View File
                </Button>
                <IconButton
                  onClick={() => deleteFile.mutate(params.row.id)}
                  color="error"
                  aria-label="Remove File"
                  component="label"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            ) : !params.row?.deletedAt && params.row?.status !== "pending" ? (
              <IconButton
                onClick={() => deleteFile.mutate(params.row.id)}
                color="error"
                aria-label="Remove File"
                component="label"
              >
                <DeleteIcon />
              </IconButton>
            ) : (
              ""
            )}
          </>
        );
      },
    },
  ];

  return (
    <div>
      {GetListOfFiles.isLoading && <LinearProgress />}
      <Stack sx={{ mt: 4 }}>
        {GetListOfFiles?.data?.data?.data &&
          GetListOfFiles?.data?.data?.data?.length > 0 && (
            <div
              style={{
                height: 750,
                maxWidth: "94vw",
                "& .Deleted": {
                  backgroundColor: "red",
                  color: "gray",
                },
              }}
            >
              <StyledDataGrid
                getRowId={(row) => row.id}
                rows={GetListOfFiles?.data?.data?.data}
                columns={columns}
                pagination
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                initialState={{
                  filter: {
                    filterModel: {
                      items: [],
                      quickFilterExcludeHiddenColumns: true,
                    },
                  },
                  pagination: { paginationModel: { pageSize: 10 } },
                  sorting: {
                    sortModel: [{ field: "createdAt", sort: "desc" }],
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                getRowClassName={(params) =>
                  params.row.deletedAt ? "super-app-theme--Deleted" : ""
                }
              />
            </div>
          )}
        {GetListOfFiles.isSuccess && !GetListOfFiles?.data?.data?.success && (
          <Alert severity="info">No Files</Alert>
        )}
      </Stack>
      <AlertPopup
        severity={"success"}
        open={deleteFile.isSuccess}
        message="File deleted successfully"
      />
      <AlertPopup
        severity={"error"}
        open={deleteFile.isError}
        message="File not deleted"
      />
    </div>
  );
};

export default ListOfFiles;

const DownloadFileButton = ({ name, label, url }) => {
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
      <Button variant="outlined" onClick={handleDownload}>
        {label}
      </Button>
    </>
  );
};

const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  "& .super-app-theme--Deleted": {
    opacity: 0.5,
  },
}));
