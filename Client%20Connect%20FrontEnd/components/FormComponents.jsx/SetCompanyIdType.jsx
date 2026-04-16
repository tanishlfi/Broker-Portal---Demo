import React, { useEffect, useState } from "react";
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

const getIdTypes = (accessToken) => {
  return axios.get(`${rmaAPI}/mdm/api/lookup/GetCompanyIdTypes`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const SetCompanyIdType = ({ select, setFieldValue }) => {
  const accessToken = useToken();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery(
    "getIDTypes",
    () => getIdTypes(accessToken),
    { enabled: !!accessToken }
  );

  const [defaultOption, setDefaultOption] = useState(null);
  useEffect(() => {
    if (data && select) {
      const foundOption = data?.data?.find((option) => option.id === select);
      setDefaultOption(foundOption);
    }
  }, [data, select]);

  return (
    <>
      {isError && (
        <Alert severity="error">Error Loading Company ID Types</Alert>
      )}
      {isLoading ? (
        <Skeleton variant="rectangular" width={500} height={50} />
      ) : (
        <>
          <Autocomplete
            id="Select Company Types"
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
              setFieldValue("CompanyTypeId", newValue?.id);
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
                  label="Select Company Type"
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

export default SetCompanyIdType;
