import React, { useState } from "react";
import { Button } from "@mui/material";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import useToken from "hooks/useToken";

const DownloadBrokerSchemeFiles = ({ fileId, originalFileName }) => {
  const accessToken = useToken();
  const [errorMessage, setErrorMessages] = useState(null);

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

  const handleFileDownload = () => {
    axios
      .get(`${nodeSa}/brokerscheme/file_upload/download/${fileId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", originalFileName);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        setErrorMessages(handleAxiosErrors(error));
      });
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleFileDownload}>
        Download File
      </Button>
      {handleFileDownload.isLoading && <p>Downloading...</p>}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default DownloadBrokerSchemeFiles;
