import React from "react";
import PropTypes from "prop-types";
import useToken from "hooks/useToken";
import axios from "axios";
import { nodeSa } from "../../src/AxiosParams";
import {
  Card,
  CardActionArea,
  Tooltip,
  CardContent,
  Stack,
  Typography,
  LinearProgress,
  IconButton,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";

const DisplayFiles = ({ GetDocuments, deleteDocument }) => {
  const accessToken = useToken();

  if (GetDocuments?.isLoading) {
    return <LinearProgress />;
  }
  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {GetDocuments.data?.data?.data?.map((file) => (
        <FilesDisplay
          deleteDocument={deleteDocument}
          key={file.id}
          file={file}
          accessToken={accessToken}
        />
      ))}
    </Stack>
  );
};

DisplayFiles.propTypes = {
  DocumentType: PropTypes.string.isRequired,
  newSchemeId: PropTypes.string.isRequired,
};

export default DisplayFiles;

const FilesDisplay = ({ file, deleteDocument }) => {
  return (
    <Tooltip title="Download">
      <Card
        variant="outlined"
        sx={{
          border: "1px dashed #e0e0e0",
        }}>
        <DownloadFileButton
          url={`${nodeSa}/brokerscheme/file_upload/download/${file.id}`}
          name={file.OriginalFileName}>
          <CardContent>
            <Stack spacing={3} direction="row" alignItems="center">
              <CloudDownloadIcon color="success" fontSize="large" />

              <Typography variant="h6">{file.OriginalFileName}</Typography>
            </Stack>
            <Stack>
              <Typography
                align="right"
                variant="caption"
                color="text.secondary">
                {file.createdAt.toLocaleString("en-ZA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Typography>

              <Typography
                align="right"
                color="text.secondary"
                variant="caption">
                by: {file?.CreatedBy}
              </Typography>
            </Stack>
          </CardContent>
        </DownloadFileButton>
        <Stack direction="row" justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={() => deleteDocument.mutate(file.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </Stack>
      </Card>
    </Tooltip>
  );
};

const DownloadFileButton = ({ name, label, url, children }) => {
  const accessToken = useToken();

  const [isLoading, setIsLoading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LinearProgress />}
      <CardActionArea size="small" onClick={handleDownload}>
        {children}
      </CardActionArea>
    </>
  );
};
