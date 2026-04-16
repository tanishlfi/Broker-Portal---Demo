import React from "react";
import { useField } from "formik";
import { Button, Grid } from "@mui/material";

const BrokerFileUpload = ({ onFieldSelected }) => {
  const [field] = useField("file");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const fileData = new FormData();
      fileData.append("file", file);
      onFieldSelected(fileData, file.name);
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={6}>
        <Button
          variant="contained"
          color="primary"
          component="label"
          htmlFor="fileInput"
        >
          Select File
        </Button>
        <input
          type="file"
          id="fileInput"
          name="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Grid>
    </Grid>
  );
};

export default BrokerFileUpload;
