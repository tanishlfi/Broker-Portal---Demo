import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import {
  Stack,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import * as Yup from "yup";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Form, Formik } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import AlertPopup from "components/Bits/AlertPopup";
import useToken from "hooks/useToken";

const vopdHeath = (accessToken) => {
  return axios.get(`${nodeSa}/vopd/health`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const VOPD = () => {
  const [vopd, setVopd] = React.useState(null);
  const [vopdError, setVopdError] = React.useState(null);

  const accessToken = useToken();

  const VOPDHealthRequest = useQuery("vopdHealth", () =>
    vopdHeath(accessToken),
  );

  const getVopdList = useQuery(`vopdList`, () =>
    axios.get(`${nodeSa}/vopd`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );

  const VopdPost = useMutation(
    async ({ idNumber }) =>
      await axios
        .post(
          `${nodeSa}/vopd`,
          { idNumber },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then(
          (res) => {
            setVopd(res.data);

            return res;
          },
          (err) => {
            setVopdError(err?.response?.data?.message);
          },
        ),

    {
      onSuccess: () => {
        getVopdList.refetch();
      },
    },
  );

  const columns = [
    {
      field: "id",
      headerName: "ID Number",
      width: 200,
    },
    { field: "deceasedStatus", headerName: "Deceased Status", width: 200 },

    { field: "firstName", headerName: "First Name", width: 220 },
    { field: "surname", headerName: "Surname", width: 220 },
    { field: "dateOfBirth", headerName: "Date Of Birth", width: 200 },
    { field: "dateOfDeath", headerName: "Date Of Death", width: 200 },
    { field: "maritalStatus", headerName: "Marital Status", width: 150 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "status", headerName: "Check Status", width: 100 },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 200,
      valueFormatter: (params) => {
        return (
          new Date(params.value).toLocaleDateString() +
          " " +
          new Date(params.value).toLocaleTimeString()
        );
      },
    },
  ];

  const rows = getVopdList?.data?.data?.data?.rows
    ? getVopdList?.data?.data?.data?.rows?.map((item, index) => {
        return {
          id: item.idNumber,
          status: item.status,
          firstName: item.firstName,
          surname: item.surname,
          dateOfDeath: item.dateOfDeath,
          maritalStatus: item.maritalStatus,
          gender: item.gender,
          updatedAt: item.updatedAt,
          dateOfBirth: item.dateOfBirth,
          deceasedStatus: item.deceasedStatus,
        };
      })
    : [];

  if (getVopdList.isLoading) {
    return <LinearProgress />;
  }

  return (
    <>
      <PageHeader
        title="VOPD"
        subTitle="Manage VOPD"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "VOPD",
            href: "VOPD",
          },
        ]}
      />

      {vopdError && (
        <AlertPopup
          open={vopdError ? true : false}
          message={vopdError}
          severity="error"
        />
      )}

      <Stack mb={3}>
        {VOPDHealthRequest.isLoading || VopdPost.isLoading ? (
          <CircularProgress />
        ) : (
          <VOPDDialog
            setVopdError={setVopdError}
            vopd={vopd}
            VopdPost={VopdPost}
            accessToken={accessToken}
            isOnline={
              VOPDHealthRequest?.data?.data?.message ===
              "Astute service available"
            }
          />
        )}
      </Stack>

      {vopd && (
        <Stack sx={{ mb: 3 }}>
          <Alert severity="success">
            <strong>Success!</strong> VOPD request has been created.
          </Alert>

          {vopd?.data && (
            <>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID Number</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell align="right">First Name</TableCell>
                      <TableCell align="right">Surname</TableCell>
                      <TableCell align="right">Marital Status</TableCell>
                      <TableCell align="right">Gender</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {vopd?.data?.idNumber}
                      </TableCell>
                      <TableCell align="right" component="th" scope="row">
                        {vopd?.data?.status}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        {vopd?.data?.firstName}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        {vopd?.data?.surname}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        {vopd?.data?.maritalStatus}
                      </TableCell>
                      <TableCell align="right"> {vopd?.data?.gender}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Stack>
      )}

      <div style={{ width: "100%", height: 900 }}>
        <DataGridPremium
          loading={getVopdList.isLoading}
          slots={{ toolbar: GridToolbar }}
          rows={rows}
          columns={columns}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </div>
    </>
  );
};

export default VOPD;

function VOPDDialog({ isOnline, VopdPost, setVopdError }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setVopdError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getVopd = ({ idNumber }) => {
    VopdPost.mutate({ idNumber });
  };

  return (
    <div>
      <Button
        disabled={!isOnline}
        variant="contained"
        onClick={handleClickOpen}
      >
        New VOPD Request
      </Button>
      <Dialog open={open} fullWidth maxWidth="md" onClose={handleClose}>
        <DialogTitle>VOPD Request</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              idNumber: "",
            }}
            validationSchema={Yup.object().shape({
              idNumber: Yup.string()
                .required("Id Number is required")
                .matches(
                  /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
                  "SA Id Number seems to be invalid",
                ),
            })}
            onSubmit={(values) => {
              getVopd({ idNumber: values.idNumber });
              handleClose();
            }}
          >
            {() => (
              <Form>
                <Stack sx={{ my: 2 }}>
                  <TextfieldWrapper name="idNumber" label="ID Number" />
                </Stack>
                <DialogActions>
                  <Button onClick={handleClose} color="inherit">
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Submit
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
}
