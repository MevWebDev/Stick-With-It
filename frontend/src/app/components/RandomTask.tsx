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
import {
  challengeService,
  type DailyChallenge,
} from "@/app/lib/challenges/challengeService";
import { useUserStats } from "../lib/userStats/UserStatsContext";
import { useAuth } from "../lib/auth/authContext";

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

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return "bg-green-100 text-green-700 border-green-200";
    case 2:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case 3:
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    default:
      return "Unknown";
  }
};

const placeHolderChallenge: DailyChallenge = {
  challenge: {
    id: 0,
    title: "Placeholder Challenge",
    description: "This is a placeholder challenge.",
    category: "Physical",
    difficulty: 1,
    completed: false,
  },
  assigned_date: "today",
  success: true,
};

export default function RandomTask() {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { refreshStats } = useUserStats();
  const { user } = useAuth();

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const data = await challengeService.getDailyChallenge();
        setDailyChallenge(data);

        console.log(data);
      } catch (error) {
        setDailyChallenge(placeHolderChallenge);
        console.error("Failed to fetch daily challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChallenge();
    }
  }, [user]);

  const handleDone = async () => {
    if (!dailyChallenge || dailyChallenge.challenge.completed) return;

    setActionLoading(true);
    try {
      await challengeService.completeChallenge();

      // Update local state to mark as completed
      setDailyChallenge({
        ...dailyChallenge,
        challenge: {
          ...dailyChallenge.challenge,
          completed: true,
        },
      });

      setIsModalOpen(false);
      // Optionally show a success message with points earned
      refreshStats();
    } catch (error) {
      console.error("Failed to complete challenge:", error);
      alert("Failed to complete challenge. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlacklist = async () => {
    if (!dailyChallenge) return;

    setActionLoading(true);
    try {
      await challengeService.toggleBlacklist(dailyChallenge.challenge.category);

      setIsModalOpen(false);
      // Reload to get a new challenge
      setLoading(true);
      const newChallenge = await challengeService.getDailyChallenge();
      setDailyChallenge(newChallenge);
      setLoading(false);
    } catch (error) {
      console.error("Failed to blacklist category:", error);
      alert("Failed to blacklist category. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-5 rounded-3xl border-2 border-gray-100 animate-pulse flex items-center gap-4 bg-white">
        <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!dailyChallenge) return null;

  const { challenge } = dailyChallenge;
  const completed = challenge.completed;
  const colorClasses = getDifficultyColor(challenge.difficulty);

  return (
    <>
      {/* Small Component (Trigger) - Mobile First */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`w-full px-5 py-6 rounded-3xl border-2 cursor-pointer active:scale-95 transition-transform flex items-center gap-4 ${colorClasses} ${
          completed ? "opacity-60" : ""
        }`}
      >
        <div className="text-4xl flex-shrink-0">
          {getCategoryIcon(challenge.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase opacity-60 mb-1 tracking-wide">
            {completed ? "Completed Today!" : "Daily Challenge"}
          </div>
          <div className="font-bold font-geologica text-xl truncate">
            {challenge.title}
          </div>
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
                  <span className="text-xl">
                    {getCategoryIcon(challenge.category)}
                  </span>
                  <span>{challenge.category}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-geologica leading-tight pr-8">
                  {challenge.title}
                </h2>
                <span className="inline-block mt-4 px-4 py-1.5 bg-white/60 rounded-full text-xs font-bold border border-black/5">
                  {getDifficultyLabel(challenge.difficulty)} •{" "}
                  {challenge.difficulty}{" "}
                  {challenge.difficulty === 1 ? "point" : "points"}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8">
                <p className="text-gray-600 text-lg sm:text-xl leading-relaxed font-figtree mb-8">
                  {challenge.description}
                </p>

                {completed ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                    <FaCheck className="text-green-500 text-4xl mx-auto mb-3" />
                    <p className="text-green-700 font-bold text-lg">
                      Challenge Completed!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Come back tomorrow for a new challenge
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Actions - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={handleDone}
                        disabled={actionLoading}
                        className="w-full sm:flex-1 bg-green-500 text-white py-4 px-6 rounded-2xl font-bold active:scale-95 hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaCheck /> {actionLoading ? "Processing..." : "Done"}
                      </button>
                      <button
                        onClick={handleBlacklist}
                        disabled={actionLoading}
                        className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-bold active:scale-95 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaBan />{" "}
                        {actionLoading ? "Processing..." : "Blacklist"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
