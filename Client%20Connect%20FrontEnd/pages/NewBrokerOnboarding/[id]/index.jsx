import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import PageHeader from "components/Bits/PageHeader";
import BrokerFrom from "components/NewBrokerComponents/BrokerFrom";

import RepresentativesForms from "../../../components/NewBrokerComponents/RepresentativesForms";
import BrokerDocumentsForms from "../../../components/NewBrokerComponents/BrokerDocumentsForms";
import BrokerAddressForms from "../../../components/NewBrokerComponents/BrokerAddressForms";
import NewBrokerNotes from "../../../components/NewBrokerComponents/FormComps/NewBrokerNotes";
import BrokerBankingDetails from "../../../components/NewBrokerComponents/BrokerBankingDetails";

const steps = [
  "Broker Details",
  "Representatives",
  "Documents",
  "Banking Details",
  "Broker Addresses",
  "Finish",
];

export default function NewBrokerForms() {
  const router = useRouter();

  const { id, currentStep } = router.query;

  const [activeStep, setActiveStep] = React.useState();

  React.useEffect(() => {
    const setNumber = parseInt(currentStep);

    if (currentStep) {
      setActiveStep(setNumber);
    } else {
      setActiveStep(0);
    }
  }, [currentStep]);

  const ChangeCurrentStep = (step) => {
    router.push(`/NewBrokerOnboarding/${id}?currentStep=${step}`);
  };

  const [completed, setCompleted] = React.useState({});

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;

    ChangeCurrentStep(newActiveStep);

    setActiveStep(newActiveStep);
  };

  const handleStep = (step) => () => {
    console.log("step", step);
    setActiveStep(step);
    ChangeCurrentStep(step);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  const getStepContent = (step) => {
    switch (activeStep) {
      case 0:
        return (
          <div>
            <BrokerFrom />
          </div>
        );

      case 1:
        return (
          <div>
            <RepresentativesForms />
          </div>
        );
      case 2:
        return (
          <div>
            <BrokerDocumentsForms />
          </div>
        );
      case 3:
        return (
          <div>
            <BrokerBankingDetails />
          </div>
        );
      case 4:
        return <BrokerAddressForms />;

      default:
        return (
          <div>
            <h1>Finish</h1>
          </div>
        );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <PageHeader
        title="Broker Onboarding"
        subTitle="Add New Broker"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Broker Onboarding",
            href: "/NewBrokerOnboarding",
          },
          {
            title: "Broker Details",
            href: `/NewBrokerOnboarding/${id}`,
          },
        ]}
      />

      <Stepper sx={{ mb: 4 }} nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={handleStep(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        {allStepsCompleted() ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Box>{getStepContent(activeStep)}</Box>
          </React.Fragment>
        )}
      </div>
      <NewBrokerNotes />
    </Box>
  );
}
