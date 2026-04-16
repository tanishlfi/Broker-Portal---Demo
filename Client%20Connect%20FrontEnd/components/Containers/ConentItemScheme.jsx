import React, { useState, useEffect, useRef } from "react";
import { ListItem, ListItemText, Typography } from "@mui/material";

const SchemecontentItem = ({
  title,
  value,
  schema,
  isRequired,
  onValidationChange,
}) => {
  const [isValidateError, setisvalidateError] = useState("");

  const prevValueRef = useRef();
  useEffect(() => {
    const ValidateValue = async () => {
      try {
        await schema.validate(value);
        return false;
      } catch (error) {
        return error.message;
      }
    };

    if (prevValueRef.current !== value) {
      ValidateValue().then((error) => {
        setisvalidateError(error);
        if (typeof onValidationChange === "function") {
          onValidationChange(value, !error);
        }
      });
    }
    prevValueRef.current = value;
  }, [value, schema, onValidationChange]);

  const isValueMissing = !value && isRequired;

  return (
    <ListItem sx={{ m: 0, pt: 1 }} alignItems="flex-start">
      <ListItemText
        primary={
          <>
            <Typography
              sx={{ display: "inline" }}
              component="span"
              variant="body2"
              color="text.secondary">
              {title}
            </Typography>
          </>
        }
        secondary={
          <>
            <Typography
              sx={{ display: "inline" }}
              component="span"
              variant="body1"
              color={
                isValueMissing || isValidateError
                  ? "error.main"
                  : "text.primary"
              }>
              {isValueMissing ? `${title} is required` : isValidateError}
              {value}
            </Typography>
          </>
        }></ListItemText>
    </ListItem>
  );
};

export default SchemecontentItem;
