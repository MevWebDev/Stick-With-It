"use client";

import Link from "next/link";
import { FaTasks, FaClock, FaTimes, FaCalendarAlt, FaStickyNote, FaHome } from "react-icons/fa";
import CustomToolButton from "./CustomToolButton";

interface ToolsMenuProps {
  onClose: () => void;
}

const tools = [
    {name: "Home", icon: <FaHome />, href: "/"},
  { name: "Habit Tracker", icon: <FaTasks />, href: "/habittracker" },
  { name: "Pomodoro", icon: <FaClock />, href: "/pomodoro" },
  // Placeholders for future tools
  { name: "Calendar", icon: <FaCalendarAlt />, href: "#" },
  { name: "Notes", icon: <FaStickyNote />, href: "#" },
];

export default function ToolsMenu({ onClose }: ToolsMenuProps) {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="grid grid-cols-3 gap-8 p-8 max-w-md w-full">
        {tools.map((tool) => (
          <CustomToolButton
            key={tool.name}
            name={tool.name}
            icon={tool.icon}
            href={tool.href}
          />
        ))}
      </div>

      <div className="absolute bottom-10">
        <button
          onClick={onClose}
          className="p-4 bg-gray-100 hover:cursor-pointer rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          title="Close"
        >
          <FaTimes size={24} />
        </button>
      </div>
    </div>
  );
}
   