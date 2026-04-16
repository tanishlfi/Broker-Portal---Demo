import { Card, List, ListSubheader, Paper, Stack, Grid } from "@mui/material";
import React from "react";
import ContentItem from "../../../components/Containers/ContentItem";

const returnFormattedDate = (date2format) => {
  const date = new Date(date2format);
  const formattedDate = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"), // +1 because getMonth() returns 0-11
    date.getDate().toString().padStart(2, "0"),
  ].join("-");
  return formattedDate;
};

const ViewEditPolicyCard = ({
  brokerageName,
  providerName,
  providerInceptionDate,
  policyNumber,
  joinDate,
  createdBy,
  approver,
}) => {
  const schemeInceptionDate = returnFormattedDate(providerInceptionDate);
  const policyJoinDate = returnFormattedDate(joinDate);
  return (
    <div>
      <Stack spacing={2} sx={{ pb: 2 }}>
        <Card>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ListSubheader
                color="inherit"
                variant="outlined"
                component={Paper}>
                Policy Details
              </ListSubheader>
            </Grid>

            <Grid item xs={6}>
              <List
                dense
                sx={{
                  width: "100%",
                }}>
                <ContentItem title="Brokerage Name" value={brokerageName} />
                <ContentItem
                  title="Scheme / Representative Name"
                  value={providerName}
                />
                <ContentItem
                  title="Scheme / Representative Inception Date"
                  value={schemeInceptionDate}
                />
                {createdBy && (
                  <ContentItem title="Policy Edit By" value={createdBy} />
                )}
              </List>
            </Grid>
            <Grid item xs={6}>
              <List
                dense
                sx={{
                  width: "100%",
                }}>
                <ContentItem title={"Policy Number"} value={policyNumber} />
                <ContentItem title={"Inception Date"} value={policyJoinDate} />
                {approver && (
                  <ContentItem title="Policy Approver" value={approver} />
                )}
              </List>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </div>
  );
};

export default ViewEditPolicyCard;
