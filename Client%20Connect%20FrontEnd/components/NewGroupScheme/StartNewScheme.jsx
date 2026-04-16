import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { Grid } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import SelectSchemeProductOption from "components/FormComponents.jsx/SelectSchemeProductOption";
import SelectRepresentative from "components/FormComponents.jsx/SelectRepresentative";
import { useMutation } from "react-query";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import DateFieldWrapper from "components/FormComponents.jsx/DateFieldWrapper";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function StartNewScheme({ id }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const accessToken = useToken();
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const submitBrokerDetails = useMutation((newBrokerDetails) =>
    axios.post(
      `${nodeSa}/brokerscheme/scheme/${id}/broker?currentStep=0`,
      newBrokerDetails,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
  );

  const HandelSubmit = (values) => {
    setLoading(true);
    submitBrokerDetails.mutate(
      {
        BrokerageId: id,

        ProductOptionID: values?.productOption?.id,
        status: "Draft",
        ...values,
      },
      {
        onSuccess: (data) => {
          console.log("getting data on Success: ", data);
          if (data.data.data.id) {
            router.push(
              `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${data.data.data.id}/?currentStep=0`
            );
          }
        },
      }
    );
    setLoading(false);
  };

  return (
    <div>
      <Button variant="contained" fullWidth onClick={handleClickOpen}>
        Start New Scheme
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
              New Scheme
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Cancel
            </Button>
          </Toolbar>
        </AppBar>
        <Formik
          initialValues={{
            BrokerageId: id,
            RepresentativeId: "",
            // productOption: "",
            DisplayName: "",
            JoinDate: new Date(),
          }}
          validationSchema={Yup.object({
            DisplayName: Yup.string().required("Required"),
            JoinDate: Yup.string().required("Required"),
          })}
          onSubmit={(values) => {
            HandelSubmit(values);
          }}>
          {({ setFieldValue }) => (
            <Form>
              <Grid
                spacing={2}
                container
                display="flex"
                justifyContent="center">
                <Grid item xs={8}>
                  <Typography variant="h6" sx={{ my: 3 }}>
                    Please select a representative to start a new scheme
                  </Typography>
                  <SelectRepresentative
                    setSelect={(value) => {
                      setFieldValue("RepresentativeId", value);
                    }}
                    id={id}
                  />
                </Grid>
                {/* <Grid item xs={8}>
                  <SelectSchemeProductOption
                    setSelectOptions={(value) => {
                      setFieldValue("productOption", value);
                    }}
                  />
                </Grid> */}

                <Grid item xs={8}>
                  <DateFieldWrapper
                    name="JoinDate"
                    label="Join Date"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextfieldWrapper
                    name="DisplayName"
                    label="Please enter a Display name for the new scheme (Scheme Name)"
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={8}>
                  <Button
                    disabled={loading}
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3 }}>
                    {loading ? "Loading..." : "Start New Scheme"}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
}
