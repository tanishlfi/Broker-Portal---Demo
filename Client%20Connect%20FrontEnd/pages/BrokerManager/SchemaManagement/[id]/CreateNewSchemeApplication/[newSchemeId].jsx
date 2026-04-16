import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import BrokerDetails from "components/NewGroupScheme/BrokerDetails";
import UploadDocuments from "components/NewGroupScheme/UploadDocuments";
import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import BrokerQuotes from "components/NewGroupScheme/Quotes";
import BrokerSchemeBankingDetails from "components/NewGroupScheme/BrokerSchemeBankingDetails";
import BrokerSchemeHomeAddress from "components/NewGroupScheme/BrokerSchemeAdress";
import PageHeader from "components/Bits/PageHeader";
import ViewAllBrokerScheme from "components/NewGroupScheme/ViewAllBrokerScheme";
import AddBrokerSchemeNotes from "components/FormComponents.jsx/AddBrokerScemeNotes";

const steps = [
  "Broker Details",
  "Quotes",
  "Upload Documents",
  "Address Details",
  "Banking Details",
  "Finish",
];

export default function NewSchemeStepper() {
  const router = useRouter();

  const { id, newSchemeId, currentStep } = router.query;

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
    router.push(
      `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${newSchemeId}?currentStep=${step}`
    );
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

  const handleStep = (step) => () => {
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
            <BrokerDetails />
          </div>
        );
      case 1:
        return (
          <div>
            <BrokerQuotes />
          </div>
        );
      case 2:
        return (
          <div>
            <UploadDocuments />
          </div>
        );
      case 3:
        return (
          <div>
            <BrokerSchemeHomeAddress />
          </div>
        );
      case 4:
        return (
          <div>
            <BrokerSchemeBankingDetails />
          </div>
        );

      default:
        return (
          <div>
            <ViewAllBrokerScheme />
          </div>
        );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <PageHeader
        title="Create New Scheme Application"
        subTitle="Create a New Broker Scheme"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Broker Management",
            href: `/BrokerManager`,
          },
          {
            title: "Schema Management",
            href: `/BrokerManager/SchemaManagement/${id}`,
          },
          {
            title: "Create New Scheme Application",
            href: `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication`,
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

            <Stack>
              <AddBrokerSchemeNotes newSchemeId={newSchemeId} />
            </Stack>
          </React.Fragment>
        )}
      </div>
    </Box>
  );
}
