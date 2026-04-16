import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Alert, Button, Tooltip } from "@mui/material";
import axios from "axios";
import { useFormikContext } from "formik";
import useToken from "hooks/useToken";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";

const vopdHeath = (accessToken) => {
  return axios.get(`${nodeSa}/vopd/health`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const VopdRequest = () => {
  const { values, setFieldValue } = useFormikContext();
  const [VopdError, setVopdError] = React.useState(null);

  const accessToken = useToken();

  const [vopd, setVopd] = React.useState(null);

  const VOPDHealthRequest = useQuery(
    "vopdHealth",
    () => vopdHeath(accessToken),
    {
      enabled: !!accessToken,
    },
  );

  const VopdPost = useMutation(
    async () =>
      await axios.post(
        `${nodeSa}/vopd`,
        { idNumber: values.idNumber.toString() },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),

    {
      onSuccess: (data) => {
        if (("VOPD", data?.data.success === true)) {
          setFieldValue("firstName", data?.data?.data?.firstName || "");
          setFieldValue("surname", data?.data?.data?.surname || "");
          setFieldValue("isVopdVerified", data?.data?.success || false);
          setFieldValue("gender", data?.data?.data?.gender === "M" ? 1 : 2);
          setFieldValue(
            "dateVopdVerified",
            data?.data?.data?.updatedAt || new Date(),
          );
          setFieldValue("dateOfBirth", new Date(data?.data?.data?.dateOfBirth));
          setFieldValue(
            "dateOfDeath",
            data?.data?.data?.dateOfDeath
              ? new Date(data?.data?.data?.dateOfDeath)
              : "",
          );
          setFieldValue(
            "maritalStatus",
            new Date(data?.data?.data?.maritalStatus),
          );
          setFieldValue("vopdResponse", data?.data?.data);
        }
        setVopd(data.data);
      },
      onError: (error) => {
        setVopdError(error.response.data.message);
      },
    },
  );

  const getVopd = () => {
    VopdPost.mutate();
  };

  return (
    <>
      {VOPDHealthRequest?.data?.data?.message ===
        "Astute service available" && (
        <>
          {VopdPost.isLoading || VOPDHealthRequest.isLoading ? (
            <Button
              disabled
              fullWidth
              sx={{ height: "100%" }}
              variant="outlined"
            >
              ...Loading
            </Button>
          ) : (
            <>
              {VopdPost.data ? (
                <Alert
                  severity={VopdPost?.data?.data?.success ? "success" : "error"}
                >
                  {VopdPost?.data?.data?.message}
                </Alert>
              ) : (
                <Tooltip title="Run ID Number Validation">
                  <Button
                    onClick={getVopd}
                    fullWidth
                    sx={{ height: "100%" }}
                    variant="outlined"
                  >
                    VOPD
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </>
      )}

      {/* {VopdPost.isError && (
        <Alert severity="error">{VopdPost.error.message}</Alert>
      )} */}
      {VopdError && <Alert severity="error">{VopdError}</Alert>}
    </>
  );
};

export default VopdRequest;
