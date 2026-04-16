import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import useToken from "hooks/useToken";
import PageHeader from "components/Bits/PageHeader";
import {
  CardHeader,
  Card,
  Grid,
  Stack,
  LinearProgress,
  Alert,
  Link,
  CardContent,
} from "@mui/material";
import { nodeSa } from "src/AxiosParams";
import ContentItem from "components/Containers/ContentItem";
import { ListDocuments } from "components/TasksComponents/ListDocuments";
import { useTheme } from "@mui/material/styles";
import MySlateEditor from "components/TasksComponents/MySlateEditor";
import ChangeTaskStatus from "components/TasksComponents/ChangeTaskStatus";
import EditTask from "components/TasksComponents/EditTask";

const Task = () => {
  const accessToken = useToken();
  const { id } = useParams();

  const theme = useTheme();

  const getTaskById = useQuery(
    [`getTask `, id],
    () => {
      return axios.get(`${nodeSa}/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  let content = getTaskById.data?.data?.data;

  return (
    <div>
      <PageHeader
        title="Task"
        subTitle="View Task"
        breadcrumbs={[{ title: "Tasks Manager", href: "/tasksManager" }]}
      />

      {getTaskById.isLoading ? (
        <LinearProgress />
      ) : (
        <Card>
          <CardHeader
            title={content?.title}
            subheader={content?.description}
            action={<EditTask data={content} />}
          />

          <Alert severity={content?.priority}>
            <strong>Priority:</strong>
            {content?.priority === "error"
              ? "High"
              : content?.priority === "warning"
              ? "Medium"
              : "Low"}
          </Alert>

          {content?.status && <ChangeTaskStatus data={content} />}

          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack
                  spacing={2}
                  direction="row"
                  justifyContent="space-between">
                  <ContentItem title="Assignee" value={content?.assignee} />
                  <ContentItem
                    title="Due Date"
                    value={`${new Date(content?.dueDate).toLocaleDateString()}`}
                  />
                  <ContentItem title="Created By" value={content?.createdBy} />
                </Stack>
                <Stack spacing={2} sx={{ p: 3 }} direction="row">
                  {content?.brokerId && (
                    <Link href={`/Brokers/${content?.brokerId}`}>
                      Brokerage {content?.brokerId}
                    </Link>
                  )}
                  {content?.schemeId && (
                    <Link
                      href={`/BrokerManager/SchemaManagement/${content?.brokerId}/Schema/${content?.schemeId}`}>
                      Scheme {content?.schemeId}
                    </Link>
                  )}
                </Stack>
                <ListDocuments documents={content?.tasksDocuments} />
                {content?.body && (
                  <MySlateEditor value={content?.body} onChange={() => {}} />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Task;
