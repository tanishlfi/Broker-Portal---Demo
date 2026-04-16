import { Button, Stack } from "@mui/material";
import PageHeader from "components/Bits/PageHeader";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import { useRouter } from "next/router";
import React from "react";

const CreatePolicy = () => {
  const router = useRouter();

  const [broker, setBroker] = React.useState(null);
  const [productType, setProductType] = React.useState("");
  const [scheme, setScheme] = React.useState(null);

  if (!productType) {
    setProductType("Scheme");
  }

  return (
    <div>
      <>
        <PageHeader
          title="Onboarding"
          subTitle="Create Policy"
          breadcrumbs={[
            {
              title: "Home",
              href: "/",
            },
            {
              title: "Create New Policy",
              href: "/Onboarding/CreatePolicy",
            },
          ]}
        />

        <Stack sx={{ my: 2 }}>
          <Stack sx={{ mb: 2 }}>
            <SelectBroker select={broker} setSelect={setBroker} />
          </Stack>
          <Stack sx={{ my: 2 }}>
            <SelectScheme
              select={scheme}
              setSelect={setScheme}
              id={broker?.id}
            />
          </Stack>
        </Stack>
      </>

      {scheme && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            {
              router.push(
                `/Onboarding/CreatePolicy/${broker?.id}/${scheme.policyId}?type=${productType}`,
              );
            }
          }}
        >
          Create Policy
        </Button>
      )}
    </div>
  );
};

export default CreatePolicy;
