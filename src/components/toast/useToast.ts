import { useState, useCallback } from "react";

let _id = 0;

export interface ToastData {
  id: number;
  type: "warning" | "info" | "success" | "error";
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const add = useCallback((
    type: ToastData["type"],
    title: string,
    subtitle?: string,
    action?: ToastData["action"]
  ) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, type, title, subtitle, action }]);
    return id;
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ✅ Each method is now a stable useCallback, not an inline arrow
  const warning = useCallback(
    (title: string, subtitle?: string, action?: ToastData["action"]) =>
      add("warning", title, subtitle, action), [add]);

  const info = useCallback(
    (title: string, subtitle?: string, action?: ToastData["action"]) =>
      add("info", title, subtitle, action), [add]);

  const success = useCallback(
    (title: string, subtitle?: string, action?: ToastData["action"]) =>
      add("success", title, subtitle, action), [add]);

  const error = useCallback(
    (title: string, subtitle?: string, action?: ToastData["action"]) =>
      add("error", title, subtitle, action), [add]);

  const danger = useCallback(
    (title: string, subtitle?: string, action?: ToastData["action"]) =>
      add("error", title, subtitle, action), [add]);

  const toast = useCallback(
    (title: string, subtitle?: string, action?: ToastData["action"]) =>
      add("info", title, subtitle, action), [add]);

  return { toasts, dismiss, warning, info, success, error, danger, toast };
}