import React, { useState } from "react";
import {
  Alert,
  Autocomplete,
  TextField,
  Skeleton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { nodeSa, rmaAPI } from "src/AxiosParams";
import { Form, Formik } from "formik";

const SelectSchemeMultiSelectDialog = ({ user, filterSchemes, id }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [successMessageShown, setSuccessMessageShown] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
    // Reset the success message state when the dialog opens
    if (successMessageShown) {
      setSnackbarOpen(false);
      setSuccessMessageShown(false);
    }
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const accessToken = useToken();
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    ["scheme", id],
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId/${id}`,
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

  const AllocateUserDetails = useMutation(
    `AllocateUserDetails${user?.user_id}`,

    async (data) => {
      let response = await axios.patch(
        `${nodeSa}/auth0/user/${user?.user_id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries(["getUserById", user.user_id]);
        setSnackbarMessage("Schemes successfully added!");
        setSnackbarSeverity("success");
        setSuccessMessageShown(true);
        setSnackbarOpen(true);
      },
      onError: (error) => {
        // Handle error state and show error message
        setSnackbarMessage(
          error.response?.data?.message || "An error occurred!"
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      },
    }
  );

  const filteredSchemes = data?.data?.filter(
    (scheme) => !filterSchemes?.includes(Number(scheme.policyId))
  );

  return (
    <React.Fragment>
      <Button sx={{ mb: 3 }} variant="outlined" onClick={handleDialogOpen}>
        Add Schemes
      </Button>
      <Dialog
        maxWidth="md"
        fullWidth
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <DialogTitle>Add Schemes to Broker</DialogTitle>
        <DialogContent>
          <Stack sx={{ mt: 3 }}>
            <Formik
              initialValues={{
                user_metadata: [
                  {
                    SchemeIds: [],
                  },
                ],
              }}
              onSubmit={async (values) => {
                let newValues = {
                  ...values,
                  user_metadata: {
                    ...user.user_metadata,
                    SchemeIds: [
                      ...(user.user_metadata.SchemeIds
                        ? user.user_metadata.SchemeIds
                        : []),
                      ...values.user_metadata.SchemeIds.map((x) => x.policyId),
                    ],
                  },
                };

                console.log(newValues);

                AllocateUserDetails.mutate(newValues);
              }}
            >
              {({ setFieldValue }) => {
                return (
                  <Form>
                    {isLoading ? (
                      <Skeleton variant="rectangular" width={500} height={50} />
                    ) : (
                      <>
                        {filteredSchemes && filteredSchemes.length > 0 ? (
                          <Autocomplete
                            id="Select Scheme"
                            fullWidth
                            multiple
                            name="user_metadata.SchemeIds"
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
                              setFieldValue(
                                "user_metadata.SchemeIds",
                                newValue
                              );
                            }}
                            renderOption={(props, option) => (
                              <div {...props}>{option.displayName}</div>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Schemes"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {isLoading && (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      )}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                        ) : (
                          <Alert severity="error">No Scheme Found</Alert>
                        )}
                      </>
                    )}

                    <DialogActions sx={{ mt: 2 }}>
                      <Button onClick={handleDialogClose}>close</Button>
                      {/* You can put the submit button here or inside the form above */}
                      {snackbarSeverity === "success" && successMessageShown ? (
                        <Button
                          color="success"
                          variant="contained"
                          onClick={handleDialogClose}
                        >
                          Done
                        </Button>
                      ) : (
                        <Button
                          disabled={AllocateUserDetails.isLoading}
                          type="submit"
                          variant="contained"
                        >
                          Submit
                        </Button>
                      )}
                    </DialogActions>
                  </Form>
                );
              }}
            </Formik>
          </Stack>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default SelectSchemeMultiSelectDialog;
