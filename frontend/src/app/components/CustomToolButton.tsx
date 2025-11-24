"use client";

import Link from "next/link";
import React from "react";

interface CustomToolButtonProps {
  name: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}

export default function CustomToolButton({
  name,
  icon,
  href,
  onClick,
}: CustomToolButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center gap-3 group"
    >
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-1 border-gray-200 transition-transform group-hover:scale-110 `}
      >
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 font-figtree">
        {name}
      </span>
    </Link>
  );
}
