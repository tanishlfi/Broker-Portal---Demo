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

const getPoductionOptions = (accessToken) => {
  return axios.get(`${rmaAPI}/clc/api/Product/ProductOption`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const SelectSchemeProductOption = ({ select, setSelectOptions }) => {
  const accessToken = useToken();
  const [open, setOpen] = useState(false);

  const {
    data: optionData,
    isLoading: optionsLoading,
    isError: optionsError,
  } = useQuery("getOptions", () => getPoductionOptions(accessToken), {
    enabled: !!accessToken,
  });

  const [defaultOption, setDefaultOption] = React.useState(null);
  React.useEffect(() => {
    if (optionData && select) {
      const foundOption = optionData?.data?.find(
        (option) => option.id === select
      );
      setDefaultOption(foundOption);
    }
  }, [optionData, select]);

  if (optionsLoading) return <Skeleton variant="rectangular" height={50} />;

  if (optionsError)
    return <Alert severity="error">Error Loading Product Options</Alert>;
  return (
    <>
      <Autocomplete
        id="Select Scheme Product Option"
        fullWidth
        open={open}
        value={defaultOption}
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
        options={optionData?.data}
        loading={optionsLoading}
        onChange={(event, newValue) => {
          setSelectOptions(newValue);
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
              label="Select Scheme Product Option"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {optionsLoading ? (
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
  );
};

export default SelectSchemeProductOption;
