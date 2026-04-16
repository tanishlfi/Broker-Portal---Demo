import { Button, Stack } from "@mui/material";
import { useFormikContext } from "formik";
import { useRouter } from "next/router";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const StepperButtons = ({ noSave }) => {
  const { submitForm, isSubmitting, is } = useFormikContext();

  const router = useRouter();

  const { id, newSchemeId, currentStep } = router.query;

  const handleBack = () => {
    let step = parseInt(currentStep) - 1;
    router.push(
      `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${newSchemeId}?currentStep=${step}`
    );
  };
  const handleNext = () => {
    let step = parseInt(currentStep) + 1;
    router.push(
      `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${newSchemeId}?currentStep=${step}`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <Stack sx={{ mt: 6 }} direction="row" justifyContent="space-between">
      <Button
        color="inherit"
        variant="outlined"
        startIcon={<ArrowBackIosNewIcon />}
        disabled={currentStep === 0}
        onClick={handleBack}
        sx={{ mr: 1 }}>
        Back
      </Button>

      {!noSave && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mr: 1 }}>
          Save
        </Button>
      )}

      <Button
        variant="outlined"
        endIcon={<ArrowForwardIosIcon />}
        onClick={handleNext}
        sx={{ mr: 1 }}>
        Next
      </Button>
    </Stack>
  );
};

export default StepperButtons;
