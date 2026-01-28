import React from "react";
import { IoLockClosed } from "react-icons/io5";

interface BadgeCardProps {
  icon: string;
  title: string;
  description: string;
  rarity: "BRONZE" | "SILVER" | "GOLD" | "ULTIMATE";
  earned: boolean;
  earnedDate?: string;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  icon,
  title,
  description,
  rarity,
  earned,
  earnedDate,
}) => {
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

  return (
    <div
      className={`
        relative rounded-2xl p-4 transition-all duration-200
        ${
          earned
            ? `bg-white border ${styles.border} shadow-sm hover:shadow-md`
            : "bg-gray-50 border border-gray-100"
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
          ${earned ? "text-gray-900" : "text-gray-400"}
        `}
      >
        {title}
      </h3>

      {/* Description - only show on earned or hover */}
      <p
        className={`
          text-center text-xs mb-2 line-clamp-2
          ${earned ? "text-gray-500" : "text-gray-300"}
        `}
      >
        {description}
      </p>

      {/* Rarity Pill */}
      <div className="flex justify-center">
        <span
          className={`
            px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide
            ${earned ? styles.pill : "bg-gray-100 text-gray-400"}
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
