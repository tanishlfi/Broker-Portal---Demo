import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Chip,
  Stack,
  Alert,
  Portal,
  LinearProgress,
} from "@mui/material";
import {
  DataGridPremium,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";

const ListOfFilesAll = ({ nonRma = false }) => {
  const accessToken = useToken();

  const router = useRouter();

  const { user } = useUser();

  // console.log("user", user);

  const returnLink = (id, createdBy) => {
    if (user?.user == createdBy) {
      return `/Onboarding/MyFiles/${id}`;
    }
    // this is based on that they can only see their own files
    return `/Onboarding/AllFiles/${id}`;
  };

  const GetListOfFiles = useQuery(
    [`GetListOfFilesAll`, nonRma],
    () => {
      const url = nonRma
        ? `${nodeSa}/onboarding/file_upload?nonRMA=true`
        : `${nodeSa}/onboarding/file_upload?viewAll=true`;
      return axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      refetchInterval: 15000,
      // onSuccess: (data) => {
      //   console.log("data", data);
      // },
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
              params.row?.status === "pending"
                ? "warning"
                : params.row?.status === "processing" ||
                  params.row?.status === "downloaded" ||
                  params.row?.status === "submitted"
                ? "secondary"
                : params.row?.status === "Uploaded"
                ? "info"
                : "error"
            }
            label={params.row?.statusDescription}
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
      field: "createdBy",
      headerName: "Uploaded By",
      width: 200,
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
      headerName: "View File",
      width: 200,
      renderCell: (params) => {
        return (
          <>
            {params.row?.status === "Uploaded" ||
            params.row?.status === "submitted" ? (
              <Button
                onClick={() => {
                  router.push(returnLink(params.row.id, params.row.createdBy));
                }}
                variant="contained"
                color="secondary"
              >
                View File
              </Button>
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
                width: "94vw",
              }}
            >
              <DataGridPremium
                getRowId={(row) => row.id}
                // autoHeight
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
              />
            </div>
          )}
        {GetListOfFiles.isSuccess && !GetListOfFiles?.data?.data?.success && (
          <Alert severity="info">No Files Found</Alert>
        )}
      </Stack>
    </div>
  );
};

export default ListOfFilesAll;

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
