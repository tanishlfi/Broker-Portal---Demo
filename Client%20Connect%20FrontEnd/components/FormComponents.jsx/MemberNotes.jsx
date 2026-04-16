import { Button, List, Stack, TextField } from "@mui/material";
import ContentItem from "components/Containers/ContentItem";
import { useFormikContext } from "formik";
import React from "react";

import { useUser } from "@auth0/nextjs-auth0/client";

const MemberNotes = () => {
  const { values, setFieldValue } = useFormikContext();

  const { user } = useUser();

  const [addNote, setAddNote] = React.useState(false);

  const [newNote, setNewNote] = React.useState("");

  const reset = () => {
    setNewNote("");
    setAddNote(false);
  };

  const handleNotes = (e) => {
    setFieldValue("notes", [
      ...values?.notes,
      {
        note: newNote,
        createdAt: new Date(),
        createdBy: user.email,
      },
    ]);
    reset();
  };

  return (
    <Stack>
      <List>
        {values?.notes &&
          values?.notes?.map((item, index) => {
            return (
              <ContentItem
                key={index}
                title={` ${new Date(
                  item.createdAt
                ).toLocaleDateString()} - ${new Date(
                  item.createdAt
                ).toLocaleTimeString()} - ${item.createdBy}`}
                value={item.note}
              />
            );
          })}
      </List>
      {!addNote && (
        <Button
          onClick={() => {
            setAddNote(!addNote);
          }}
        >
          Add Note
        </Button>
      )}

      <Stack>
        {addNote && (
          <>
            <TextField
              name="Note"
              label="Note"
              multiline
              value={newNote}
              rows={4}
              variant="outlined"
              onChange={(event) => {
                setNewNote(event.target.value);
              }}
            />
            <Stack sx={{ mt: 2 }} spacing={2} direction="row">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNotes}
              >
                Add Note
              </Button>
              <Button onClick={reset} color="inherit">
                Cancel
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default MemberNotes;
