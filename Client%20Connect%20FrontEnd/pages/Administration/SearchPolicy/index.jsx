import {
  Button,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import PageHeader from "components/Bits/PageHeader";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectRepresentative from "components/FormComponents.jsx/SelectRepresentative";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { getProductTypes } from "components/Bits/GetProductTypes";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import axios from "axios";
import { rmaAPI } from "src/AxiosParams";
import useToken from "hooks/useToken";
import { useMutation, useQuery, useQueryClient } from "react-query";
import ListOfPolicies from "components/SearchPolicy/ListOfPolicies";

const SearchPolicy = () => {
  const router = useRouter();

  const accessToken = useToken();

  const [policies, setPolicies] = React.useState([]);

  const [searchComplete, setSearchComplete] = React.useState(false);

  const [searchResults, setSearchResults] = React.useState(() => {
    // Retrieve search criteria from local storage if available
    const savedCriteria = localStorage.getItem("searchCriteria");
    return savedCriteria ? JSON.parse(savedCriteria) : {};
  });

  React.useEffect(() => {
    if (searchResults) {
      setPolicies(searchResults.data);
    }
  }, [searchResults]);

  const GetRolePlayerByIdNumber = useMutation(
    (newParam) => {
      return axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/GetPoliciesByRolePlayerIdNumber/${newParam}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
    {
      enabled: !!accessToken,
      onSuccess: (data, newParam) => {
        // console.log("Success", data?.data);

        if (data?.data && data?.data.length > 0) {
          setPolicies(data?.data);
          setSearchComplete(true);
          // console.log("policies", data);
          localStorage.setItem(
            "searchCriteria",
            JSON.stringify({
              data: data?.data,
              field: "idNumber",
              value: newParam,
            }),
          );
        } else {
          setPolicies([]);
          setSearchComplete(false);
        }
        // console.log("policies2", policies);
        // rerender CreatePolicyDetails component
      },
      onError: (error) => {
        // console.log("Error", error);
        setPolicies([]);
        setSearchComplete(false);
      },
    },
  );

  // get policy using policy number
  const GetPolicyByPolicyNumber = useMutation(
    (data) => {
      // console.log(data);
      return axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/GetPolicyByNumber/${data}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        // console.log("Success", data?.data);
        // check if key !data?.data?.success has a value

        if (data?.data !== null) {
          // set data.data to array
          let newArr = [];
          newArr.push(data?.data);
          setPolicies(newArr);
          setSearchComplete(true);
          localStorage.setItem(
            "searchCriteria",
            JSON.stringify({
              data: newArr,
              field: "policyNumber",
              value: data?.data?.policyNumber,
            }),
          );
        } else {
          setPolicies([]);
          setSearchComplete(false);
        }
        // console.log("policies", policies);

        // rerender CreatePolicyDetails component
      },
      onError: (error) => {
        // console.log("Error", error);
        setPolicies([]);
        setSearchComplete(false);
      },
    },
  );

  const handleSubmit = (values) => {
    // console.log(values);
    setSearchComplete(true);
    if (values.idNumber) {
      GetRolePlayerByIdNumber.mutate(values.idNumber.trim());
    } else {
      GetPolicyByPolicyNumber.mutate(values.policyNumber.trim());
    }
  };

  const clearSearchCriteria = () => {
    localStorage.removeItem("searchCriteria");
    setSearchResults({});
    setPolicies([]);
    // reset  GetPolicyByPolicyNumber and GetRolePlayerByIdNumber
    GetPolicyByPolicyNumber.reset();
    GetRolePlayerByIdNumber.reset();
    // relload page
    // router.reload();
  };

  return (
    <>
      <Formik
        initialValues={{
          idNumber:
            searchResults?.field === "idNumber" ? searchResults?.value : "",
          policyNumber:
            searchResults?.field === "policyNumber" ? searchResults?.value : "",
        }}
        enableReinitialize={true}
        validationSchema={validation}
        onSubmit={handleSubmit} // Pass handleSubmit here
      >
        {({ values, setFieldValue, errors }) => {
          return (
            <>
              <PageHeader
                title="Administration"
                subTitle="Search Policy"
                breadcrumbs={[
                  {
                    title: "Home",
                    href: "/",
                  },
                  {
                    title: "Search Policy",
                    href: "/Administration/SearchPolicy",
                  },
                ]}
              />
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextfieldWrapper
                      label="Policy Number"
                      name="policyNumber"
                      value={values.policyNumber}
                      disabled={GetPolicyByPolicyNumber.isLoading}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextfieldWrapper
                      label="ID Number"
                      name="idNumber"
                      value={values.idNumber}
                      disabled={GetRolePlayerByIdNumber.isLoading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      sx={{ marginRight: 2 }}
                    >
                      {searchComplete ? "Searching..." : "Search"}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={clearSearchCriteria}
                    >
                      Clear Search
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    {(GetRolePlayerByIdNumber.isSuccess ||
                      GetPolicyByPolicyNumber.isSuccess ||
                      GetPolicyByPolicyNumber.isError ||
                      GetRolePlayerByIdNumber.isError) &&
                      policies &&
                      policies.length === 0 && (
                        <Alert severity="warning">No Policies Found</Alert>
                      )}
                  </Grid>
                </Grid>
              </Form>
            </>
          );
        }}
      </Formik>
      <Stack spacing={2}>
        {policies && policies.length > 0 && (
          <ListOfPolicies
            policies={policies}
            setSearchComplete={setSearchComplete}
          />
        )}
      </Stack>
    </>
  );
};

export default SearchPolicy;

const validation = Yup.object({
  idNumber: Yup.string().matches(
    /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
    "SA Id Number seems to be invalid",
  ),

  policyNumber: Yup.string().test(
    "either-id-or-policy",
    "Either ID Number or Policy Number is required",
    function (value) {
      const { idNumber } = this.parent;
      return idNumber || value;
    },
  ),
});
