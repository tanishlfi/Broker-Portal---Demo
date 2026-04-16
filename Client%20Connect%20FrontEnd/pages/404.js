import { Button, Container, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import { useRouter } from "next/router";
import notfound from "../assets/404.svg";
import notFoundDark from "../assets/ForDark.svg";
import { Box } from "@mui/system";
import Image from "next/image";

const FourOhFour = () => {
  const router = useRouter();

  const theme = useTheme();

  console.log("404 Page");

  return (
    <Container maxWidth="xl" disableGutters>
      <Grid container sx={{ mt: 15, pt: 15 }}>
        <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
          <Box
            sx={{
              p: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}>
            <Image
              src={theme.palette.mode === "light" ? notfound : notFoundDark}
              alt="404"
            />
          </Box>
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
          <Typography sx={{ mt: 10, mb: 5 }} variant="h1" align="left">
            Four Oh Four
          </Typography>
          <Typography sx={{ mb: 5 }} variant="h4" align="left">
            UH OH! You&apos;re lost.
          </Typography>
          <Typography variant="body1" align="left">
            The page you are looking for does not exist. How you got here is a
            mystery. But you can click the button below to go back to the
            homepage.
          </Typography>
          <Button
            sx={{ mt: 5 }}
            variant="contained"
            onClick={() => router.back()}>
            Go Back
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FourOhFour;
