import React, { useState, useCallback } from "react";
import { useFormikContext } from "formik";
import axios from "axios";
import { useMutation } from "react-query";
import Button from "@mui/material/Button";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { styled } from "@mui/material/styles";
import { nodeSa } from "src/AxiosParams";

const Input = styled("input")({
  display: "none",
});

const AddDocument = React.memo(({ accessToken, setValues, values }) => {
  //   const { values, setFieldValue } = useFormikContext();
  const [document, setDocument] = useState("");

  const handleFileChange = useCallback((event) => {
    setDocument(event.target.files[0]);
  }, []);

  const uploadDocument = useMutation(
    ["upload"],
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

  const handleSubmit = useCallback(() => {
    const data = new FormData();
    data.append("file", document);
    data.append("documentType", "Child Document");

    uploadDocument.mutate(data, {
      onSuccess: (response) => {
        setValues((values) => {
          return [...values, response.data.data];
        });
        setDocument("");
      },
    });
  }, [document, uploadDocument, setValues]);

  return (
    <div>
      {uploadDocument.isLoading ? (
        <Button
          fullWidth
          variant="contained"
          startIcon={<FileOpenIcon />}
          disabled>
          Uploading...
        </Button>
      ) : (
        <>
          {!document ? (
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
                Upload Supporting Documents
              </Button>
            </label>
          ) : (
            <Button
              onClick={handleSubmit}
              color="secondary"
              fullWidth
              variant="contained">
              Save Document
            </Button>
          )}
        </>
      )}
    </div>
  );
});

AddDocument.displayName = "AddDocument";

export default AddDocument;
