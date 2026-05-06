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

  const add = useCallback((type: ToastData["type"], title: string, subtitle?: string, action?: ToastData["action"]) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, type, title, subtitle, action }]);
    return id;
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    dismiss,
    warning: (title: string, subtitle?: string, action?: ToastData["action"]) => add("warning", title, subtitle, action),
    info:    (title: string, subtitle?: string, action?: ToastData["action"]) => add("info",    title, subtitle, action),
    success: (title: string, subtitle?: string, action?: ToastData["action"]) => add("success", title, subtitle, action),
    error:   (title: string, subtitle?: string, action?: ToastData["action"]) => add("error",   title, subtitle, action),
    danger:  (title: string, subtitle?: string, action?: ToastData["action"]) => add("error",   title, subtitle, action),
    toast:   (title: string, subtitle?: string, action?: ToastData["action"]) => add("info",    title, subtitle, action),
  };
}
