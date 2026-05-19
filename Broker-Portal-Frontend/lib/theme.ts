"use client";

import { createTheme } from "@mui/material/styles";

export const themeDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#3a9bfb",
      main: "#1CCAFF", // Replicates the exact primary brand color from Client Connect FrontEnd
      contrastText: "#333333",
    },
    secondary: {
      main: "#0FFFB3",
      contrastText: "#333333",
    },
    error: {
      light: "#e57373",
      main: "#f44336",
      dark: "#d32f2f",
      contrastText: "#333333",
    },
    background: {
      paper: "#202020",
      default: "#191919",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#A0A0A0",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#262626",
          color: "#FFFFFF",
          "& fieldset": {
            borderColor: "#333333",
            borderWidth: "1.875px",
          },
          "&:hover fieldset": {
            borderColor: "#4A4A4A",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1CCAFF",
            borderWidth: "1.875px",
          },
        },
        input: {
          padding: "10.5px 14px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "#FFFFFF",
          "&::placeholder": {
            color: "#A0A0A0",
            opacity: 1,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: "10.5px 14px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "#FFFFFF",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #333333",
          color: "#A0A0A0",
          backgroundColor: "transparent",
          textTransform: "none",
          fontWeight: 500,
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          padding: "8px 16px",
          transition: "all 0.2s ease",
          "&.Mui-selected": {
            color: "#0A0A0A",
            backgroundColor: "#1CCAFF",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#0DB5D8",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
  },
});
