import { Box, Button, Stack } from "@mui/material";
import { useFormikContext } from "formik";
import { useRouter } from "next/router";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const BrokerStepperButtons = ({ noSave }) => {
  const { submitForm } = useFormikContext();

  const router = useRouter();

  const { id, currentStep } = router.query;

  const handleBack = () => {
    let step = parseInt(currentStep) - 1;
    router.push(`/NewBrokerOnboarding/${id}/?currentStep=${step}`);
  };
  const handleNext = () => {
    let step = parseInt(currentStep) + 1;
    router.push(`/NewBrokerOnboarding/${id}/?currentStep=${step}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm();

    handleNext();
  };

  return (
    <Stack sx={{ mt: 6 }} direction="row" justifyContent="space-between">
      <Button
        color="inherit"
        disabled={currentStep === "0" ? true : false}
        startIcon={<ArrowBackIosNewIcon />}
        variant="outlined"
        size="large"
        onClick={handleBack}
        sx={{ mr: 1 }}>
        Back
      </Button>

      {!noSave && (
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mr: 1, width: "500px" }}>
          Save
        </Button>
      )}

      <Button
        endIcon={<ArrowForwardIosIcon />}
        onClick={handleNext}
        size="large"
        variant="outlined"
        sx={{ mr: 1 }}>
        Next
      </Button>
    </Stack>
  );
};

export default BrokerStepperButtons;
