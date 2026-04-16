import React, { useState, useRef } from "react";

import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Stack } from "@mui/material";

const SchemeFileUpload = ({ DocumentType, UploadDocument }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected");
    }

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("DocumentType", DocumentType);

    UploadDocument.mutate(formData);

    setSelectedFile(null);
  };

  return (
    <div>
      <input
        type="file"
        style={{ display: "none" }}
        ref={fileInputRef} // Ref to access the input element
        onChange={handleFileChange}
      />
      {selectedFile ? (
        <Card>
          <CardContent>
            <Typography variant="body1">{selectedFile.name}</Typography>
            <Stack spacing={1}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleUpload}>
                Confirm Upload
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setSelectedFile(null)}>
                Cancel
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Button
          fullWidth
          variant="contained"
          onClick={() => fileInputRef.current.click()} // Trigger file input click
        >
          Choose file
        </Button>
      )}
    </div>
  );
};

SchemeFileUpload.propTypes = {
  newSchemeId: PropTypes.string.isRequired,
  onSuccessfulSubmit: PropTypes.func.isRequired,
  DocumentType: PropTypes.string.isRequired,
};

export default SchemeFileUpload;
