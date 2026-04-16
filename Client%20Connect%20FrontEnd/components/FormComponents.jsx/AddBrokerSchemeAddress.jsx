import React, { useState } from "react";
import { Formik, Form } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useMutation } from "react-query";
import AlertPopup from "components/Bits/AlertPopup";
import { Button, Grid } from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import * as Yup from "yup";
import DateFieldWrapper from "components/FormComponents.jsx/DateFieldWrapper";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import SelectWrapper from "./SelectWrapper";

export default function BrokerSchemeHomeAddressModal({
  newSchemeId,
  onSuccessfulSubmit,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
    setErrorMessages("");
  };

  const handleClose = () => {
    setOpen(false);
    setErrorMessages("");
  };

  const accessToken = useToken();
  const [errorMessage, setErrorMessages] = useState("");

  const handleAxiosErrors = (error) => {
    let errorMessages = "An unknown error occurred";

    if (error.response) {
      errorMessages = error.response.data.message || errorMessages;
    } else if (error.request) {
      errorMessages = "No Response received from the server. Please try again";
    } else {
      errorMessages = error.message;
    }
    return errorMessages;
  };

  const addHomeAddress = useMutation((newHomeAddress) =>
    axios.post(
      `${nodeSa}/brokerscheme/scheme/${newSchemeId}/address`,
      newHomeAddress,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ),
  );

  const initialValues = {
    AddressLine1: "",
    AddressLine2: "",
    City: "",
    Province: "",
    PostalCode: "",
    AddressTypeId: null,
    CountryId: null,
    deleteAt: null,
  };

  const validationSchema = Yup.object({
    AddressLine1: Yup.string().required("Your Postal address line 1 Required"),
    AddressLine2: Yup.string().required("Your Postal address line 2 Required"),
    City: Yup.string().required("Your City Required"),
    Province: Yup.string().required("Province is Required"),
    PostalCode: Yup.string().required("Postal code is Required"),
  });

  const onSubmit = (values, { resetForm }) => {
    addHomeAddress
      .mutateAsync(values)
      .then(() => {
        resetForm();
        handleClose();
        onSuccessfulSubmit();
      })
      .catch((error) => {
        setErrorMessages(handleAxiosErrors(error));
        resetForm();
      });
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen}>
        Add New Address
      </Button>
      <AlertPopup
        severity={"success"}
        message="Address Added Successfully"
        open={addHomeAddress.isSuccess}
      />
      <Dialog maxWidth="md" fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <AlertPopup
            severity={"error"}
            message={errorMessage}
            open={!!errorMessage}
          />
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Grid sx={{ my: 3 }} spacing={2} container>
                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="AddressLine1"
                      label="Address Line 1"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="AddressLine2"
                      label="Address Line 2"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextfieldWrapper name="City" label="City" />
                  </Grid>
                  <Grid item xs={6}>
                    <SelectWrapper
                      name="Province"
                      label="Province"
                      options={[
                        { value: "EASTERN CAPE", label: "EASTERN CAPE" },
                        { value: "FREE STATE", label: "FREE STATE" },
                        { value: "GAUTENG", label: "GAUTENG" },
                        { value: "KWAZULU-NATAL", label: "KWAZULU-NATAL" },
                        { value: "LIMPOPO", label: "LIMPOPO" },
                        { value: "MPUMALANGA", label: "MPUMALANGA" },
                        { value: "NORTH WEST", label: "NORTH WEST" },
                        { value: "NORTHERN CAPE", label: "NORTHERN CAPE" },
                        { value: "WESTERN CAPE", label: "WESTERN CAPE" },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextfieldWrapper name="PostalCode" label="Postal Code" />
                  </Grid>
                </Grid>

                <DialogActions sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Save
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
