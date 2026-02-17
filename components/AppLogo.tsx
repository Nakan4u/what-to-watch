"use client";

import { Box, SxProps, Theme } from "@mui/material";

interface AppLogoProps {
  size?: number;
  sx?: SxProps<Theme>;
}

/**
 * Logo for "What to watch" — play icon inside a rounded rectangle (evokes watch/list).
 * Renders in currentColor so it inherits text color (e.g. white on AppBar).
 */
export default function AppLogo({ size = 32, sx }: AppLogoProps) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "inherit",
        ...sx,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="2"
          y="6"
          width="36"
          height="28"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M16 12v16l12-8L16 12z"
          fill="currentColor"
        />
      </svg>
    </Box>
  );
}
