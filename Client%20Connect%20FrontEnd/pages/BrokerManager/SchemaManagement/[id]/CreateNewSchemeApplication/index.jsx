import React from "react";
// import { useQuery } from "react-query";
import PageHeader from "components/Bits/PageHeader";
import { useParams } from "next/navigation";
import { Stack } from "@mui/material";
import useToken from "hooks/useToken";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useQuery } from "react-query";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import StartNewScheme from "components/NewGroupScheme/StartNewScheme";
import { useRouter } from "next/router";

const NewSchemeApplication = () => {
  const { id } = useParams();

  const accessToken = useToken();
  const router = useRouter();

  const getBrokerCreatedScheme = useQuery(
    "brokerCreatedScheme",
    () =>
      axios.get(`${nodeSa}/brokerscheme/scheme/${id}/broker`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: accessToken ? true : false,
    },
  );

  const columns = [
    { field: "DisplayName", headerName: "Display Name", flex: 1 },
    { field: "RepresentativeId", headerName: "Representative", flex: 1 },
    { field: "CompanyTypeId", headerName: "Company Type", flex: 1 },
    { field: "IdNumber", headerName: "Reistration Number", flex: 1 },
    { field: "CellNumber", headerName: "Mobile Number", flex: 1 },
    { field: "TellNumber", headerName: "Contact Number", flex: 1 },
    { field: "EmailAddress", headerName: "Email Address", flex: 1 },
    {
      field: "VatRegistrationNumber",
      headerName: "Vat Registration Number",
      flex: 1,
    },
    { field: "JoinDate", headerName: "Join Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  const onRowClick = (row) => {
    router.push(
      `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${row.id}/?currentStep=0`,
    );
  };

  return (
    <div>
      <PageHeader
        title="Scheme Application"
        subTitle="Create a New Broker Scheme"
      />

      {/* <ViewBrokerage id={id} /> */}
      <Stack sx={{ mb: 3 }} direction="row" justifyContent="flex-end">
        <StartNewScheme id={id} />
      </Stack>

      {getBrokerCreatedScheme.isLoading && <div>Loading...</div>}

      {getBrokerCreatedScheme?.data?.data?.data &&
        getBrokerCreatedScheme?.data?.data?.data?.length > 0 && (
          <>
            <DataGridPremium
              onRowClick={onRowClick}
              autoHeight={true}
              columns={columns}
              rows={getBrokerCreatedScheme?.data?.data?.data}
            />
          </>
        )}

      {/* {select && <BrokerDetails select={select} />} */}
    </div>
  );
};

export default NewSchemeApplication;

const ViewBrokerage = ({ id }) => {
  const accessToken = useToken();

  const GetBrokerageByUserEmail = (accessToken) => {
    return axios.get(`${rmaAPI}/clc/api/Broker/Brokerage/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const { data } = useQuery(
    ["brokerage", accessToken],
    () => GetBrokerageByUserEmail(accessToken),
    {
      enabled: !!accessToken,
    },
  );

  // return (
  // <List
  //   dense
  //   sx={{
  //     width: "100%",
  //   }}
  //   subheader={
  //     <ListSubheader color="inherit" variant="outlined" component={Paper}>
  //       Broker Details
  //     </ListSubheader>
  //   }
  // >
  //   <Stack direction="row">
  //     <ContentItem title="Name" value={data?.data?.name} />
  //     <ContentItem title="FSP Number" value={data?.data?.fspNumber} />
  //   </Stack>

  //   <Stack direction="row">
  //     <ContentItem title="Registration Number" value={data?.data?.regNo} />
  //     <ContentItem title="Legal Capacity" value={data?.data?.legalCapacity} />
  //   </Stack>
  //   <Stack direction="row">
  //     <ContentItem title="Company Type" value={data?.data?.companyType} />
  //     <ContentItem title="Status" value={data?.data?.status} />
  //   </Stack>
  //   <Stack direction="row">
  //     <ContentItem title="faxNo" value={data?.data?.faxNo} />
  //     <ContentItem title="telNo" value={data?.data?.telNo} />
  //   </Stack>
  //   <Stack direction="row">
  //     <ContentItem title="fspWebsite" value={data?.data?.fspWebsite} />
  //     <ContentItem title="finYearEnd" value={data?.data?.finYearEnd} />
  //   </Stack>

  //   <ContentItem
  //     title="medicalAccreditationNo"
  //     value={data?.data?.medicalAccreditationNo}
  //   />
  // </List>
  // );
};
