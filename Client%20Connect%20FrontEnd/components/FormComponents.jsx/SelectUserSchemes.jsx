import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import axios from "axios";
import useToken from "hooks/useToken";

import React from "react";
import { useQueries } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const SelectUserSchemes = ({ scheme, setScheme, userSchemes }) => {
  const accessToken = useToken();
  const [open, setOpen] = React.useState(false);

  let getUserSchemes = useQueries(
    userSchemes?.map((scheme) => ({
      queryKey: ["scheme", scheme],
      queryFn: async () => {
        const response = await axios.get(
          `${rmaAPI}/clc/api/Policy/Policy/${scheme}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.data;
      },
      enabled: !!accessToken && !!scheme,
    }))
  );

  const handleChange = (event) => {
    setScheme(event.target.value);
  };

  return (
    <>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth placeholder="Select Scheme">
          <InputLabel id="demo-simple-select-label">Select Scheme</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={scheme}
            label="Select Scheme"
            onChange={handleChange}>
            {getUserSchemes.map((row, index) => {
              if (row.isLoading) {
                return (
                  <MenuItem key={index} value={row?.data?.policyId}>
                    <em>Loading...</em>
                  </MenuItem>
                );
              }

              return (
                <MenuItem key={index} value={row.data}>
                  {row.data?.clientName}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
    </>
  );
};

export default SelectUserSchemes;
