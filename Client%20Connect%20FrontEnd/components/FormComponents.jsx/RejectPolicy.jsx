import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import TextfieldWrapper from "./TextFieldWrapper";
import { useMutation, useQueryClient } from "react-query";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";

import { useRouter } from "next/router";
import useToken from "hooks/useToken";

export default function RejectPolicy({ policy, setPolicyDetails, setMembers }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const accessToken = useToken();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // console.log(policy);

  const CreatePolicyRequestWithProblem = useMutation(
    (data) => {
      return axios.post(
        `${nodeSa}/onboarding/policies/${policy?.id}/save`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        setPolicyDetails({
          ...data.data.data,
          // categoryId: data.data.data?.selectedCategory,
        });
        setMembers(data?.data?.data?.members);
      },
    },
  );

  const handleSubmit = (data) => {
    const sub = CreatePolicyRequestWithProblem.mutate(data, {
      onSuccess: (data) => {
        // Clear Local Storage
        handleClose();
      },
    });
    console.log(sub);
  };

  return (
    <div>
      <Button
        fullWidth
        color="error"
        variant="contained"
        sx={{
          minWidth: 150, // Set the minimum width to 150px
        }}
        onClick={handleClickOpen}
      >
        Reject Policy
      </Button>
      <Dialog
        sx={{
          border: "3px solid red",
        }}
        fullWidth
        maxWidth="md"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Reject Approval Of this Policy</DialogTitle>
        <Stack spacing={2} sx={{ p: 2 }}>
          <DialogContentText>
            Please enter a reason for rejecting this policy.
          </DialogContentText>

          <Formik
            initialValues={{
              status: "Rejected",
              statusNote: "",
            }}
            onSubmit={(values) => {
              let PolicyData = {
                ...policy,
                ...values,
                members: policy.members.map((member) => {
                  return member;
                }),
              };

              handleSubmit(PolicyData);
            }}
          >
            {() => {
              return (
                <Form>
                  <TextfieldWrapper
                    name="statusNote"
                    label="Please Add some Notes"
                    multiline
                    rows={4}
                  />
                  <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" color="error" type="submit">
                      Send
                    </Button>
                  </DialogActions>
                </Form>
              );
            }}
          </Formik>
        </Stack>
      </Dialog>
    </div>
  );
}
