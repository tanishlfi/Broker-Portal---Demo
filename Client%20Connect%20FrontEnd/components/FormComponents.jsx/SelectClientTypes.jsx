import React, { useState, useEffect } from "react";
import {
  Alert,
  Autocomplete,
  CircularProgress,
  Divider,
  TextField,
  Typography,
  Skeleton,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import useToken from "hooks/useToken";

const getClientTypes = (accessToken) => {
  return axios.get(`${rmaAPI}/mdm/api/ClientType`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const SelectClientTypes = ({ select, setClientTypes, setFieldValue }) => {
  const accessToken = useToken();
  const [open, setOpen] = useState(false);
  const [defaultOption, setDefaultOption] = useState(null);

  const { data, isLoading, isError, error } = useQuery(
    "getClientTypes",
    () => getClientTypes(accessToken),
    { enabled: !!accessToken }
  );

  useEffect(() => {
    if (data && select) {
      const foundOption = data?.data?.find((option) => option.id === select);
      setDefaultOption(foundOption);
    }
  }, [data, select]);

  return (
    <>
      {isError && <Alert severity="error">Error Loading Client Types</Alert>}
      {isLoading ? (
        <Skeleton variant="rectangular" width={500} height={50} />
      ) : (
        <>
          <Autocomplete
            id="Select Client Types"
            fullWidth
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            isOptionEqualToValue={(option, value) =>
              `${option.id} ${option.name}` === `${value.id} ${value.name}`
            }
            getOptionLabel={(option) => `${option.id} ${option.name}`}
            options={data?.data || []}
            loading={isLoading}
            value={defaultOption}
            onChange={(event, newValue) => {
              setClientTypes(newValue?.id);
              setFieldValue("ClientTypeID", newValue?.id);
            }}
            renderOption={(props, option) => (
              <div {...props}>
                <Stack direction="row" spacing={2}>
                  <Typography>{option.id}</Typography>
                  <Typography>{option.name}</Typography>
                </Stack>
              </div>
            )}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select Client Type"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              );
            }}
          />
        </>
      )}
    </>
  );
};

export default SelectClientTypes;
