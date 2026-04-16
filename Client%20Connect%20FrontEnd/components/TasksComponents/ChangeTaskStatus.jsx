import React, { useEffect, useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Stack, Box, CircularProgress } from "@mui/material";

import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

import { nodeSa } from "src/AxiosParams";
import useToken from "hooks/useToken";
import { useTheme } from "@emotion/react";
import AlertPopup from "components/Bits/AlertPopup";

const ChangeTaskStatus = ({ data }) => {
  const accessToken = useToken();

  const theme = useTheme();

  const [status, setStatus] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    setStatus(data?.status);
  }, [data?.status]);

  const upDateStatus = useMutation(
    [`upDateStatus `, data?.id],
    (sub) => {
      return axios.patch(`${nodeSa}/tasks/${data?.id}`, sub, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`getTask `, data?.id],
        });
      },
    }
  );

  const updateStatus = (event) => {
    setStatus(event.target.value);

    upDateStatus.mutate({ status: event.target.value });
  };

  return (
    <Stack sx={{ m: 2 }} direction="row">
      {upDateStatus && upDateStatus.isLoading && <CircularProgress />}

      {status && (
        <FormControl sx={{ width: 400 }}>
          <InputLabel id="demo-simple-select-label">Status</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={data.status}
            label="Status"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FiberManualRecordIcon
                  sx={{
                    color:
                      selected === "new"
                        ? theme.palette.primary.main
                        : selected === "open"
                        ? theme.palette.success.main
                        : selected === "waiting"
                        ? theme.palette.warning.main
                        : selected === "paused"
                        ? theme.palette.error.main
                        : "grey",
                  }}
                />
                {selected}
              </Box>
            )}
            onChange={updateStatus}>
            <MenuItem value="new">
              <FiberManualRecordIcon
                sx={{ color: theme.palette.primary.main }}
              />
              New
            </MenuItem>
            <MenuItem value="open">
              <FiberManualRecordIcon
                sx={{ color: theme.palette.success.main }}
              />{" "}
              Open
            </MenuItem>
            <MenuItem value="waiting">
              <FiberManualRecordIcon
                sx={{ color: theme.palette.warning.main }}
              />
              Waiting
            </MenuItem>
            <MenuItem value="paused">
              <FiberManualRecordIcon sx={{ color: theme.palette.error.main }} />{" "}
              Paused
            </MenuItem>
            <MenuItem value="resolved">
              <FiberManualRecordIcon sx={{ color: "gray" }} /> Resolved
            </MenuItem>
          </Select>
        </FormControl>
      )}

      {upDateStatus.isSuccess && (
        <AlertPopup
          open={upDateStatus.isSuccess}
          severity="success"
          message="Status Updated"></AlertPopup>
      )}
    </Stack>
  );
};

export default ChangeTaskStatus;
