import React from "react";
import { useState } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { Button, Typography } from "@mui/material";
import useToken from "hooks/useToken";
import { nodeSa } from "src/AxiosParams";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import styled from "@emotion/styled";
import { useFormikContext } from "formik";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

const Input = styled("input")({
  display: "none",
});

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SupportDocuments() {
  const [open, setOpen] = React.useState(false);

  const accessToken = useToken();

  const [document_type, setDocument_type] = useState("");

  const {
    setFieldValue,
    values, // This is a function from Formik that will set the form to dirty
  } = useFormikContext();

  const [document, setDocument] = useState("");

  const uploadDocument = useMutation(
    ["upload support Documents"],
    async (body) => {
      return axios.post(`${nodeSa}/supportingDocuments`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  const handleFileChange = (event) => {
    const data = new FormData();
    data.append("file", event.target.files[0]);
    data.append("documentType", document_type);

    uploadDocument.mutate(data, {
      onSuccess: (data) => {
        console.log(data);
        // setNewDocument(data.data.data);
        setFieldValue("supportDocument", [
          ...(values?.supportDocument || []),
          data.data.data,
        ]);
        setDocument("");
        handleClose();
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  const handleChange = (event) => {
    setDocument_type(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Upload Support Documents
      </Button>
      <Dialog
        maxWidth="md"
        fullWidth
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="select-document-type-dialog">
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <Stack sx={{ my: 2 }} spacing={2}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="select-document-type-select-label">
                  Select Document Type
                </InputLabel>
                <Select
                  labelId="select-document-type-select-label"
                  id="select-document-type-select"
                  value={document_type}
                  label="Select Document Type"
                  onChange={handleChange}>
                  <MenuItem value="passportDocument">
                    Passport Document
                  </MenuItem>
                  <MenuItem value="employmentDocument">Work Permit</MenuItem>
                  <MenuItem value="studentDocument">Student Document</MenuItem>
                  <MenuItem value="medicalCertificate">
                    Medical Certificate
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {document_type && (
              <div>
                {uploadDocument.isLoading ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FileOpenIcon />}
                    disabled>
                    Uploading...
                  </Button>
                ) : (
                  <>
                    {!document && (
                      <label htmlFor="contained-button-file">
                        <Input
                          id="contained-button-file"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <Button
                          variant="contained"
                          startIcon={<FileOpenIcon />}
                          component="span">
                          Upload
                        </Button>
                      </label>
                    )}
                  </>
                )}
                {document && (
                  <>
                    <Typography variant="h6">{document.name}</Typography>
                    <Button
                      onClick={() => {
                        setDocument("");
                      }}
                      color="warning"
                      variant="contained">
                      Remove Document
                    </Button>
                  </>
                )}
              </div>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
