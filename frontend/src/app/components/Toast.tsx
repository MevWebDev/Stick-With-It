"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastType, BadgeInfo } from "@/app/lib/toast/ToastContext";
import { IoClose } from "react-icons/io5";
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";

interface ToastProps {
  message: string;
  type: ToastType;
  xpAmount?: number;
  badge?: BadgeInfo;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  xpAmount,
  badge,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      },
      type === "badge" ? 5000 : type === "xp" ? 4000 : 3000,
    );

    return () => clearTimeout(timer);
  }, [onClose, type]);

  const getRarityAccent = (rarity: string) => {
    switch (rarity) {
      case "BRONZE":
        return "border-amber-400 bg-amber-50";
      case "SILVER":
        return "border-slate-400 bg-slate-50";
      case "GOLD":
        return "border-yellow-400 bg-yellow-50";
      case "ULTIMATE":
        return "border-purple-400 bg-purple-50";
      default:
        return "border-amber-400 bg-amber-50";
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case "BRONZE":
        return "text-amber-600";
      case "SILVER":
        return "text-slate-600";
      case "GOLD":
        return "text-yellow-600";
      case "ULTIMATE":
        return "text-purple-600";
      default:
        return "text-amber-600";
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-white border-l-4 border-green-500";
      case "error":
        return "bg-white border-l-4 border-red-500";
      case "warning":
        return "bg-white border-l-4 border-yellow-500";
      case "xp":
        return "bg-white border-l-4 border-purple-500";
      case "badge":
        return `bg-white border-l-4 ${badge ? getRarityAccent(badge.rarity).split(" ")[0] : "border-amber-400"}`;
      case "info":
      default:
        return "bg-white border-l-4 border-blue-500";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case "error":
        return <FiX className="w-5 h-5 text-red-500" />;
      case "warning":
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "xp":
        return <span className="text-xl">⭐</span>;
      case "badge":
        return <span className="text-2xl">{badge?.icon || "🏆"}</span>;
      case "info":
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
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
          className={`pointer-events-auto relative px-4 py-3 rounded-lg shadow-lg ${getStyles()} min-w-[260px] max-w-sm`}
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              {type === "xp" && xpAmount && (
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="text-2xl font-bold text-purple-600 mt-1"
                >
                  +{xpAmount} XP
                </motion.p>
              )}
              {type === "badge" && badge && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="mt-1"
                >
                  <p
                    className={`text-base font-semibold ${getRarityText(badge.rarity)}`}
                  >
                    {badge.title}
                  </p>
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${getRarityText(badge.rarity)} opacity-70`}
                  >
                    {badge.rarity}
                  </span>
                </motion.div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <IoClose className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
