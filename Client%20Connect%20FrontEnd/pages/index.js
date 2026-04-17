import React from "react";
import UserCards from "components/Dashboards/UserCards";
import { useQuery } from "react-query";
import axios from "axios";
import useToken from "hooks/useToken";
import { rmaAPI } from "src/AxiosParams";
import Alert from "@mui/material/Alert";

const Home = () => {
  // Check if RMA is Online
  const accessToken = useToken();

  const checkRMA = useQuery(
    "checkRMA",
    () => {
      return axios(`${rmaAPI}/mdm/api/IdType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      refetchInterval: 50000,
    }
  );

  return (
    <div>
      {checkRMA.isLoading && <Alert severity="warning">Checking RMA...</Alert>}
      {checkRMA.isError && <Alert severity="error">RMA is Offline</Alert>}
      {checkRMA.isSuccess && <Alert severity="info">RMA is Online</Alert>}
      {
        // show env NEXT_PUBLIC_NODE_ENV
        ["test", "uat", "development"].includes(
          process.env.NEXT_PUBLIC_NODE_ENV
        ) && (
          <Alert severity="warning">
            Please note this is not the live environment. Actions will NOT
            impact live policies nor will new policies be created.
          </Alert>
        )
      }
      <UserCards />
    </div>
  );
};

export default Home;
