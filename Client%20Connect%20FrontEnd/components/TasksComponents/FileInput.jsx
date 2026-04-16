import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FolderIcon from "@mui/icons-material/Folder";

import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from "@mui/material";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FileInput = ({ field, form }) => {
  const [file, setFile] = React.useState(null);

  const handleChange = (event) => {
    setFile(event.target.files[0]);
    form.setFieldValue(field.name, event.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    form.setFieldValue(field.name, null);
  };

  return (
    <>
      {file ? (
        <ListItem
          sx={{ m: 0, pt: 1 }}
          alignItems="flex-start"
          secondaryAction={
            <Button
              onClick={removeFile}
              variant="outlined"
              color="warning"
              startIcon={<CloudUploadIcon />}>
              Remove file
            </Button>
          }>
          <ListItemAvatar>
            <Avatar>
              <FolderIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <>
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body2"
                  color="text.secondary">
                  Document Name
                </Typography>
              </>
            }
            secondary={
              <>
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body1"
                  color="text.primary">
                  {file.name}
                </Typography>
              </>
            }
          />
        </ListItem>
      ) : (
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}>
          Upload file
          <VisuallyHiddenInput type="file" onChange={handleChange} />
        </Button>
      )}
    </>
  );
};

export default FileInput;
