import React, { useState } from "react";
import { Formik, Form } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import * as Yup from "yup";
import { nodeSa } from "src/AxiosParams";
import { useMutation } from "react-query";
import { Button, Grid } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import AlertPopup from "components/Bits/AlertPopup";
import BrokerFileUpload from "./FileUpload";
import SelectWrapper from "./SelectWrapper";

const BrokerSchemeFileUploadsModal = ({ newSchemeId, onSuccessfulSubmit }) => {
  const accessToken = useToken();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessages] = useState("");
  const [originalFileName, setOriginalFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  const addBrokerSchemeFileUploads = useMutation(
    (newFileUpload) =>
      axios.post(
        `${nodeSa}/brokerscheme/file_upload/${newSchemeId}`,
        newFileUpload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      ),
    {
      onSuccess: () => {
        handleClose();
        onSuccessfulSubmit();
      },

      onError: (error) => {
        setErrorMessages(handleAxiosErrors(error));
      },
    }
  );

  const initialValues = {
    DocumentType: "",
  };

  const documentTypes = [
    { value: "Proof of Establishment", label: "Proof of Establishment" },
    { value: "Proof of Address", label: "Proof of Address" },
  ];

  const validationSchema = Yup.object({
    DocumentType: Yup.string().required("Please select a document type"),
  });

  const handleFieldSelected = (fileData, fileName) => {
    setOriginalFileName(fileName);
    setSelectedFile(fileData);
  };

  const onSumit = (values) => {
    const formData = new FormData();
    formData.append("file", selectedFile.get("file"));
    formData.append("DocumentType", values.DocumentType);

    addBrokerSchemeFileUploads.mutate(formData);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen}>
        Upload file
      </Button>
      <Dialog maxWidth="md" fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Add New File</DialogTitle>
        <DialogContent>
          <AlertPopup
            severity={"error"}
            message={errorMessage}
            open={addBrokerSchemeFileUploads.isError}
          />
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSumit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Grid container spacing={2} sx={{ my: 3 }}>
                  <BrokerFileUpload onFieldSelected={handleFieldSelected} />
                  <Grid item xs={6}>
                    <SelectWrapper
                      name="DocumentType"
                      label="Document Type"
                      options={documentTypes}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="OriginalFileName"
                      label="Original File Name"
                      value={originalFileName}
                      readOnly
                    />
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
};

export default BrokerSchemeFileUploadsModal;
