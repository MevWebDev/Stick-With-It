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
  return (
    <div
      onClick={() => onHabitClick(habit.id)}
      className="bg-white rounded-2xl border-4 border-gray-700 flex flex-col items-center justify-center h-40 w-40 cursor-pointer hover:bg-gray-100"
    >
      <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold border-2 mb-2 font-figtree">
        {habit.streak}
      </div>
      <div className="text-6xl mb-2">{habit.icon}</div>
      <div className="text-sm font-medium font-figtree text-center">
        {habit.name}
      </div>
    </div>
  );
}
