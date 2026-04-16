import { Alert } from "@mui/material";

// TODO: Add Variants

const ErrorContainer = ({ error, isError }) => {
  if (!isError) {
    return null;
  }

  return <Alert severity="error">{error?.message}</Alert>;
};

export default ErrorContainer;
