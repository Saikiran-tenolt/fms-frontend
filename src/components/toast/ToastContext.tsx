import { createContext, useContext, ReactNode } from "react";
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
  const { toasts, dismiss, ...methods } = useToast();

  return (
    <ToastContext.Provider value={{ ...methods, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
