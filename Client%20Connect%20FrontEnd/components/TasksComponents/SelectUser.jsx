import {
  Alert,
  Autocomplete,
  TextField,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";

import React from "react";
import { useQuery } from "react-query";
import { nodeSa, rmaAPI } from "src/AxiosParams";

const SelectUser = ({ select, setSelect, selectTitle }) => {
  const accessToken = useToken();
  const [open, setOpen] = React.useState(false);

  const getUsersByRole = useQuery(
    [`userByRole`],
    () => {
      return axios.get(`${nodeSa}/auth0/getUsersByRole/rol_a8MRb4O1C1urJxGV`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    },
  );

  const getUserEmails = getUsersByRole?.data?.data?.data?.map(
    (user) => user.email,
  );

  return (
    <>
      {getUsersByRole?.isLoading ? (
        <Skeleton variant="rectangular" height={50} />
      ) : (
        <>
          {getUsersByRole?.data?.data?.data &&
          getUsersByRole?.data?.data?.data.length > 0 ? (
            <>
              <Autocomplete
                id="Select User"
                fullWidth
                open={open}
                value={select}
                onOpen={() => {
                  setOpen(true);
                }}
                onClose={() => {
                  setOpen(false);
                }}
                isOptionEqualToValue={(option, value) =>
                  `${option}` === `${option}`
                }
                getOptionLabel={(option) => `${option}`}
                options={getUserEmails}
                loading={getUsersByRole?.isLoading}
                onChange={(event, newValue) => {
                  setSelect(newValue);
                }}
                renderOption={(props, option) => <div {...props}>{option}</div>}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label={selectTitle || "Select User"}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {getUsersByRole?.isLoading ? (
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

export default SelectUser;
