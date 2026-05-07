"use client";
import { useAuth } from "../../lib/auth/authContext";
import { authService } from "../../lib/auth/authService";
import { useEffect, useState } from "react";
import { UserStats, Badge } from "../../lib/auth/types";
import { FaFire, FaStar, FaMedal } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import BadgeCard from "../../components/Badges/BadgeCard";
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
          const statsData = await authService.getStats();
          setStats(statsData);
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        }

        try {
          const badgesData = await authService.getBadges();
          setBadges(badgesData);
        } catch (error) {
          console.error("Failed to fetch badges:", error);
        }

        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user || loading) {
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

  // Filter earned badges
  const earnedBadges = badges?.filter((badge) => badge.earned) || [];

  return (
    <div className="pb-20 relative">
      {/* Header */}

      <div className="px-4 pt-6 pb-8">
        {/* Profile Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-primary dark:text-[var(--color-foreground)] rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4 border-2 border-secondary">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-geologica mb-1 dark:text-foreground">
            {user.username}
          </h2>
          <p className="text-sm font-bold  text-primary-dark dark:text-[var(--color-secondary)] tracking-wider mb-3">
            LEVEL {level}
          </p>

          {/* EXP Bar - Animated */}
          <div className="w-full max-w-[280px] space-y-1">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{currentExp} XP</span>
              <span>{expToNextLevel} XP</span>
            </div>
            <div className="h-3 bg-gray-200  rounded-full overflow-hidden shadow-inner dark:bg-[var(--color-secondary)]  ">
              <motion.div
                className="h-full bg-linear-to-r from-primary to-secondary rounded-full"
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

        {/* Badges Section - Preview of Earned Badges */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 font-geologica dark:text-[var(--color-foreground)]">
              Badges
            </h3>
            <button
              onClick={() => setIsBadgesModalOpen(true)}
              className="text-sm text-foreground font-medium hover:opacity-80"
            >
              See All
            </button>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {earnedBadges.slice(0, 5).map((badge) => (
                <div key={badge.key} className="flex-shrink-0">
                  <BadgeCard
                    icon={badge.icon}
                    title={badge.title}
                    description={badge.description}
                    rarity={badge.rarity}
                    earned={badge.earned}
                    earnedDate={badge.earnedDate}
                    compact
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center border border-secondary dark:bg-[var(--color-primary)] dark:border-[var(--color-border)]">
              <p className="text-gray-500 text-sm dark:text-[var(--color-secondary)]">
                No badges earned yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Badges Modal - All Badges Grid */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background z-50 flex flex-col"
          >
            <div className="px-4 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold font-geologica text-foreground">
                Badges
              </h2>
              <button
                onClick={() => setIsBadgesModalOpen(false)}
                className="p-2 rounded-full transition-colors"
              >
                <IoMdClose size={28} />
              </button>
            </div>

            {/* Stats Bar in Modal */}
            <div className="px-4 py-3 bg-back border-y  border-secondary flex justify-around text-center">
              <div>
                <p className="text-xs  uppercase font-bold">Total</p>
                <p className="text-lg font-bold">{badges?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs  uppercase font-bold">Earned</p>
                <p className="text-lg font-bold ">{earnedBadgesCount}</p>
              </div>
              <div>
                <p className="text-xs  uppercase font-bold">Locked</p>
                <p className="text-lg font-bold ">
                  {(badges?.length || 0) - earnedBadgesCount}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                    <BadgeCard
                      key={badge.key}
                      icon={badge.icon}
                      title={badge.title}
                      description={badge.description}
                      rarity={badge.rarity}
                      earned={badge.earned}
                      earnedDate={badge.earnedDate}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-[var(--color-secondary)]">
                  <FaMedal className="text-6xl text-gray-300 mb-4 dark:text-[var(--color-secondary)]" />
                  <p className="text-lg font-medium">No badges available</p>
                  <p className="text-sm text-gray-400 dark:text-[var(--color-secondary)]">
                    Check back later for new badges!
                  </p>
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
  className,
}: {
  icon: React.ReactNode;
  value?: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white p-3 rounded-2xl shadow-sm border border-secondary flex flex-col items-center text-center dark:bg-[var(--color-primary)] dark:border-[var(--color-border)] ${className}`}
    >
      <div className="mb-2 text-xl">{icon}</div>
      <span className="text-lg font-bold text-foreground leading-none mb-1">
        {value ?? 0}
      </span>
      <span className="text-[10px]  text-foreground uppercase font-bold tracking-wide ">
        {label}
      </span>
    </div>
  );
}
