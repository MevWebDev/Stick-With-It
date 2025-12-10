"use client";

import { useAuth } from "../../lib/auth/authContext";
import { authService } from "../../lib/auth/authService";
import { useEffect, useState } from "react";
import { UserStats, Badge } from "../../lib/auth/types";
import { FaFire, FaStar, FaMedal } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

import { AnimatePresence, motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [statsData, badgesData] = await Promise.all([
            authService.getStats(),
            authService.getBadges(),
          ]);
          setStats(statsData);
          setBadges(badgesData);
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Get values with safe defaults
  const level = stats?.level || 1;
  const currentExp = stats?.current_exp || 0;
  const expToNextLevel = stats?.exp_to_next_level || 100;
  const totalExp = stats?.total_exp || 0;
  const longestStreak = stats?.longest_streak || 0;
  const earnedBadgesCount = stats?.earned_badges?.length || 0;

  // Calculate percentage safely
  const expPercentage =
    expToNextLevel > 0 ? Math.min((currentExp / expToNextLevel) * 100, 100) : 0;

  return (
    <div className=" pb-20 relative">
      {/* Header */}

      <div className="px-4 pt-6 pb-8">
        {/* Profile Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4 border-4 border-white">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-geologica mb-1">
            {user.username}
          </h2>
          <p className="text-sm font-bold text-[var(--color-secondary)] tracking-wider mb-3">
            LEVEL {level}
          </p>

          {/* EXP Bar - Animated */}
          <div className="w-full max-w-[280px] space-y-1">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{currentExp} XP</span>
              <span>{expToNextLevel} XP</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${expPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-center text-gray-400 font-medium">
              {expToNextLevel - currentExp} XP to next level
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard
            icon={<FaFire className="text-orange-500" />}
            value={longestStreak}
            label="Longest Streak"
          />
          <StatCard
            icon={<FaStar className="text-yellow-500" />}
            value={totalExp}
            label="Total Exp"
          />
          <StatCard
            icon={<FaMedal className="text-blue-500" />}
            value={earnedBadgesCount}
            label="Badges Earned"
          />
        </div>

        {/* Badges Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 font-geologica">
              Badges
            </h3>
            <button
              onClick={() => setIsBadgesModalOpen(true)}
              className="text-sm text-[var(--color-secondary)] font-medium hover:opacity-80"
            >
              See All
            </button>
          </div>

          {badges && badges.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {badges.map((badge) => (
                <div
                  key={badge.key}
                  className="flex-shrink-0 flex flex-col items-center gap-2 w-20"
                >
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
                    {badge.icon}
                  </div>
                  <span className="text-xs text-center text-gray-600 font-medium truncate w-full">
                    {badge.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
              <p className="text-gray-500 text-sm">No badges earned yet</p>
            </div>
          )}
        </div>

        {/* Achievements / Progress */}
        {/* <div>
          <h3 className="text-lg font-bold text-gray-900 font-geologica mb-4">
            Achievements
          </h3>
          <div className="space-y-4">
            <AchievementCard
              icon={<FaMedal className="text-purple-500" />}
              title="Level 1 Master"
              description="Complete tasks in Level 1"
              current={stats?.level1_completed}
              total={10} // Assuming 10 for now
            />
            <AchievementCard
              icon={<FaMedal className="text-indigo-500" />}
              title="Level 2 Master"
              description="Complete tasks in Level 2"
              current={stats?.level2_completed}
              total={10}
            />
            <AchievementCard
              icon={<FaKey className="text-amber-500" />}
              title="Level 3 Master"
              description="Complete tasks in Level 3"
              current={stats?.level3_completed}
              total={10}
            />
          </div> */}
        {/* </div> */}
      </div>

      {/* Badges Modal */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-50 flex flex-col"
          >
            <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-lg font-bold font-geologica text-gray-900">
                All Badges
              </h2>
              <button
                onClick={() => setIsBadgesModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoMdClose size={24} className="text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.key}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-3xl">
                        {badge.icon}
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-gray-900 block mb-0.5">
                          {badge.title}
                        </span>
                        <span className="text-[10px] text-gray-500 leading-tight block">
                          {badge.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No badges earned yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value?: number;
  label: string;
}) {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="mb-2 text-xl">{icon}</div>
      <span className="text-lg font-bold text-gray-900 leading-none mb-1">
        {value ?? 0}
      </span>
      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
        {label}
      </span>
    </div>
  );
}

function AchievementCard({
  icon,
  title,
  description,
  current = 0,
  total,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  current?: number;
  total: number;
}) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 truncate">{description}</p>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {current}/{total}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-secondary)] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
