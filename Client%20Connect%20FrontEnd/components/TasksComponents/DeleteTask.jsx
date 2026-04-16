import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

import { nodeSa } from "src/AxiosParams";
import useToken from "hooks/useToken";
import AlertPopup from "components/Bits/AlertPopup";

const DeleteTask = ({ data }) => {
  const [open, setOpen] = React.useState(false);

  const accessToken = useToken();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const queryClient = useQueryClient();

  const deleteTask = useMutation(
    [`deleteTask `, data?.id],
    () => {
      return axios.delete(`${nodeSa}/tasks/${data?.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`getAllTasks`],
        });
      },
    }
  );

  const HandleRemove = () => {
    deleteTask.mutate(
      {},
      {
        onSuccess: () => {
          setTimeout(() => {
            handleClose();
          }, 1000);
        },
      }
    );
  };

  return (
    <div>
      <IconButton
        onClick={handleClickOpen}
        color="error"
        aria-label="delete_task"
        component="label">
        <DeleteIcon />
      </IconButton>
      <Dialog
        sx={{ border: 5, borderColor: "error.main" }}
        open={open}
        maxWidth="md"
        fullWidth
        keepMounted
        onClose={handleClose}
        aria-describedby="delete_task">
        <DialogTitle>Are you sure? </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete_task">
            Are you sure you want to delete this task : {data?.title}, <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        {deleteTask.isSuccess && (
          <AlertPopup
            open={deleteTask.isSuccess}
            message="Task Deleted Successfully"
            severity="success"
          />
        )}
        {deleteTask.isError && (
          <AlertPopup
            open={deleteTask.isError}
            message="Error Deleting Task"
            severity="error"
          />
        )}
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button
            disabled={deleteTask.isLoading ? true : false}
            color="error"
            variant="contained"
            onClick={HandleRemove}>
            Delete
          </Button>

          <></>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteTask;
