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
        subTitle="File Approvals"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `File Approvals`,
            href: `/Onboarding/FileApprovals`,
          },
        ]}
      />
      <ListOfFiles approvals={"Approvals"} />
    </>
  );
};

export default Index;

const Input = styled("input")({
  display: "none",
});
