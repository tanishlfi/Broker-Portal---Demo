import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";
import React from "react";
import router from "next/router";
import ListOfSchemes from "../UserScheme/UserEdit";

const EditScheme = () => {
  const { id } = router.query;
  return (
    <div>
      <PageHeader
        title="User Scheme"
        subTitle="Manage Scheme"
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
            title: `Edit Created Schemes`,
            href: `/BrokerManager/CreatedScheme/${id}`,
          },
        ]}
      />
      <ListOfSchemes />
    </div>
  );
};

export default EditScheme;
