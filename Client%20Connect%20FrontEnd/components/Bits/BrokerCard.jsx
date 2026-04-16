import React from "react";
import { Card, Stack } from "@mui/material";
import { rmaAPI } from "src/AxiosParams";
import axios from "axios";
import useToken from "hooks/useToken";
import ContentItem from "components/Containers/ContentItem";
import { useQuery } from "react-query";

const BrokerCard = ({ brokerId }) => {
  const accessToken = useToken();

  const getBroker = useQuery(
    `broker${brokerId}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Broker/Brokerage/${brokerId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken && !!brokerId,
    },
  );

  // console.log(getBroker);

  return (
    <Card sx={{ mb: 2 }}>
      <Stack direction="row">
        <ContentItem title="Broker Name" value={getBroker?.data?.data?.name} />
        <ContentItem
          title="FSP Number"
          value={getBroker?.data?.data?.fspNumber}
        />
      </Stack>
    </Card>
  );
};

export default BrokerCard;
