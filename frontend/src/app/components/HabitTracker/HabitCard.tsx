"use client";
import React from "react";
import {
  FaTint,
  FaRunning,
  FaBook,
  FaPray,
  FaBed,
  FaWineGlass,
  FaCannabis,
  FaIgloo,
  FaShower,
  FaSmile,
  FaQuestion,
  FaAngellist,
} from "react-icons/fa";
import { Habit } from "../../lib/habits/habitService";

const ICON_MAP: Record<string, React.ReactNode> = {
  "drink-2l": <FaTint />,
  read: <FaBook />,
  exercise: <FaRunning />,
  pray: <FaPray />,
  sleep: <FaBed />,
  "no-alcohol": <FaWineGlass />,
  "no-weed": <FaCannabis />,
  igloo: <FaIgloo />,
  smile: <FaSmile />,
  shower: <FaShower />,
  angelist: <FaAngellist />,
};

export default function HabitCard({
  habit,
  onHabitClick,
}: {
  habit: Habit;
  onHabitClick: (id: number) => void;
}) {
  const isActive = habit.completed_today;
  const icon = ICON_MAP[habit.icon_slug] || (
    <span className="text-3xl">{habit.icon_slug}</span>
  );

  return (
    <div
      onClick={() => onHabitClick(habit.id)}
      className={`
        group relative w-40 h-40 
        p-1 rounded-2xl 
        cursor-pointer 
        transition-all duration-500 ease-in-out
        hover:scale-105 hover:-translate-y-2
        ${isActive ? "bg-transparent" : "bg-foreground dark:bg-secondary-light  group-hover:bg-transparent"}
        
        
      `}
    >
      {/* 1. THE BORDER GRADIENT */}
      <div
        className={`
        absolute inset-0 rounded-2xl 
        bg-linear-to-br from-yellow-400 to-red-500 
        transition-opacity ease-out
        duration-1000 group-hover:duration-200
        ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
      `}
      ></div>

      {/* 2. THE BACKGROUND BLUR (GLOW) */}
      <div
        className={`
        absolute top-0 left-0 w-full h-full 
        bg-linear-to-br from-yellow-400 to-red-500 
        blur-xl -z-10 rounded-2xl
        transition-opacity ease-out
        duration-1000 group-hover:duration-200
        ${isActive ? "opacity-70" : "opacity-0 group-hover:opacity-50"} 
      `}
      ></div>

      <div className="relative w-full h-full bg-background   rounded-xl flex flex-col items-center justify-center z-10">
        <div
          className={`
            rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border mb-2 font-figtree transition-colors duration-300
            ${
              isActive
                ? "bg-orange-50 dark:bg-orange-600 dark:text-orange-200 border-orange-200 dark:border-orange-600 text-orange-600"
                : ""
            }
        `}
        >
          {habit.current_streak}
        </div>

        <div
          className={`text-4xl mb-2 transition-colors duration-300 ${isActive ? "text-orange-500" : "text-foreground"}`}
        >
          {icon}
        </div>

        <div
          className={`text-sm font-bold font-figtree text-center transition-colors duration-300 `}
        >
          {habit.name}
        </div>
      </div>
    </div>
  );
}
