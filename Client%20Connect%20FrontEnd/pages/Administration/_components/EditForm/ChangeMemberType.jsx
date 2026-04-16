import { Button, Stack } from "@mui/material";
import React from "react";
import AlertPopup from "../../../../components/Bits/AlertPopup";
import { useFormikContext } from "formik";

const ChangeMemberType = () => {
  const [change, setChange] = React.useState(false);
  const [changed, setChanged] = React.useState(false);

  const { values, setFieldValue } = useFormikContext();

  const changeMemberType = (type) => {
    setChanged(true);
    setFieldValue("MemberTypeId", type);
    setFieldValue(
      "MemberType",
      type === 2 ? "Spouse" : type === 3 ? "Child" : "Extended Member",
    );
    setChanged(false);
  };

  return (
    <div>
      <Button onClick={() => setChange(!change)}>Change member Type</Button>
      {change && (
        <Stack
          justifyContent="flex-end"
          sx={{ my: 2 }}
          direction="row"
          spacing={2}
        >
          <Button
            variant={values?.MemberTypeId === 2 ? "contained" : "outlined"}
            color="secondary"
            onClick={() => changeMemberType(2)}
          >
            Spouse
          </Button>

          <Button
            variant={values?.MemberTypeId === 3 ? "contained" : "outlined"}
            color="success"
            onClick={() => changeMemberType(3)}
          >
            Child
          </Button>

          <Button
            variant={values?.MemberTypeId === 4 ? "contained" : "outlined"}
            color="inherit"
            onClick={() => changeMemberType(4)}
          >
            Extended Member
          </Button>
          <Button
            variant={values?.MemberTypeId === 6 ? "contained" : "outlined"}
            color="primary"
            onClick={() => changeMemberType(6)}
          >
            Beneficiary
          </Button>
        </Stack>
      )}
      <AlertPopup
        open={changed}
        severity="success"
        message="Member Type Changed"
      />
    </div>
  );
};

export default ChangeMemberType;
