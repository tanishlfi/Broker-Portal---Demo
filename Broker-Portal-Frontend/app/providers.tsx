"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { UserProvider } from "@/lib/context/UserContext";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { themeDark, themeLight } from "@/lib/theme";

interface ThemeToggleContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggleContext = createContext<ThemeToggleContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
});

export const useThemeToggle = () => useContext(ThemeToggleContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load the persisted theme state from localStorage after mounting
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored !== null) {
      setIsDarkMode(stored === "true");
    }
  }, []);

  // Update global CSS variables dynamically when theme changes
  useEffect(() => {
    // Inject style to temporarily disable transitions
    const css = document.createElement("style");
    css.type = "text/css";
    css.appendChild(
      document.createTextNode(
        `* {
           -webkit-transition: none !important;
           -moz-transition: none !important;
           -o-transition: none !important;
           -ms-transition: none !important;
           transition: none !important;
        }`
      )
    );
    document.head.appendChild(css);

    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty("--background", "#191919");
      root.style.setProperty("--foreground", "#ffffff");
      root.style.setProperty("--card", "#2d2d2d");
      root.style.setProperty("--border", "rgba(29, 51, 68, 0.4)");
      root.style.setProperty("--sidebar", "#0B0D10");
      root.style.setProperty("--sidebar-bg", "#0B0D10");
      root.style.setProperty("--sidebar-border", "#1D2A36");
      root.style.setProperty("--sidebar-foreground", "#C4CDD8");
      
      root.style.setProperty("--card-primary", "rgba(24, 24, 24, 0.8)");
      root.style.setProperty("--card-secondary", "#1E1E1E");
      root.style.setProperty("--table-header-bg", "#262626");
      root.style.setProperty("--input", "#262626");
      
      root.style.setProperty("--text-primary", "#ffffff");
      root.style.setProperty("--text-secondary", "#A0A0A0");
      root.style.setProperty("--text-muted", "#5E6A77");
      
      root.style.setProperty("--date-icon-filter", "invert(1) brightness(2)");
      root.style.setProperty("--color-scheme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.style.setProperty("--background", "#f7f7f7");
      root.style.setProperty("--foreground", "#0a0a0a");
      root.style.setProperty("--card", "#ffffff");
      root.style.setProperty("--border", "#e2e8f0");
      root.style.setProperty("--sidebar", "#ffffff");
      root.style.setProperty("--sidebar-bg", "#ffffff");
      root.style.setProperty("--sidebar-border", "#e2e8f0");
      root.style.setProperty("--sidebar-foreground", "#334155");
      
      root.style.setProperty("--card-primary", "rgba(255, 255, 255, 0.95)");
      root.style.setProperty("--card-secondary", "#ffffff");
      root.style.setProperty("--table-header-bg", "#f1f5f9");
      root.style.setProperty("--input", "#ffffff");
      
      root.style.setProperty("--text-primary", "#0f172a");
      root.style.setProperty("--text-secondary", "#475569");
      root.style.setProperty("--text-muted", "#64748b");
      
      root.style.setProperty("--date-icon-filter", "none");
      root.style.setProperty("--color-scheme", "light");
      root.style.colorScheme = "light";
    }

    // Force a reflow
    const _v = window.getComputedStyle(css).opacity;

    // Remove the style block after a frame
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (document.head.contains(css)) {
          document.head.removeChild(css);
        }
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (document.head.contains(css)) {
        document.head.removeChild(css);
      }
    };
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", String(next));
      return next;
    });
  };

  return (
    <AppRouterCacheProvider>
      <ThemeToggleContext.Provider value={{ isDarkMode, toggleTheme }}>
        <ThemeProvider theme={isDarkMode ? themeDark : themeLight}>
          <CssBaseline />
          <SidebarProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </SidebarProvider>
        </ThemeProvider>
      </ThemeToggleContext.Provider>
    </AppRouterCacheProvider>
  );
}
