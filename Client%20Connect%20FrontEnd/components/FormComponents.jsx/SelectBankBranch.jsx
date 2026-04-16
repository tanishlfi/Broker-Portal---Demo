import React, { useState } from "react";
import {
  Alert,
  Autocomplete,
  CircularProgress,
  TextField,
  Typography,
  Skeleton,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import useToken from "hooks/useToken";

const getBankBranches = (accessToken) => {
  return axios.get(`${rmaAPI}/mdm/api/BankBranch`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const SelectBankBranch = ({ setBrankBranch }) => {
  const accessToken = useToken();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery(
    "getBranchypes",
    () => getBankBranches(accessToken),
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
            id="Select Bank Types"
            fullWidth
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) =>
              `${option.bank.name} - ${option.name} (${option.id})`
            }
            options={data?.data || []}
            loading={isLoading}
            onChange={(event, newValue) => {
              setBrankBranch(
                newValue
                  ? {
                      bankId: newValue?.bankId,
                      bankName: newValue.bank.name,
                      branchName: newValue.name,
                      branchCode: newValue.code,
                    }
                  : null
              );
            }}
            renderOption={(props, option) => (
              <div {...props}>
                <Stack direction="row" spacing={2}>
                  <Typography>{option.bank.name}</Typography>
                  <Typography>{option.code}</Typography>
                </Stack>
              </div>
            )}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select Bank Name"
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

export default SelectBankBranch;
