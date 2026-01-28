"use client";

import {
  FaTasks,
  FaClock,
  FaCalendarAlt,
  FaStickyNote,
  FaHome,
} from "react-icons/fa";
import { FaGlassWaterDroplet } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { usePathname } from "next/navigation";
import CustomToolButton from "./CustomToolButton";

interface ToolsMenuProps {
  onClose: () => void;
}

const tools = [
  { name: "Home", icon: <FaHome />, href: "/" },
  { name: "Habit Tracker", icon: <FaTasks />, href: "/habittracker" },
  { name: "Pomodoro", icon: <FaClock />, href: "/pomodoro" },
  {
    name: "Water Tracker",
    icon: <FaGlassWaterDroplet />,
    href: "/watertracker",
  },
  // Placeholders for future tools
  { name: "Calendar", icon: <FaCalendarAlt />, href: "#" },
  { name: "Notes", icon: <FaStickyNote />, href: "#" },
];

export default function ToolsMenu({ onClose }: ToolsMenuProps) {
  const pathname = usePathname();

  const handleToolClick = (href: string) => {
    if (pathname === href) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="grid grid-cols-3 gap-8 p-8 max-w-md w-full">
        {tools.map((tool) => (
          <CustomToolButton
            key={tool.name}
            name={tool.name}
            icon={tool.icon}
            href={tool.href}
            onClick={() => handleToolClick(tool.href)}
          />
        ))}
      </div>
      <button
        onClick={onClose}
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 p-4 rounded-full bg-white shadow-lg border border-gray-100 hover:bg-gray-50 hover:scale-103 transition-all duration-200 group"
      >
        <IoMdClose className="text-2xl text-gray-600 dark:text-background group-hover:text-gray-900" />
      </button>
    </div>
  );
}
