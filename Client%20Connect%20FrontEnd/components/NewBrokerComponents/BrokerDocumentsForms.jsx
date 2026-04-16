import React from "react";
import { Card, CardContent, CardHeader, Stack } from "@mui/material";
import { useRouter } from "next/router";

import { Formik, Form } from "formik";
import BrokerFileHandler from "./FormComps/BrokerFileHandler";
import BrokerStepperButtons from "./FormComps/BrokerStepperButtons";

const DocumentTypes = [
  {
    title:
      "CIPC Registration Documents (Registration Certificate, Confirmation of Address) (if Applicable)",
    description:
      "CIPC Registration Documents (Registration Certificate, Confirmation of Address) (if Applicable)",
    type: "CIPCRegistrationDocuments",
  },
  {
    title:
      "Proof of Association/Group Schemes Constitution and Date of last held independent elections or Proof of Registration as a Fund under the Friendly Societies Act.",
    description:
      "Proof of Association/Group Schemes Constitution and Date of last held independent elections or Proof of Registration as a Fund under the Friendly Societies Act.",
    type: "ProofOfAssociationGroupSchemes",
  },
  {
    title:
      "SARS LOG, VAT Certificate (if Applicable) and Proof of Bank Account (Less than 3 Months)",
    description:
      "SARS LOG, VAT Certificate (if Applicable) and Proof of Bank Account (Less than 3 Months)",
    type: "SARSLOGVATCertificate",
  },
  {
    title:
      "Completed and Signed Broker Appointment Letter (required for broker commission payment) or Mandate Agreement",
    description:
      "Completed and Signed Broker Appointment Letter (required for broker commission payment) or Mandate Agreement",
    type: "SignedBrokerAppointmentLetter",
  },
  {
    title: "Completed and Signed Rules of Engagement",
    description: "Completed and Signed Rules of Engagement",
    type: "SignedRulesOfEngagement",
  },
  {
    title: "Completed and Signed Debit Order Mandate",
    description: "Completed and Signed Debit Order Mandate",
    type: "SignedDebitOrderMandate",
  },
  {
    title:
      "Resolution Letter confirming Signatory and Scheme Chairman/Representative",
    description:
      "Resolution Letter confirming Signatory and Scheme Chairman/Representative",
    type: "ResolutionLetter",
  },
  {
    title: "Signed Quotation Acceptance Letter",
    description: "Signed Quotation Acceptance Letter",
    type: "SignedQuotationAcceptanceLetter",
  },
  {
    title: "Proof of Previous Insurance Requirements (if applicable)",
    description: "Proof of Previous Insurance Requirements (if applicable)",
    type: "ProofOfPreviousInsurance",
  },
];

const BrokerDocumentsForms = () => {
  const router = useRouter();
  const { id, newSchemeId, currentStep } = router.query;

  return (
    <Card>
      <CardHeader title={`Manage Broker Documents`} />
      <CardContent>
        <Stack spacing={2}>
          {DocumentTypes.map((doc, index) => {
            return (
              <BrokerFileHandler
                key={doc.title}
                title={doc.title}
                description={doc?.description}
                DocumentType={doc.type}
              />
            );
          })}
          <Formik>
            <Form>
              <BrokerStepperButtons noSave />
            </Form>
          </Formik>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BrokerDocumentsForms;
