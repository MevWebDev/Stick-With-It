"use client";

import React, { useEffect, useState } from "react";
import { FaDumbbell, FaBrain, FaHeart, FaHandHoldingHeart } from "react-icons/fa";

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
        description: "Go outside and take a brisk walk to clear your mind and get some fresh air.",
        difficulty: "Easy",
        category: "Physical",
      });
    }, 500);
  });
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Physical":
      return <FaDumbbell className="text-blue-500" />;
    case "Mental":
      return <FaBrain className="text-purple-500" />;
    case "Emotional":
      return <FaHeart className="text-red-500" />;
    case "Social":
      return <FaHandHoldingHeart className="text-green-500" />;
    default:
      return <FaBrain className="text-gray-500" />;
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

  if (loading) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-3xl border-4 border-gray-100 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border-4 border-gray-100 shadow-sm overflow-hidden hover:border-blue-100 transition-colors duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider font-figtree">
            {getCategoryIcon(task.category)}
            <span>{task.category}</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(
              task.difficulty
            )}`}
          >
            {task.difficulty}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2 font-geologica">
          {task.name}
        </h3>
        <p className="text-gray-600 leading-relaxed font-figtree">
          {task.description}
        </p>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-400 uppercase">
          Daily Challenge
        </span>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Mark as Done
        </button>
      </div>
    </div>
  );
}
