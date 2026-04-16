import PageHeader from "components/Bits/PageHeader";
import OnboardingForm from "components/OnBoardingFile/OnboardingForm";
import { useRouter } from "next/router";
import React from "react";

const OnBoarding = () => {
  const router = useRouter();

  const { id } = router.query;
  return (
    <div>
      <PageHeader
        title="OnBoarding"
        subTitle="Manage OnBoarding"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Brokers",
            href: "/Brokers",
          },
          {
            title: "OnBoarding",
            href: `/Brokers/${id}/OnBoarding`,
          },
        ]}
      />
      <OnboardingForm id={id} />
    </div>
  );
};

export default OnBoarding;
