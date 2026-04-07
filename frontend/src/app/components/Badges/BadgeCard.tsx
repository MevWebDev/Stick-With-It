import React, { useState } from "react";
import { IoLockClosed, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface BadgeCardProps {
  icon: string;
  title: string;
  description: string;
  rarity: "BRONZE" | "SILVER" | "GOLD" | "ULTIMATE";
  earned: boolean;
  earnedDate?: string;
  compact?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  icon,
  title,
  description,
  rarity,
  earned,
  earnedDate,
  compact = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean, subtle accent colors per rarity
  const rarityStyles = {
    BRONZE: {
      accent: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      pill: "bg-amber-100 text-amber-700",
    },
    SILVER: {
      accent: "text-slate-500",
      bg: "bg-slate-50",
      border: "border-slate-200",
      pill: "bg-slate-100 text-slate-600",
    },
    GOLD: {
      accent: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      pill: "bg-yellow-100 text-yellow-700",
    },
    ULTIMATE: {
      accent: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      pill: "bg-purple-100 text-purple-700",
    },
  };

  const styles = rarityStyles[rarity];

  // Compact view - just icon and title
  if (compact) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`
            flex flex-col items-center p-3 rounded-xl transition-all duration-200
            ${
              earned
                ? `bg-white border ${styles.border} shadow-sm hover:shadow-md active:scale-95`
                : "bg-gray-50 border border-gray-100"
            }
          `}
        >
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2
              ${earned ? styles.bg : "bg-gray-100"}
              ${!earned && "grayscale opacity-40"}
            `}
          >
            {icon}
          </div>
          <span
            className={`
              text-xs font-medium text-center line-clamp-2
              ${earned ? "text-gray-700" : "text-gray-400"}
            `}
          >
            {title}
          </span>
          {!earned && <IoLockClosed className="w-3 h-3 text-gray-300 mt-1" />}
        </button>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`
                  relative bg-white rounded-2xl p-6 w-full max-w-[280px] shadow-xl
                  ${earned ? `border-2 ${styles.border}` : "border border-gray-200"}
                `}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full"
                >
                  <IoClose className="w-5 h-5 text-gray-500" />
                </button>

                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center text-5xl mb-4
                      ${earned ? styles.bg : "bg-gray-100"}
                      ${!earned && "grayscale opacity-40"}
                    `}
                  >
                    {icon}
                  </div>

                  <h3
                    className={`text-lg font-bold mb-2 ${earned ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {title}
                  </h3>

                  <p
                    className={`text-sm text-center mb-4 ${earned ? "text-gray-500" : "text-gray-300"}`}
                  >
                    {description}
                  </p>

                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide
                      ${earned ? styles.pill : "bg-gray-100 text-gray-400"}
                    `}
                  >
                    {rarity}
                  </span>

                  {earned && earnedDate && (
                    <p className="text-xs text-gray-400 mt-3">
                      Zdobyto: {new Date(earnedDate).toLocaleDateString()}
                    </p>
                  )}

                  {!earned && (
                    <div className="flex items-center gap-1 mt-3 text-gray-400">
                      <IoLockClosed className="w-4 h-4" />
                      <span className="text-xs">Niezdobyte</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Full view (for modal grid)
  return (
    <div
      className={`
        relative rounded-2xl p-4 transition-all duration-200
        ${
          earned
            ? `bg-background border ${styles.border} shadow-sm hover:shadow-md`
            : "bg-background border border-secondary"
        }
      `}
    >
      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div
          className={`
            w-14 h-14 rounded-full flex items-center justify-center text-3xl
            ${earned ? styles.bg : "bg-gray-100"}
            ${!earned && "grayscale opacity-40"}
          `}
        >
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`
          text-center font-semibold text-sm mb-1 line-clamp-2
          ${earned ? "text-foreground" : "text-gray-500 dark:text-gray-600"}
        `}
      >
        {title}
      </h3>

      {/* Description - only show on earned or hover */}
      <p
        className={`
          text-center text-xs mb-2 line-clamp-2
          ${earned ? "text-gray-500" : "text-gray-400"}
        `}
      >
        {description}
      </p>

      {/* Rarity Pill */}
      <div className="flex justify-center">
        <span
          className={`
            px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide
            ${earned ? styles.pill : "bg-gray-100 text-gray-400 dark:text-gray-600"}
          `}
        >
          {rarity}
        </span>
      </div>

      {/* Earned Date */}
      {earned && earnedDate && (
        <p className="text-center text-[10px] text-gray-400 mt-2">
          {new Date(earnedDate).toLocaleDateString()}
        </p>
      )}

      {/* Lock overlay for unearned */}
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute top-2 right-2">
            <IoLockClosed className="w-4 h-4 text-gray-300" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
