import React, { useState } from "react";
import PageHeader from "components/Bits/PageHeader";
import { Grid, Card, CardActionArea, Typography, Box } from "@mui/material";
import VOPDReport from "../../../components/Reports/VOPD";
import ExceptionsReport from "../../../components/Reports/Exceptions";
import WorkSummaryReport from "../../../components/Reports/WorkSummary";
import ApproverWorkSummary from "../../../components/Reports/ApproverSummary";

const VOPD = () => <VOPDReport />;
const Exceptions = () => <ExceptionsReport />;
const WorkSummary = () => <WorkSummaryReport />;

const ReportsMain = ({ user, modules }) => {
  const [selectedReport, setSelectedReport] = useState(null);

  const Paths = [
    { name: "VOPD", component: <VOPD /> },
    { name: "Exceptions", component: <Exceptions /> },
    { name: "Work Summary", component: <WorkSummary /> },
    { name: "Approver Summary", component: <ApproverWorkSummary /> },
  ];

  const renderContent = () => {
    if (selectedReport) {
      return selectedReport.component;
    }
    return (
      <Grid container spacing={2} justifyContent="center">
        Select a report to view its content.
      </Grid>
    );
  };

  return (
    <>
      <PageHeader
        title="Onboarding"
        subTitle="Reports"
        breadcrumbs={[
          { title: "Home", href: "/" },
          { title: "Reports", href: "/Onboarding/Reports" },
        ]}
      />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        height="100vh"
      >
        <Grid container spacing={2} justifyContent="center">
          {Paths.map((path, index) => (
            <Grid key={index} item xs={3}>
              <Card sx={{ borderRadius: 0 }}>
                <CardActionArea
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    py: 6,
                  }}
                  onClick={() => {
                    setSelectedReport(path);
                  }}
                >
                  <Typography color="textPrimary">{path.name}</Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box flex={1} p={2} width="100%">
          {renderContent()}
        </Box>
      </Box>
    </>
  );
};

export default ReportsMain;
