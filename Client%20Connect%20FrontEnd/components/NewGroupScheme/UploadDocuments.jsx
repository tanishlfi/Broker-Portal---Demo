import React from "react";
import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import FileHandler from "./FileHandler";
import StepperButtons from "./StepperButtons";
import { Formik, Form } from "formik";

const DocumentTypes = [
  {
    title: "Proof of Establishment",
    description: "This is a proof of establishment",
    type: "proof_of_establishment",
  },
  {
    title: "Proof of Address",
    description: "This is a proof of address",
    type: "proof_of_address",
  },
  {
    title: "Other Required Documents",
    description: "Other Required Documents",
    type: "other_required_documents",
  },
];

const UploadDocuments = () => {
  const router = useRouter();
  const { id, newSchemeId, currentStep } = router.query;

  return (
    <Stack spacing={2}>
      {DocumentTypes.map((doc, index) => {
        return (
          <FileHandler
            key={doc.title}
            title={doc.title}
            description={doc?.description}
            newSchemeId={newSchemeId}
            DocumentType={doc.type}
          />
        );
      })}
      <Formik>
        <Form
          onSubmit={() => {
            router.push(
              `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${newSchemeId}?currentStep=${
                Number(currentStep) + 1
              }`
            );
          }}>
          <StepperButtons noSave />
        </Form>
      </Formik>
    </Stack>
  );
};

export default UploadDocuments;
