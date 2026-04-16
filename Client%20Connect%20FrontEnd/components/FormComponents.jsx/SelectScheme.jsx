import {
  Alert,
  Autocomplete,
  TextField,
  Skeleton,
  CircularProgress,
  Stack,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";

import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const SelectScheme = ({ select, setSelect, id }) => {
  const accessToken = useToken();
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useQuery(
    `scheme${id}`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        return data.data;
      },
    }
  );

  return (
    <>
      {isLoading ? (
        <Skeleton variant="rectangular" width={500} height={50} />
      ) : (
        <>
          {data?.data && data?.data.length > 0 ? (
            <>
              <Autocomplete
                id="Select Scheme"
                fullWidth
                open={open}
                onOpen={() => {
                  setOpen(true);
                }}
                onClose={() => {
                  setOpen(false);
                }}
                isOptionEqualToValue={(option, value) =>
                  `${option.policyId}` === `${option.policyId}`
                }
                getOptionLabel={(option) =>
                  `${option.displayName} ${option.policyId} ${option.policyNumber}`
                }
                // options={[data?.data[0]]} // temporary fix broken endpoint, just switch to prod if you have details
                options={data?.data}
                loading={isLoading}
                onChange={(event, newValue) => {
                  setSelect(newValue);
                }}
                renderOption={(props, option) => {
                  const { key, ...restProps } = props; // Separate key from the rest of the props
                  return (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        width: "100%",
                      }}
                      spacing={4}
                      key={option.policyId}
                      {...restProps}>
                      <Typography> {option.displayName}</Typography>
                      <Typography color="secondary">
                        {option.policyId}
                      </Typography>
                      <Typography> {option.policyNumber}</Typography>
                    </Stack>
                  );
                }}
                renderInput={(params, index) => {
                  return (
                    <TextField
                      key={index}
                      {...params}
                      label="Select Scheme"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {isLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  );
                }}
              />
            </>
          ) : (
            <Alert severity="error">No Scheme Found</Alert>
          )}
        </>
      )}
    </>
  );
};

export default SelectScheme;
