import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";
import { useRouter } from "next/router";

import React, { useState } from "react";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import OnboardingForm from "components/OnBoardingFile/OnboardingForm";
// import ListOfFiles from "components/OnBoardingFile/ListOfFiles";

// Path: pages\Brokers\OnBoarding\[id].js

const Index = () => {
  const [broker, setBroker] = useState(null);
  const router = useRouter();
  const { brokerId } = router.query;

  if (!broker && brokerId) {
    setBroker({ id: brokerId });
  }

  return (
    <>
      <PageHeader
        title="Onboarding"
        subTitle="File Upload"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `File Upload`,
            href: `/Onboarding/FileUpload/${broker?.id}`,
          },
        ]}
      />
      <Typography variant="h6">To Upload file ...</Typography>
      <br />

      {broker?.id && <OnboardingForm id={broker?.id} />}
      {/* <br />
      <br />
      <Typography variant="h6">List of Files</Typography>
      <ListOfFiles /> */}
    </>
  );
};

export default Index;

const Input = styled("input")({
  display: "none",
});
