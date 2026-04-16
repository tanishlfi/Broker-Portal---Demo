import {
  Alert,
  Autocomplete,
  CircularProgress,
  Divider,
  TextField,
  Typography,
  Skeleton,
} from "@mui/material";
import { Stack } from "@mui/system";
import axios from "axios";
import useToken from "hooks/useToken";

import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

// Normal React State as Props
// const [select, setSelect] = React.useState(null);
// ID = brokerage_id

const SelectRepresentative = ({ select, setSelect, id }) => {
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
    <>
      {isLoading ? (
        <Skeleton variant="rectangular" width={500} height={50} />
      ) : (
        <>
          {data?.data && data?.data.length > 0 ? (
            <>
              <Autocomplete
                id="Select Representative"
                fullWidth
                open={open}
                onOpen={() => {
                  setOpen(true);
                }}
                onClose={() => {
                  setOpen(false);
                }}
                isOptionEqualToValue={(option, value) =>
                  `${option.id}` === `${option.id}`
                }
                getOptionLabel={(option) =>
                  `${option.name} ${option.idNumber} ${option.code}`
                }
                options={data?.data}
                loading={isLoading}
                onChange={(event, newValue) => {
                  setSelect(newValue?.id);
                }}
                renderOption={(props, option) => (
                  <div {...props}>
                    <Stack direction="row" spacing={2}>
                      <Typography color="primary.dark">
                        {option.name}
                      </Typography>
                      <Typography>{option.idNumber}</Typography>
                      <Typography color="secondary">{option.code}</Typography>
                    </Stack>
                    <Divider />
                  </div>
                )}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Select Representative"
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
            <Alert severity="error">No Representative Found</Alert>
          )}
        </>
      )}
    </>
  );
};

export default SelectRepresentative;
