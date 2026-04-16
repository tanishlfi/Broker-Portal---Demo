import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#11455D",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;

export const themeDark = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      light: "#3a9bfb",
      main: "#1CCAFF",
      info: "#333",
      contrastText: "#333",
    },
    secondary: {
      main: "#0FFFB3",
      contrastText: "#333",
    },
    error: {
      light: "#e57373",
      main: "#f44336",
      dark: "#d32f2f",
      contrastText: "#333",
    },
    background: {
      // paper: "#444444da",
      paper: "#202020",
      default: "#191919",
    },
  },
});

export const themeLight = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  palette: {
    mode: "light",
    primary: {
      light: "#3a9bfb",
      main: "#1DC2EA",
      info: "#333",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#14a37f",
      contrastText: "#f4f4f4",
    },
    background: {
      paper: "#f2f2f2",
      default: "#f7f7f7",
    },
  },
});
