"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: 'var(--font-inter), "Inter", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
