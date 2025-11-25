"use client";
import React from "react";

export type Habit = {
  id: number;
  name: string;
  streak: number;
  icon?: React.ReactNode;
};
export default function HabitCard({
  habit,
  onHabitClick,
}: {
  habit: Habit;
  onHabitClick: (id: number) => void;
}) {
 //logika czy clicked tutaj potem dodac na podstawie bazy
  const isActive = (habit.id === 2) ? true : false ; 

  return (
    <div
      onClick={() => onHabitClick(habit.id)}
      className={`
        group relative w-40 h-40 
        p-[4px] rounded-2xl 
        cursor-pointer 
        transition-all duration-500 ease-in-out
        hover:scale-105 hover:-translate-y-2
        
        ${isActive ? "bg-gradient-to-br from-yellow-400 to-red-500" : "bg-gray-300"}
      `}
    >
      
      <div className={`
        absolute top-0 left-0 w-full h-full 
        bg-gradient-to-br from-yellow-400 to-red-500 
        blur-xl -z-10 rounded-2xl
        transition-opacity duration-500
        ${isActive ? "opacity-70" : "opacity-0"} 
      `}></div>

      <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center z-10">
      
        <div className={`
            rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border mb-2 font-figtree transition-colors duration-300
            ${isActive 
               ? "bg-orange-50 border-orange-200 text-orange-600" 
               : "bg-gray-100 border-gray-200 text-gray-500"    
            }
        `}>
          {habit.streak}
        </div>
        
        <div className={`text-4xl mb-2 transition-colors duration-300 ${isActive ? "text-orange-500" : "text-slate-800"}`}>
            {habit.icon}
        </div>
        
        <div className={`text-sm font-bold font-figtree text-center transition-colors duration-300 ${isActive ? "text-slate-900" : "text-slate-600"}`}>
          {habit.name}
        </div>
        
      </div>
    </div>
  );
}