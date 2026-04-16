import { Alert, Button, Stack } from "@mui/material";
import { useFormikContext } from "formik";
import React from "react";

const ExceptionsHandler = ({ data, setFieldValue }) => {
  const { submitForm, errors } = useFormikContext();

  // Create a Array from the formik error object

  let formikErrors = [];

  for (const [key, value] of Object.entries(errors)) {
    formikErrors.push(key);
  }

  const exceptions = data?.exceptions;

  const ClearException = ({ exception }) => {
    setFieldValue(
      "exceptions",
      exceptions.filter((ex) => ex.field !== exception.field),
    );
  };

  const markAsFixed = () => {
    setFieldValue("status", "Fixed");
    submitForm();
  };

  return (
    <div>
      {data.status === "Error" && exceptions?.length === 0 && (
        <>
          <Button onClick={markAsFixed} variant="contained" color="secondary">
            Mark as fixed
          </Button>
        </>
      )}

      {/* {formikErrors && formikErrors?.length > 0 && (
        <>
          {formikErrors?.map((error, index) => {
            return (
              <div key={index}>
                <Alert severity="error">
                  <Stack direction="row">{error}</Stack>
                </Alert>
              </div>
            );
          })}
        </>
      )} */}

      {exceptions && exceptions?.length > 0 && (
        <>
          {exceptions?.map((exception, index) => {
            return (
              <Alert key={index} severity="error">
                <Stack direction="row">
                  <Button
                    onClick={() => {
                      ClearException({
                        exception,
                      });
                    }}
                    sx={{ my: 0, py: 0 }}
                  >
                    Clear Error
                  </Button>
                  {exception?.error || exception?.message}
                </Stack>
              </Alert>
            );
          })}
        </>
      )}
    </div>
  );
};

export default ExceptionsHandler;
