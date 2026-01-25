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
  FaAngellist
} from "react-icons/fa";
import { Habit } from "../../lib/habits/habitService";

const ICON_MAP: Record<string, React.ReactNode> = {
  "drink-2l": <FaTint />,
  "read": <FaBook />,
  "exercise": <FaRunning />,
  "pray": <FaPray />,
  "sleep": <FaBed />,
  "no-alcohol": <FaWineGlass />,
  "no-weed": <FaCannabis />,
  "igloo": <FaIgloo />,
  "smile": <FaSmile />,
  "shower": <FaShower />,
  "angelist": <FaAngellist />,
};

export default function HabitCard({
  habit,
  onHabitClick,
}: {
  habit: Habit;
  onHabitClick: (id: number) => void;
}) {
  const isActive = habit.completed_today;
  const icon = ICON_MAP[habit.icon_slug] || <span className="text-3xl">{habit.icon_slug}</span>;

  return (
    <div
      onClick={() => onHabitClick(habit.id)}
      className={`
        group relative w-40 h-40 
        p-[4px] rounded-2xl 
        cursor-pointer 
        transition-all duration-500 ease-in-out
        hover:scale-105 hover:-translate-y-2
        bg-gray-300 dark:bg-gray-700
      `}
    >
      
      {/* 1. THE BORDER GRADIENT */}
      <div className={`
        absolute inset-0 rounded-2xl 
        bg-gradient-to-br from-yellow-400 to-red-500 
        transition-opacity ease-out
        duration-1000 group-hover:duration-200 
        ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
      `}></div>

      {/* 2. THE BACKGROUND BLUR (GLOW) */}
      <div className={`
        absolute top-0 left-0 w-full h-full 
        bg-gradient-to-br from-yellow-400 to-red-500 
        blur-xl -z-10 rounded-2xl
        transition-opacity ease-out
        duration-1000 group-hover:duration-200
        ${isActive ? "opacity-70" : "opacity-0 group-hover:opacity-50"} 
      `}></div>

      <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center z-10">
      
        <div className={`
            rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border mb-2 font-figtree transition-colors duration-300
            ${isActive  
               ? "bg-orange-50 dark:bg-orange-600 dark:text-orange-200 border-orange-200 dark:border-orange-600 text-orange-600" 
               : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500"    
            }
        `}>
          {habit.current_streak}
        </div>
        
        <div className={`text-4xl mb-2 transition-colors duration-300 ${isActive ? "text-orange-500" : "text-slate-800"} ${isActive ? "dark:text-orange-500" : "dark:text-slate-500"}`}>
            {icon}
        </div>
        
        <div className={`text-sm font-bold font-figtree text-center transition-colors duration-300 ${isActive ? "text-slate-900 dark:text-slate-500" : "text-slate-600 dark:text-slate-300"}`}>
          {habit.name}
        </div>
        
      </div>
    </div>
  );
}