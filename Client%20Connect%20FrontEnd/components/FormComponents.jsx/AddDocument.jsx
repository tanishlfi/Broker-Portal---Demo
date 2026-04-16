import styled from "@emotion/styled";
import { Button, List, Stack } from "@mui/material";
import axios from "axios";
import React from "react";
import { useMutation } from "react-query";
import { nodeSa } from "src/AxiosParams";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { useFormikContext } from "formik";
import { useState } from "react";

const AddDocument = ({ accessToken }) => {
  const { values, setFieldValue } = useFormikContext();

  const [document, setDocument] = useState("");

  const handleFileChange = (event) => {
    setDocument(event.target.files[0]);
  };

  const uploadDocument = useMutation(
    async (body) =>
      await axios.post(`${nodeSa}/supportingDocuments`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  const handleSubmit = () => {
    const data = new FormData();

    data.append("file", document);
    data.append("documentType", "Child Document");

    console.log(data);

    uploadDocument.mutate(data, {
      onSuccess: (data) => {
        console.log("Support Documents", data.data.data);
        setFieldValue("supportDocument", [
          ...values.supportDocument,
          data.data.data,
        ]);
        setDocument("");
      },
    });
  };

  return (
    <div>
      {uploadDocument.isLoading ? (
        <Button
          fullWidth
          variant="contained"
          startIcon={<FileOpenIcon />}
          disabled
          sx={{
            mb: 2,
          }}>
          {" "}
          uploading
        </Button>
      ) : (
        <>
          {!document ? (
            <label htmlFor="contained-button-file">
              <Input
                id="contained-button-file"
                type="file"
                autoFocus
                onChange={handleFileChange}
              />

              <>
                <Button
                  variant="contained"
                  startIcon={<FileOpenIcon />}
                  sx={{
                    mb: 2,
                  }}
                  component="span">
                  Upload
                </Button>
              </>
            </label>
          ) : (
            <Button
              onClick={() => handleSubmit()}
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
};

export default AddDocument;

const Input = styled("input")({
  display: "none",
});
