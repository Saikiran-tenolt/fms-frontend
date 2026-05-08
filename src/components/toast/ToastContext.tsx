import { createContext, useContext, useMemo, ReactNode } from "react";
import { useToast, ToastData } from "./useToast";
import { ToastContainer } from "./ToastContainer";

interface ToastContextType {
  warning: (title: string, subtitle?: string, action?: ToastData["action"]) => number;
  info: (title: string, subtitle?: string, action?: ToastData["action"]) => number;
  success: (title: string, subtitle?: string, action?: ToastData["action"]) => number;
  error: (title: string, subtitle?: string, action?: ToastData["action"]) => number;
  danger: (title: string, subtitle?: string, action?: ToastData["action"]) => number;
  toast: (title: string, subtitle?: string, action?: ToastData["action"]) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, dismiss, warning, info, success, error, danger, toast } = useToast();

  // ✅ Context value only changes when methods change (they won't — all useCallback)
  // toasts is intentionally excluded: ToastContainer needs it, but consumers don't.
  // This means adding/dismissing a toast never re-renders DashboardPage.
  const contextValue = useMemo(
    () => ({ dismiss, warning, info, success, error, danger, toast }),
    [dismiss, warning, info, success, error, danger, toast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToastContext must be used within a ToastProvider");
  return context;
}
