import React, { useState } from "react";
import {
  Alert,
  Autocomplete,
  TextField,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const RepresentativeMultiSelect = ({ user, id, setSelect }) => {
  const accessToken = useToken();
  const [open, setOpen] = React.useState(false);

  const { data, isLoading, error, isError } = useQuery(
    `SelectRepresentative${id}`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Broker/Representative/GetBrokersByBrokerageId/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken,
    }
  );

  return (
    <React.Fragment>
      {isLoading ? (
        <Skeleton variant="rectangular" width={500} height={50} />
      ) : (
        <>
          {data && data.length > 0 ? (
            <Autocomplete
              id="Select Representatives"
              fullWidth
              multiple
              name="Representatives"
              open={open}
              disableCloseOnSelect
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              isOptionEqualToValue={(option, value) =>
                option.policyId === value.policyId
              }
              getOptionLabel={(option) =>
                `${option.policyId} ${option.displayName}`
              }
              options={filteredSchemes} // Use the filtered list
              loading={isLoading}
              onChange={(event, newValue) => {
                setSelect(newValue);
              }}
              renderOption={(props, option) => (
                <div {...props}>{option.displayName}</div>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Representatives"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading && (
                          <CircularProgress color="inherit" size={20} />
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          ) : (
            <Alert severity="error">
              No Representatives Found for Broker {id}
            </Alert>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default RepresentativeMultiSelect;
