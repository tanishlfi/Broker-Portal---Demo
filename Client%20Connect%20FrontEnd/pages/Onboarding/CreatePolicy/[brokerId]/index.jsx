import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import PageHeader from "components/Bits/PageHeader";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectRepresentative from "components/FormComponents.jsx/SelectRepresentative";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { getProductTypes } from "components/Bits/GetProductTypes";

const CreatePolicy = () => {
  const router = useRouter();
  const { brokerId } = router.query;

  const [broker, setBroker] = React.useState(null);
  const [productType, setProductType] = React.useState("");
  const [type, setType] = React.useState("");
  const [scheme, setScheme] = React.useState(null);
  const [representative, setRepresentative] = React.useState(null);

  if (!broker && brokerId) {
    setBroker({ id: brokerId });
  }

  useEffect(() => {
    if (productType) {
      setType(productType);
    } else {
      setType("");
    }
  }, [productType]);

  const SwitchType = (value) => {
    setType(value);
    setScheme(null);
    setRepresentative(null);
  };

  if (!productType) {
    setProductType("Scheme");
  }

  return (
    <div>
      <>
        <PageHeader
          title="Create Policy"
          subTitle="Create Policy"
          breadcrumbs={[
            {
              title: "Home",
              href: "/",
            },
            {
              title: "Create New Policy",
              href: `/Onboarding/CreatePolicy/${broker?.id}`,
            },
          ]}
        />

        {/* <Stack sx={{ my: 2 }}>
          {broker?.id && (
            <>
              <FormControl
                sx={{
                  width: "400px",
                }}
              >
                <InputLabel id="product_type">Select Product Type</InputLabel>
                <Select
                  labelId="product_type"
                  id="productType"
                  value={productType}
                  label="Select Product Type"
                  onChange={(event) => setProductType(event.target.value)}
                >
                  {getProductTypes.map((product) => {
                    if (product === "Scheme") {
                      return (
                        <MenuItem key={product} value={product}>
                          {product}
                        </MenuItem>
                      );
                    } else {
                      return (
                        <MenuItem key={product} value={product} disabled>
                          {product}
                        </MenuItem>
                      );
                    }
                  })}
                </Select>
              </FormControl>
            </>
          )}
        </Stack> */}
        {/* 
        {productType && (
          <Stack sx={{ my: 2 }}>
            <FormControl
              disabled={productType ? false : true}
              sx={{
                width: "400px",
              }}>
              <InputLabel id="select_Policy_id">Policy Type</InputLabel>
              <Select
                labelId="select_Policy_id"
                id="selectPolicy"
                value={type}
                label="Policy Type"
                onChange={(event) => SwitchType(event.target.value)}>
                <MenuItem value="Scheme">Scheme</MenuItem>
                <MenuItem value="Representative">Representative</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )} */}
      </>

      <Stack sx={{ my: 2 }}>
        <SelectScheme select={scheme} setSelect={setScheme} id={broker?.id} />
      </Stack>

      {/* {type === "Representative" && (
        <Stack sx={{ my: 1 }}>
          <SelectRepresentative
            select={representative}
            setSelect={setRepresentative}
            id={broker?.id}
          />
        </Stack>
      )} */}

      {(scheme || representative) && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            {
              scheme
                ? router.push(
                    `/Onboarding/CreatePolicy/${broker?.id}/${scheme.policyId}?type=${productType}`,
                  )
                : router.push(
                    `/BrokerManager/Representative/${broker?.id}/policies/${representative.id}/CreateRepresentativePolicy?type=${productType}`,
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
