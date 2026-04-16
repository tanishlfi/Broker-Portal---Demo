import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { useMutation } from "react-query";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import useToken from "hooks/useToken";
import {
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import { FieldArray, Form, Formik } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import AlertPopup from "components/Bits/AlertPopup";
import { useRouter } from "next/router";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Username is required"),
  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  contactNumber: Yup.string()
    .matches(/^[0-9]+$/, "Contact number must be numeric")
    .required("Contact number is required"),
  FSPNumber: Yup.string().required("FSP Number is required"),
  verify_email: Yup.boolean(),
  email_verified: Yup.boolean(),
  Representatives: Yup.array()
    .of(
      Yup.object().shape({
        idNumber: Yup.string()
          .required("ID number is required")
          .matches(
            /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
            "SA Id Number seems to be invalid"
          ),
        firstName: Yup.string().required("First name is required"),
        surname: Yup.string().required("Surname is required"),
        email: Yup.string()
          .email("Invalid email format")
          .required("Email is required"),
        contactNumber: Yup.string()
          .matches(/^[0-9]+$/, "Contact number must be numeric")
          .required("Contact number is required"),
      })
    )
    .required("At least one representative is required"),
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateNewBrokerUser({ id }) {
  const [open, setOpen] = React.useState(false);

  const router = useRouter();

  const accessToken = useToken();

  const CreateUser = useMutation(
    `brokerage`,
    async (data) => {
      let response = await axios.post(`${nodeSa}/brokerage`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data;
    },
    {
      enabled: !!accessToken,
    }
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen}>
        Add A new Broker
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Create New Brokerage
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Close
            </Button>
          </Toolbar>
        </AppBar>

        <AlertPopup
          open={CreateUser.isError}
          severity="error"
          message={CreateUser.error?.response?.data?.error?.msg}
        />
        <AlertPopup
          open={CreateUser.isSuccess}
          severity="success"
          message="User Created Successfully"
        />

        <Grid container display="flex" justifyContent="center">
          <Grid item xs={8}>
            <Formik
              initialValues={{
                name: "",
                emailAddress: "",
                contactNumber: "",
                FSPNumber: "",
                brokerageStatus: "draft",
                connection: "email",
                verify_email: false,
                email_verified: false,
                user_metadata: {
                  BrokerageIds: [],
                  schemeIds: [],
                },
                roles: ["rol_tj4jFUvK15VZglWd"],
              }}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                console.log(values);
                CreateUser.mutate(values);
              }}>
              {({ isSubmitting, errors, values }) => {
                console.log("errors", errors);
                console.log("values", values);
                return (
                  <Form>
                    <Grid
                      spacing={2}
                      sx={{ mt: 4 }}
                      container
                      display="flex"
                      justifyContent="center">
                      <Grid item xs={12} sx={{ my: 2 }}>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12}>
                            <Typography variant="h6">
                              Brokerage Details
                            </Typography>
                            <Typography variant="body1">
                              Select the process type you would like to capture
                              the brokerage.
                            </Typography>

                            <Divider sx={{ my: 1 }} />
                          </Grid>
                          <Grid item xs={6}>
                            <Card
                              variant="elevation"
                              elevation={4}
                              sx={{
                                borderColor: "primary.main",
                                borderWidth: 2,
                                borderStyle: "solid",
                              }}>
                              <CardActionArea>
                                <CardContent>
                                  <Typography variant="h6">
                                    Broker Capture
                                  </Typography>
                                  <Typography variant="body2">
                                    Broker will be send an email to capture the
                                    brokerage details. Approver will be assigned
                                    to the brokerage.
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Grid>
                          <Grid item xs={6}>
                            <Card variant="outlined">
                              <CardActionArea>
                                <CardContent>
                                  <Typography variant="h6">
                                    RMA Capture
                                  </Typography>
                                  <Typography variant="body2">
                                    RMA User will capture the broker detailS and
                                    the brokerage will be assigned to a RMA
                                    Approver.
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Alert severity="info">
                          By Filling out this form you will be creating a new
                          user on the system. <br /> The user will receive an
                          email to log in. <br />
                          This user will fill in the form to complete the
                          brokerage details. <br /> Please ensure that the
                          details are correct before submitting.
                        </Alert>
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="name"
                          label="Username"
                          type="text"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="contactNumber"
                          label="contactNumber"
                          type="number"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextfieldWrapper
                          name="emailAddress"
                          label="Email Address"
                          type="email"
                        />
                      </Grid>

                      <Divider />

                      <Grid item sx={{ mt: 3, mb: 6 }} xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="secondary"
                          disabled={isSubmitting}
                          fullWidth>
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                );
              }}
            </Formik>
          </Grid>
        </Grid>
      </Dialog>
    </div>
  );
}

// {
//     "email": "string",
//     "phone_number": "string",
//     "user_metadata": {},
//     "blocked": false,
//     "email_verified": false,
//     "phone_verified": false,
//     "app_metadata": {},
//     "given_name": "string",
//     "family_name": "string",
//     "name": "string",
//     "nickname": "string",
//     "picture": "string",
//     "user_id": "string",
//     "connection": "string",
//     "password": "string",
//     "verify_email": false,
//     "username": "string"
//   }

// const AddRepIdNumber = () => {
//   const [rep, setRep] = useState({
//     id: UUID(),
//     idNumber: "",
//     firstName: "",
//     surname: "",
//     email: "",
//     contactNumber: "",
//   });

//   const [idNumberError, setIdNumberError] = useState("");

//   const idNumberRegex =
//     /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/;

//   const validateIdNumber = (value) => {
//     if (!idNumberRegex.test(value)) {
//       setIdNumberError("SA Id Number seems to be invalid");
//       return false;
//     }
//     setIdNumberError("");
//     return true;
//   };

//   const handleIdNumberChange = (e) => {
//     const value = e.target.value;
//     setIdNumber(value);
//     validateIdNumber(value);
//   };

//   const { values, setFieldValue } = useFormikContext();

//   const handleAdd = () => {
//     setFieldValue("brokerDetails.Representatives", [
//       ...values.brokerDetails.Representatives,
//       rep,
//     ]);
//     setRep({
//       id: UUID(),
//       idNumber: "",
//       firstName: "",
//       surname: "",
//       email: "",
//       contactNumber: "",
//     });
//   };

//   const handleDelete = (item) => {
//     setFieldValue("brokerDetails.Representatives", [
//       ...values.brokerDetails.Representatives.filter((i) => i.id !== item.id),
//     ]);
//   };

//   const handleSetRep = (e) => {
//     const { name, value } = e.target;

//     setRep({ ...rep, [name]: value });
//   };

//   return (
//     <>
//       <Paper sx={{ p: 1, mb: 2 }}>
//         <Stack sx={{ mb: 2 }} direction="row" spacing={2}>
//           <TextField
//             name="idNumber"
//             label="Id Number"
//             type="text"
//             value={rep.idNumber}
//             onChange={handleSetRep}
//           />
//           <TextField
//             onChange={handleSetRep}
//             name="firstName"
//             value={rep.firstName}
//             label="First Name"
//             type="text"
//           />
//           <TextField
//             onChange={handleSetRep}
//             value={rep.surname}
//             name="surname"
//             label="Surname"
//             type="text"
//           />
//           <TextField
//             value={rep.email}
//             onChange={handleSetRep}
//             name="email"
//             label="Email"
//             type="text"
//           />
//           <TextField
//             onChange={handleSetRep}
//             value={rep.contactNumber}
//             name="contactNumber"
//             label="Contact Number"
//             type="text"
//           />
//         </Stack>
//         <Button variant="contained" onClick={handleAdd}>
//           + Add Representative
//         </Button>
//       </Paper>
//       <RepsTable
//         rows={values?.brokerDetails?.Representatives}
//         handleDelete={handleDelete}
//       />
//     </>
//   );
// };

// const RepsTable = ({ rows, handleDelete }) => {
//   return (
//     <TableContainer component={Paper}>
//       <Table sx={{ minWidth: 650 }} aria-label="simple table">
//         <TableHead>
//           <TableRow>
//             <TableCell>ID Number</TableCell>
//             <TableCell>First Name</TableCell>
//             <TableCell>Surname</TableCell>
//             <TableCell>Email</TableCell>
//             <TableCell>Contact Number</TableCell>
//             <TableCell>Remove</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {rows.map((row) => (
//             <TableRow
//               key={row.id}
//               sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
//               <TableCell component="th" scope="row">
//                 {row.idNumber}
//               </TableCell>
//               <TableCell>{row.firstName}</TableCell>
//               <TableCell>{row.surname}</TableCell>
//               <TableCell>{row.email}</TableCell>
//               <TableCell>{row.contactNumber}</TableCell>
//               <TableCell>
//                 {" "}
//                 <IconButton
//                   onClick={() => {
//                     handleDelete(row);
//                   }}
//                   edge="end"
//                   aria-label="delete">
//                   <DeleteIcon color="error" />
//                 </IconButton>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };
