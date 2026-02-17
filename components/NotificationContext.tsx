"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Alert, Snackbar } from "@mui/material";

type Severity = "success" | "error" | "info";

type NotificationState = {
  open: boolean;
  message: string;
  severity: Severity;
};

const NotificationContext = createContext<{
  showNotification: (message: string, severity?: Severity) => void;
} | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = useCallback(
    (message: string, severity: Severity = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleClose = useCallback(
    () => setSnackbar((s) => ({ ...s, open: false })),
    []
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}
