import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import { Stack } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import useToken from "hooks/useToken";
import { nodeSa } from "src/AxiosParams";

export default function AllocateBroker({ user, isNew }) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const accessToken = useToken();

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
        queryClient.invalidateQueries(["getUserById", user?.user_id]);
        handleClose();
      },
    }
  );

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      {isNew ? (
        <Button variant="contained" onClick={handleClickOpen}>
          Allocate Broker To User
        </Button>
      ) : (
        <Button onClick={handleClickOpen}>Allocate Broker To User</Button>
      )}

      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
        <DialogTitle>Allocate Broker To User</DialogTitle>
        <Formik
          initialValues={{ broker: null }}
          onSubmit={(values, { setSubmitting }) => {
            const data = {
              user_metadata: {
                BrokerageIds: values.broker ? [values.broker.id] : [],
              },
            };
            AllocateUserDetails.mutate(data);
            setSubmitting(false);
          }}>
          {({ setFieldValue, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Stack sx={{ my: 2, py: 2 }}>
                  <Field name="broker">
                    {() => (
                      <SelectBroker
                        select={(fieldProps) => fieldProps.form.values.broker}
                        setSelect={(newValue) =>
                          setFieldValue("broker", newValue)
                        }
                      />
                    )}
                  </Field>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={isSubmitting}>
                  Submit
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
}
