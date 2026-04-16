import { Alert, Button } from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { nodeSa } from "src/AxiosParams";

const SavePolicyWithoutValidation = ({ data }) => {
  const accessToken = useToken();

  const [submitted, setSubmitted] = React.useState(false);

  useEffect(() => {
    if (submitted === true) {
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }
  }, [submitted]);

  let statusNote = "Saved";

  const savePolicy = useMutation(
    `savePolicy`,
    (data) => {
      return axios.post(`${nodeSa}/onboarding/policies/save`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      onSuccess: (data) => {
        setSubmitted(true);

        // router.push(`/policies/${data.data.data.id}`)
      },
      onError: (error) => {
        setSubmitted(true);
      },
    }
  );

  const handleSave = () => {
    let thisData = { ...data, statusNote: statusNote };

    console.log(thisData);

    savePolicy.mutate(thisData);
  };

  if (submitted && savePolicy.isSuccess) {
    return (
      <>
        <Alert severity="success">{savePolicy.data.data.message}</Alert>
      </>
    );
  }
  if (submitted && savePolicy.isError) {
    return (
      <>
        <Alert severity="error">
          {savePolicy.error.response?.data?.message}
        </Alert>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        type="submit"
        onClick={() => handleSave()}>
        Save Policy Progress
      </Button>
    </>
  );
};

export default SavePolicyWithoutValidation;
