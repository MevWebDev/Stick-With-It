"use client";

import React, { useEffect, useState } from "react";
import {
  FaDumbbell,
  FaBrain,
  FaHeart,
  FaHandHoldingHeart,
  FaCheck,
  FaBan,
  FaTimes,
} from "react-icons/fa";

// Define the Task interface
interface Task {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  category: string;
}

// Mock function to simulate API call
const fetchRandomTask = async (): Promise<Task> => {
  // In the future, this will be a real API call
  // const response = await fetch('/api/tasks/random');
  // return response.json();

  // Simulating network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: "Take a 15-minute Walk",
        description:
          "Go outside and take a brisk walk to clear your mind and get some fresh air.",
        difficulty: "Hard",
        category: "Physical",
      });
    }, 500);
  });
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Physical":
      return <FaDumbbell />;
    case "Mental":
      return <FaBrain />;
    case "Emotional":
      return <FaHeart />;
    case "Social":
      return <FaHandHoldingHeart />;
    default:
      return <FaBrain />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-700 border-green-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Hard":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function RandomTask() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const data = await fetchRandomTask();
        setTask(data);
      } catch (error) {
        console.error("Failed to fetch random task:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, []);

  const handleDone = () => {
    console.log("Task marked as done");
    setIsModalOpen(false);
    // TODO: Call API to mark task as done
  };

  const handleBlacklist = () => {
    console.log("Task blacklisted");
    setIsModalOpen(false);
    // TODO: Call API to blacklist task
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-5 rounded-3xl border-2 border-gray-100 animate-pulse flex items-center gap-4 bg-white">
        <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!task) return null;

  const colorClasses = getDifficultyColor(task.difficulty);

  return (
    <>
      {/* Small Component (Trigger) - Mobile First */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`w-full px-5 py-6 rounded-3xl border-2 cursor-pointer active:scale-95 transition-transform flex items-center gap-4 ${colorClasses}`}
      >
        <div className="text-4xl flex-shrink-0">{getCategoryIcon(task.category)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase opacity-60 mb-1 tracking-wide">
            Daily Challenge
          </div>
          <div className="font-bold font-geologica text-xl truncate">{task.name}</div>
        </div>
      </div>

      {/* Modal - Mobile First Full Screen */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-3 text-gray-500 hover:text-gray-700 active:scale-90 transition-all z-10 bg-white/80 rounded-full"
            >
              <FaTimes size={22} />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
              {/* Header with Color */}
              <div className={`p-6 sm:p-8 ${colorClasses}`}>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3 opacity-80">
                  <span className="text-xl">{getCategoryIcon(task.category)}</span>
                  <span>{task.category}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-geologica leading-tight pr-8">
                  {task.name}
                </h2>
                <span className="inline-block mt-4 px-4 py-1.5 bg-white/60 rounded-full text-xs font-bold border border-black/5">
                  {task.difficulty}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8">
                <p className="text-gray-600 text-lg sm:text-xl leading-relaxed font-figtree mb-8">
                  {task.description}
                </p>

                {/* Actions - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleDone}
                    className="w-full sm:flex-1 bg-green-500 text-white py-4 px-6 rounded-2xl font-bold active:scale-95 hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 text-lg"
                  >
                    <FaCheck /> Done
                  </button>
                  <button
                    onClick={handleBlacklist}
                    className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-bold active:scale-95 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <FaBan /> Blacklist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
