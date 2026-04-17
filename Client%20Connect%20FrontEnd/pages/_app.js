import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import { CacheProvider } from "@emotion/react";
import { themeDark, themeLight } from "../src/theme";
import createEmotionCache from "src/createEmotionCache";
import AppNavBar from "components/Navigation/AppNavBar";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useLocalStorage } from "hooks/useLocalStorage";
import { LicenseInfo } from "@mui/x-license-pro";
import "nprogress/nprogress.css";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

import NProgress from "nprogress";
import { Router } from "next/router";
import { LinearProgress } from "@mui/material";
import Footer from "components/Containers/Footer";
import AppNavBar2 from "../components/Navigation/AppNavBar2";

Router.events.on("routeChangeStart", (url) => {
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const [loading, setLoading] = useState(false);

  LicenseInfo.setLicenseKey(`${process.env.NEXT_PUBLIC_MUI_KEY}`);

  Router.events.on("routeChangeStart", (url) => {
    setLoading(true);
    NProgress.start();
  });
  Router.events.on("routeChangeComplete", () => {
    setLoading(false);
    NProgress.done();
  });
  Router.events.on("routeChangeError", () => {
    setLoading(false);
    NProgress.done();
  });

  const queryClient = React.useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  const [themeStorage, setStorage] = useLocalStorage("theme", true);
  const [themeState, setThemeState] = useState(themeStorage);

  useEffect(() => {
    setStorage(themeState);
  }, [themeState, setStorage]);

  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    console.log("Development mode");
  } else {
    console.log("NOT Development mode");
    console.log = () => {};
  }

  return (
    <ThemeProvider theme={themeState ? themeDark : themeLight}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <CacheProvider value={emotionCache}>
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1, width=device-width"
          />
        </Head>

        <Stack>
          <QueryClientProvider client={queryClient.current}>
            <ReactQueryDevtools initialIsOpen={false} />
            <Hydrate state={pageProps.dehydratedState}>
              {loading && (
                <LinearProgress
                  sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    zIndex: 9999,
                  }}
                />
              )}
              <AppNavBar2
                setThemeState={setThemeState}
                themeState={themeState}
              >
                {/* <PrivateRoute protectedRoutes={["/", "/Profile", "/Brokers"]}> */}

                <Component {...pageProps} loading={loading} />

                {/* </PrivateRoute> */}
              </AppNavBar2>
              <Footer />
            </Hydrate>
          </QueryClientProvider>
        </Stack>
      </CacheProvider>
    </ThemeProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
