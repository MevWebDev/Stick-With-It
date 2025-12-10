"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastType } from "@/app/lib/toast/ToastContext";

interface ToastProps {
  message: string;
  type: ToastType;
  xpAmount?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  xpAmount,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      },
      type === "xp" ? 4000 : 3000
    );

    return () => clearTimeout(timer);
  }, [onClose, type]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-white";
      case "xp":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "info":
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "xp":
        return "⭐";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`pointer-events-auto relative px-6 py-4 rounded-lg shadow-lg ${getStyles()} min-w-[280px] max-w-md`}
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getIcon()}</span>
            <div className="flex-1">
              <p className="font-semibold">{message}</p>
              {type === "xp" && xpAmount && (
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="text-3xl font-bold mt-1"
                >
                  +{xpAmount} XP
                </motion.p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-white hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
