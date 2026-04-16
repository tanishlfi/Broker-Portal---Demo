import { Button, FormControl, Grid, TextField, Tooltip } from "@mui/material";

import axios from "axios";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import { Form, Formik } from "formik";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import * as Yup from "yup";

const ClientMain = ({ accessToken, values }) => {
  const IdTypes = useQuery(
    `UserProfileTypeId`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/IdType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    { refetchOnWindowFocus: false },
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {IdTypes.isLoading ? (
            <p>Loading Id Types...</p>
          ) : (
            <SelectWrapper
              name="id_type_id"
              label="User ID Type"
              options={
                IdTypes?.data
                  ? IdTypes.data.data.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))
                  : []
              }
            />
          )}
        </Grid>

        <>
          {values.id_type_id === 1 ? (
            <>
              <Grid item xs={9}>
                <TextfieldWrapper
                  type="number"
                  name="id_number"
                  label="ID Number"
                />
              </Grid>
              <Grid item xs={3}>
                {!values.valid_sa_id && <VopdRequest />}
              </Grid>
            </>
          ) : values.id_type_id === 0 ? (
            <>
              <Grid item xs={6}>
                <TextfieldWrapper name="id_number" label={"Group Number"} />
              </Grid>
              <Grid item xs={6}>
                <DOBPicker name="dob" label="Date of Birth" />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6}>
                <TextfieldWrapper
                  name="id_number"
                  label={
                    values.id_type_id
                      ? IdTypes.data.data.find(
                          (item) =>
                            Number(item.id) === Number(values.id_type_id),
                        ).name
                      : "Group Number"
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <DOBPicker name="dob" label="Date of Birth" />
              </Grid>
            </>
          )}
        </>

        <Grid item xs={6}>
          <TextfieldWrapper name="first_name" label="First Name" />
        </Grid>
        <Grid item xs={6}>
          <TextfieldWrapper name="surname" label="Last Name" />
        </Grid>
      </Grid>
    </>
  );
};

export default ClientMain;
