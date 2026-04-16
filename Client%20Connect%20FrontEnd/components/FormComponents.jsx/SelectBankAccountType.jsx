import React, { useState } from "react";
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

const getBackAccountTypes = (accessToken) => {
  return axios.get(`${rmaAPI}/mdm/api/BankAccountType`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const SelectBankAccountTypes = ({ setAccountType }) => {
  const accessToken = useToken();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery(
    "getAccountTypes",
    () => getBackAccountTypes(accessToken),
    { enabled: !!accessToken }
  );

  return (
    <>
      {isError && <Alert severity="error">Error Loading ID Types</Alert>}
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
            options={data?.data}
            loading={isLoading}
            onChange={(event, newValue) => {
              setAccountType(newValue?.name);
            }}
            renderOption={(props, option) => (
              <div {...props}>
                <Stack direction="row" spacing={2}>
                  <Typography>{option.name}</Typography>
                </Stack>
              </div>
            )}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select Account Types"
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

export default SelectBankAccountTypes;
