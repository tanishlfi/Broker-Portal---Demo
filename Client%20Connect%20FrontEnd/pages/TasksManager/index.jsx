import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import React from "react";
import { useQueryClient, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import { Grid, Stack, Box, LinearProgress, Button } from "@mui/material";
import CreateTasks from "components/TasksComponents/CreateTask";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import { useRouter } from "next/router";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useTheme } from "@emotion/react";
import DeleteTask from "components/TasksComponents/DeleteTask";
import CreateNotification from "components/TasksComponents/CreateNotification";

const TasksManager = () => {
  const router = useRouter();

  const theme = useTheme();
  const queryClient = useQueryClient();

  const accessToken = useToken();

  const getAllTasks = useQuery(
    [`getAllTasks`],
    (data) => {
      return axios.get(`${nodeSa}/tasks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    },
  );

  const handleRowClick = (row) => {
    router.push(`/TasksManager/${row.id}`);
  };

  const columns = [
    {
      field: "View Task",
      headerName: "View Task",
      width: 130,

      renderCell: (params) => {
        return (
          <Button
            onClick={() => handleRowClick(params.row)}
            variant="contained"
            color="primary"
          >
            View Task
          </Button>
        );
      },
    },
    { field: "title", headerName: "Title", width: 130 },
    { field: "description", headerName: "Description", width: 130 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const selected = params.row.status;

        return (
          <>
            {" "}
            <FiberManualRecordIcon
              sx={{
                color:
                  selected === "new"
                    ? theme.palette.primary.main
                    : selected === "open"
                    ? theme.palette.success.main
                    : selected === "waiting"
                    ? theme.palette.warning.main
                    : selected === "paused"
                    ? theme.palette.error.main
                    : "grey",
              }}
            />
            {selected}
          </>
        );
      },
    },
    { field: "assignee", headerName: "Assignee", width: 280 },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 130,
      valueGetter: (params) => {
        return `${new Date(params.row.dueDate).toLocaleDateString()} `;
      },
    },

    {
      field: "priority",
      headerName: "Priority",
      width: 130,

      renderCell: (params) => {
        const selected = params.row.priority;

        return (
          <>
            <FiberManualRecordIcon
              sx={{
                color:
                  selected === "info"
                    ? theme.palette.primary.main
                    : selected === "warning"
                    ? theme.palette.warning.main
                    : selected === "error"
                    ? theme.palette.error.main
                    : "grey",
              }}
            />
            {selected === "info"
              ? "Low"
              : selected === "warning"
              ? "Medium"
              : selected === "error"
              ? "High"
              : "grey"}
          </>
        );
      },
    },

    { field: "createdBy", headerName: "Created By", width: 130 },

    {
      field: "createdAt",
      headerName: "createdAt",
      width: 230,

      valueGetter: (params) => {
        return `${new Date(
          params.row.createdAt,
        ).toLocaleDateString()} ${new Date(
          params.row.createdAt,
        ).toLocaleTimeString()} `;
      },
    },

    {
      field: "deleteTask",
      headerName: "Delete Task",
      width: 130,
      renderCell: (params) => {
        return <DeleteTask data={params.row} />;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tasks Manager"
        subTitle="Create, Update, Delete Tasks"
        breadcrumbs={[{ title: "Tasks Manager", href: "/tasks-manager" }]}
      />
      <Stack direction="row" sx={{ mb: 4 }} justifyContent="space-between">
        <CreateTasks />
        <CreateNotification />
      </Stack>

      {getAllTasks.isLoading ? (
        <LinearProgress />
      ) : (
        <>
          {getAllTasks?.data?.data?.data &&
          getAllTasks?.data?.data?.data?.length > 0 ? (
            <Box
              sx={{
                height: 800,
              }}
            >
              <DataGridPremium
                getRowId={(row) => row.id}
                rows={getAllTasks?.data?.data?.data}
                columns={columns}
                slots={{
                  toolbar: GridToolbar,
                }}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "createdAt", sort: "desc" }],
                  },
                }}
              />
            </Box>
          ) : (
            <h1>No Tasks</h1>
          )}
        </>
      )}
    </div>
  );
};

export default TasksManager;

// title: "",
//                 description: "",
//                 body: [{ type: "paragraph", children: [{ text: "" }] }],
//                 assignee: "",
//                 dueDate: new Date(),
//                 status: "new",
//                 priority: "",
//                 createdBy: user?.email,
//                 assignee: "",
//                 files: "",
//                 status: "new",
//                 broker: "",
//                 scheme: "",
