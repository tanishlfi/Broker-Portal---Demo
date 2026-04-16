import { Button, Card, CardContent, List, Stack } from "@mui/material";
import { Form, Formik } from "formik";
import React from "react";
import ContentItem from "../../Containers/ContentItem";
import TextfieldWrapper from "../../FormComponents.jsx/TextFieldWrapper";
import { useUser } from "@auth0/nextjs-auth0/client";

const NewBrokerNotes = () => {
  const { user } = useUser();

  const [newNote, setNewNote] = React.useState(false);

  const [notes, setNotes] = React.useState([]);

  const handleSaveNote = (values) => {
    setNotes([...notes, values]);
    setNewNote(false);
  };

  const handleReset = () => {
    setNewNote(false);
  };

  return (
    <Card sx={{ my: 4 }}>
      <CardContent>
        <Button
          onClick={() => setNewNote(!newNote)}
          variant="contained"
          sx={{ mb: 2 }}>
          Add Note
        </Button>
        {newNote && (
          <Formik
            initialValues={{
              note: "",
              active: false,
              createdAt: new Date(),
              created_by: user?.email,
            }}
            onSubmit={(values) => {
              handleSaveNote(values);
              handleReset();
            }}>
            {() => {
              return (
                <Form>
                  <Stack spacing={2}>
                    <TextfieldWrapper
                      name="note"
                      label="Note"
                      multiline
                      rows={4}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button onClick={handleReset} color="inherit">
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained">
                        Save Note
                      </Button>
                    </Stack>
                  </Stack>
                </Form>
              );
            }}
          </Formik>
        )}

        <List>
          {notes?.map((item, index) => {
            return (
              <ContentItem
                key={index}
                title={` ${new Date(
                  item?.createdAt
                ).toLocaleDateString()} - ${new Date(
                  item?.createdAt
                ).toLocaleTimeString()} - ${item?.created_by}`}
                value={item?.note}
              />
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default NewBrokerNotes;
