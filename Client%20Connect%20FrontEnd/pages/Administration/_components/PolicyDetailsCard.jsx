import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

const PolicyDetailsCard = ({ PolicyData, ParentPolicy }) => {
  // console.log(PolicyData);
  // console.log(ParentPolicy);

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        sx={{ mb: 0, pb: 0 }}
        title={<Typography>Policy Details</Typography>}
      />
      <Divider sx={{ my: 1 }} />

      <CardContent sx={{ mt: 0, pt: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Stack>
              <Typography variant="caption" color="GrayText">
                Brokerage
              </Typography>
              <Typography variant="caption">{PolicyData?.brokerage}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="GrayText">
                Scheme
              </Typography>
              <Typography variant="caption">{PolicyData?.scheme}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="GrayText">
                Scheme Inception Date
              </Typography>
              <Typography variant="caption">
                {dayjs(ParentPolicy?.policyInceptionDate).format("DD/MM/YYYY")}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack>
              <Typography variant="caption" color="GrayText">
                Policy Number
              </Typography>
              <Typography variant="caption">
                {PolicyData?.PolicyNumber}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="GrayText">
                Inception Date
              </Typography>
              <Typography variant="caption">
                {dayjs(PolicyData?.policyInceptionDate).format("DD/MM/YYYY")}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PolicyDetailsCard;
