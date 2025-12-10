"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../../components/Toast";

export type ToastType = "success" | "error" | "info" | "warning" | "xp";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  xpAmount?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    xpAmount?: number
  ) => void;
  showXpToast: (xpAmount: number, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration: number = 3000,
      xpAmount?: number
    ) => {
      const id = Math.random().toString(36).substring(2, 11);
      const newToast: ToastMessage = { id, message, type, duration, xpAmount };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showXpToast = useCallback(
    (xpAmount: number, message: string = "XP Earned!") => {
      showToast(message, "xp", 4000, xpAmount);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showXpToast }}>
      {children}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            xpAmount={toast.xpAmount}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
