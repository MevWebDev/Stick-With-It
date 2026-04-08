"use client";
import Journal from "@/app/components/Journal/Journal";

export default function JournalRoute() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 h-full md:h-[calc(100vh-100px)] flex flex-col">
      <Journal />
    </div>
  );
}
