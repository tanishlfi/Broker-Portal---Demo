"use client";

import { UserProvider } from "@/lib/context/UserContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { themeDark } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={themeDark}>
        <CssBaseline />
        <UserProvider>
          {children}
        </UserProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
