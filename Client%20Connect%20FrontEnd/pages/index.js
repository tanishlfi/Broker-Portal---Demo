import React from "react";
import UserCards from "components/Dashboards/UserCards";
import Alert from "@mui/material/Alert";

const Home = () => {
  return (
    <div>
      <Alert severity="info">Welcome to RML Client Connect</Alert>
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
