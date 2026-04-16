import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  LinearProgress,
  List,
  Stack,
} from "@mui/material";
import { Formik, Form } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useMutation, useQuery } from "react-query";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import ContentItem from "components/Containers/ContentItem";

const AddBrokerSchemeNotes = ({ newSchemeId }) => {
  const accessToken = useToken();

  const [newNote, setNewNote] = useState(false);

  const brokerSchemeNotes = useQuery(
    ["getNotes", newSchemeId],
    async () =>
      axios.get(`${nodeSa}/brokerscheme/scheme_notes/${newSchemeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    { enabled: !!accessToken && !!newSchemeId }
  );

  const addBrokerNote = useMutation(
    (newNote) =>
      axios.post(
        `${nodeSa}/brokerscheme/scheme_notes/${newSchemeId}`,
        newNote,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      onSuccess: () => {
        brokerSchemeNotes.refetch();
      },
      onError: (error) => {
        console.error("Error adding broker note:", error);
      },
    }
  );

  const handleReset = () => {
    setNewNote(false);
  };

  return (
    <Card sx={{ my: 4 }}>
      {brokerSchemeNotes?.isFetching && <LinearProgress />}

      <CardContent>
        <Button
          sx={{ mb: 2 }}
          onClick={() => {
            setNewNote(!newNote);
          }}>
          Add Note
        </Button>
        {newNote && (
          <Formik
            initialValues={{
              note: "",
              active: false,
            }}
            onSubmit={(values) => {
              addBrokerNote.mutate(values);
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
          {brokerSchemeNotes?.data?.data?.data.map((item, index) => {
            return (
              <ContentItem
                key={index}
                title={` ${new Date(
                  item.createdAt
                ).toLocaleDateString()} - ${new Date(
                  item.createdAt
                ).toLocaleTimeString()} - ${item.created_by}`}
                value={item.note}
              />
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default AddBrokerSchemeNotes;
