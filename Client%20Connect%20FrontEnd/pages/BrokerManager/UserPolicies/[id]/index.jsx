import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";
import React from "react";
import EditCreatedPolicyForms from "components/PolicyForms/EditCreatedPolicyForms";
import router from "next/router";

const EditCreatedPolicy = () => {
  const { id } = router.query;
  return (
    <div>
      <PageHeader
        title="User"
        subTitle="Manage Policy"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "BrokerManager",
            href: `BrokerManager`,
          },
          {
            title: `Edit Created Policies`,
            href: `/BrokerManager/EditCreatePolicy/${id}`,
          },
        ]}
      />

      <Stack spacing={2}>
        <EditCreatedPolicyForms />
      </Stack>
    </div>
  );
};

export default EditCreatedPolicy;
