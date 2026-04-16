import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Button, Skeleton, Stack } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import axios from "axios";
import ErrorContainer from "components/Bits/ErrorContainer";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const Representative = () => {
  const router = useRouter();

  const { id } = router.query;

  const accessToken = useToken();

  const { data, isLoading, error, isError, isRefetching } = useQuery(
    `broker${id}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Broker/Brokerage/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  return (
    <div>
      <PageHeader
        title="Representatives Users"
        subTitle="Manage Broker Representative"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Representative",
            href: "BrokerManager/Representative",
          },
        ]}
      />

      <ErrorContainer error={error} isError={isError} />

      {isLoading ? (
        <Stack spacing={0.2}>
          {[...Array(20)].map((item, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              animation="wave"
              width={"auto"}
              height={50}
            />
          ))}
        </Stack>
      ) : (
        <>
          {data?.data?.representatives &&
            data?.data?.representatives.length > 0 && (
              <DataGridPremium
                autoHeight
                getRowId={(row) => row.id}
                rows={data?.data?.representatives}
                columns={[
                  {
                    field: "EditPolicy",
                    headerName: "Edit Policy",
                    width: 150,
                    renderCell: (params) => {
                      return (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            router.push(
                              `/BrokerManager/Representative/${id}/policies/${params.row.id}`
                            )
                          }>
                          View
                        </Button>
                      );
                    },
                  },
                  {
                    field: "firstName",
                    headerName: "First Name",
                    width: 150,
                  },
                  {
                    field: "idNumber",
                    headerName: "Id Number",
                    width: 150,
                  },
                  {
                    field: "code",
                    headerName: "Code",
                    width: 150,
                  },
                ]}
              />
            )}
        </>
      )}
    </div>
  );
};

export default Representative;
