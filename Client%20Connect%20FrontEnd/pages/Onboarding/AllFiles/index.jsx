import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";

import React, { useState } from "react";
import ListOfFilesAll from "components/OnBoardingFile/ListOfFilesAll";

// Path: pages\Brokers\OnBoarding\[id].js

const Index = () => {
  return (
    <>
      <PageHeader
        title="Onboarding"
        subTitle="All Files"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `All Files`,
            href: `/Onboarding/AllFiles`,
          },
        ]}
      />
      <ListOfFilesAll />
    </>
  );
};

export default Index;

const Input = styled("input")({
  display: "none",
});
