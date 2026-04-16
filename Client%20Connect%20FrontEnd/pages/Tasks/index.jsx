import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import { Stack, Box, LinearProgress } from "@mui/material";
import CreateTasks from "components/TasksComponents/CreateTask";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import { useRouter } from "next/router";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useTheme } from "@emotion/react";
import { useUser } from "@auth0/nextjs-auth0/client";

const Tasks = () => {
  const router = useRouter();

  const theme = useTheme();

  const { user } = useUser();

  const accessToken = useToken();

  const getAllTasks = useQuery(
    [`getAllTasks`],
    (data) => {
      return axios.get(`${nodeSa}/tasks/assignee/${user.email}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    },
  );

  const columns = [
    { field: "title", headerName: "Title", width: 130 },
    { field: "description", headerName: "Description", width: 130 },
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
    { field: "priority", headerName: "Priority", width: 130 },
    { field: "createdBy", headerName: "Created By", width: 130 },

    { field: "broker", headerName: "Broker", width: 130 },
    { field: "scheme", headerName: "Scheme", width: 130 },
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
  ];

  const handleRowClick = (row) => {
    router.push(`/TasksManager/${row.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Tasks Manager"
        subTitle="Create, Update, Delete Tasks"
        breadcrumbs={[{ title: "Tasks Manager", href: "/tasks-manager" }]}
      />
      {/* <Stack sx={{ mb: 4 }}>
        <CreateTasks />
      </Stack> */}

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
                onRowClick={handleRowClick}
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

export default Tasks;

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
