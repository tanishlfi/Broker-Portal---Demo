import {
  Alert,
  Autocomplete,
  TextField,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";

import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const getBrokers = (accessToken) => {
  return axios.get(`${rmaAPI}/clc/api/Broker/Brokerage`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// const getBrokers = (accessToken) => {
//   return axios.get(
//     `http://localhost:4200/api/rmaForward/clc/api/Broker/Brokerage`,
//     {
// headers: {
//   Authorization: `Bearer ${accessToken}`,
// },
//     },
//   );
// };

const SelectBroker = ({ setSelect }) => {
  const accessToken = useToken();
  const [open, setOpen] = React.useState(false);

  const [BrokersData, setBrokersData] = React.useState([]);

  const { isLoading, isError } = useQuery(
    "brokers",
    () => getBrokers(accessToken),
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        // remove broker with name MATLA LIFE INVESTMENTS (PTY) LTD
        data.data = data.data.filter(
          (broker) => broker.name !== "MATLA LIFE INVESTMENTS (PTY) LTD",
        );

        setBrokersData(data.data);
      },
    },
  );

  if (isError) return <Alert severity="error">Error loading brokers</Alert>;
  if (isLoading) return <Skeleton variant="rectangular" height={50} />;

  return (
    <>
      <Autocomplete
        id="Select Broker"
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
        options={BrokersData}
        loading={isLoading}
        onChange={(event, newValue) => {
          setSelect(newValue);
        }}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <div key={option.id} {...otherProps}>
              <Stack direction="row" spacing={2}>
                <Typography>{option.name}</Typography>
              </Stack>
              <Divider />
            </div>
          );
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              label="Select Broker"
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
  );
};

export default SelectBroker;
