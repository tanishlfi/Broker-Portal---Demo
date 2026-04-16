import React from "react";
import { Formik, Form } from "formik";
import { Button, Grid } from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import * as Yup from "yup";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import SelectWrapper from "../../FormComponents.jsx/SelectWrapper";

export default function AddressCaptureDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
    City: Yup.string().required("Your City Required"),
    Province: Yup.string().required("Province is Required"),
    PostalCode: Yup.string().required("Postal code is Required"),
  });

  return (
    <div>
      <Button fullWidth variant="contained" onClick={handleClickOpen}>
        Add New Address
      </Button>

      <Dialog maxWidth="lg" fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={({ values }) => {
              console.log(values);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <Grid sx={{ my: 3 }} spacing={2} container>
                  <Grid item xs={12}>
                    <TextfieldWrapper
                      multiline
                      rows={2}
                      name="AddressLine1"
                      label="Address Line 1"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextfieldWrapper
                      multiline
                      rows={2}
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
