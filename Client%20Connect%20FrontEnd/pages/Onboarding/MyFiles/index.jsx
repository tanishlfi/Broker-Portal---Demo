import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";

import React, { useState } from "react";
import ListOfFiles from "components/OnBoardingFile/ListOfFiles";

// Path: pages\Brokers\OnBoarding\[id].js

const Index = () => {
  return (
    <>
      <PageHeader
        title="Onboarding"
        subTitle="My Files"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `My Files`,
            href: `/Onboarding/MyFiles`,
          },
        ]}
      />
      <ListOfFiles approvals={"Non"} />
    </>
  );
};

export default Index;

const Input = styled("input")({
  display: "none",
});
