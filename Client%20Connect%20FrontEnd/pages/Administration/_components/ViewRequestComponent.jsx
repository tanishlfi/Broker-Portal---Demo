import {
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from "@mui/material";
import React from "react";

import DownloadFileButton from "../../../components/Bits/DownloadFileButton";
import MySlateEditor from "../../../components/TasksComponents/MySlateEditor";

import dayjs from "dayjs";
import { useTheme } from "@emotion/react";
import { ListItem, ListItemText } from "@mui/material";

const ViewRequestComponent = ({ request }) => {
  const theme = useTheme();

  // console.log(request);

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container>
          <Grid item xs={6}>
            <ContentItem
              title="Brokerage"
              value={request?.PolicyData?.brokerage}
            />
            <ContentItem title="Scheme" value={request?.PolicyData?.scheme} />
            {/* <ContentItem
              title="Parent Policy Number"
              value={request?.PolicyData?.ParentPolicyNumber}
            /> */}
            <ContentItem
              title="Policy Number"
              value={request?.PolicyData?.PolicyNumber}
            />
            {/* <ContentItem
              title="Policy Id"
              value={request?.PolicyData?.PolicyId}
            /> */}
          </Grid>

          <Grid item xs={6}>
            <ContentItem
              title="Main Member"
              value={request?.PolicyData?.mainMember}
            />
            <ContentItem
              title="ID Number"
              value={request?.PolicyData?.mainMemberId}
            />
          </Grid>
          <Grid item xs={12}>
            <ContentItem title="Request Type" value={request?.requestType} />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ ml: 2 }} variant="body1">
              Request Description
            </Typography>
            <Divider sx={{ my: 2 }} />
            {request?.requestDescription &&
              request?.requestDescription?.length > 0 && (
                <MySlateEditor
                  onChange={() => {}}
                  value={JSON.parse(request?.requestDescription)}
                  readOnly
                />
              )}
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ ml: 2, mt: 2 }} variant="body1">
              Attached Documents
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack
              sx={{
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {request?.attachments && request?.attachments?.length > 0 && (
                <DownloadFileButton documents={request?.attachments} />
              )}
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <ContentItem title="Requested By" value={request?.requestedBy} />
          </Grid>
          <Grid item xs={6}>
            <ContentItem
              title="Requested Date"
              value={dayjs(request?.requestedDate).format("DD-MMM-YYYY")}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ViewRequestComponent;

const ContentItem = ({ title, value }) => {
  return (
    <>
      <ListItem dense alignItems="flex-start">
        <ListItemText
          sx={{ my: 0, py: 0 }}
          primary={
            <>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {title}
              </Typography>
            </>
          }
          secondary={
            <>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body1"
                color="text.primary"
              >
                {value}
              </Typography>
            </>
          }
        />
      </ListItem>
    </>
  );
};
