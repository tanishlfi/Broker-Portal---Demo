import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Form, Formik } from "formik";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import { Stack } from "@mui/material";

export default function AllocateUserRole({ AllocateRoleToUser, roles }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="outlined"
        fullWidth
        color="warning"
        onClick={handleClickOpen}>
        Assign User Role / Change User Role
      </Button>

      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
        <DialogTitle> Assign User Role</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              id: "",
            }}
            onSubmit={(values) => {
              let subData = {
                roles: [values.id],
              };

              AllocateRoleToUser.mutate(subData, {
                onSuccess: () => {
                  handleClose();
                },
              });
            }}
            enableReinitialize={true}>
            {({ dirty, isSubmitting }) => {
              return (
                <Form>
                  <Stack sx={{ my: 3 }}>
                    <SelectWrapper
                      name="id"
                      label="role"
                      options={
                        roles?.map((role) => {
                          return {
                            label: role.description,
                            value: role.id,
                          };
                        }) ?? []
                      }
                    />

                    <DialogActions sx={{ mt: 3 }}>
                      <Button onClick={handleClose}>Cancel</Button>
                      {dirty && (
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          variant="contained"
                          color="secondary">
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      )}
                    </DialogActions>
                  </Stack>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
}
