import { Alert } from "@mui/material";
import React from "react";

const ErrorComponent = ({ error }) => {
  return (
    <>
      {/* {error?.message && <Alert severity="error">{error?.message}</Alert>} */}
      {error?.error?.errors &&
        error?.error?.errors?.map((err, index) => {
          return (
            <React.Fragment key={index}>
              <Alert severity="error">{err.message}</Alert>
              <Alert severity="warning">
                User - {err.instance.firstName} - {err.instance.surname}
              </Alert>
            </React.Fragment>
          );
        })}
    </>
  );
};

export default ErrorComponent;
