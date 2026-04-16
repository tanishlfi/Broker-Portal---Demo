import { Button, Box, Container, Stack } from "@mui/material";

import React from "react";
import Logo from "../assets/RMA-Logo_Full.png";
import Image from "next/image";
const Login = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 18,
          marginBottom: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        <Image src={Logo} alt="RMA Logo" width={400} height={200} />

        <Button
          sx={{ mt: 4 }}
          size="large"
          variant="contained"
          href="/api/auth/login">
          Sign in
        </Button>

        <Stack>
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            {/* <Button variant="contained" onClick={() => signIn()}>
            Sign in
          </Button> */}
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
