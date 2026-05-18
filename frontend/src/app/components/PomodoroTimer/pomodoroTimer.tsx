"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import SessionTimePopup from "./sessionTimePopup";
import StartStopButton from "./startStopButton";
import EndSessionPopup from "./endSessionPopup";
import { apiClient } from "@/app/lib/api/client";
import { authService } from "../../lib/auth/authService";
import { useUserStats } from "@/app/lib/userStats/UserStatsContext";
import { useToast } from "@/app/lib/toast/ToastContext";
import { notificationPreferencesService } from "@/app/lib/pushNotifications/notificationPreferencesService";

const getStorageValue = (key: string, defaultValue: number): number => {
  if (typeof window === "undefined") return defaultValue;
  const val = localStorage.getItem(key);
  return val ? Number(val) : defaultValue;
};

export default function PomodoroTimer() {
  const pathname = usePathname();
  const { refreshStats } = useUserStats();
  const { showXpToast, showBadgeToast } = useToast();

  const [focusTime, setFocusTime] = useState(() =>
    getStorageValue("pomodoroFocusTime", 25 * 60),
  );

  const [breakTime, setBreakTime] = useState(() =>
    getStorageValue("pomodoroBreakTime", 5 * 60),
  );

  const [mode, setMode] = useState<"focus" | "break">(() => {
    if (typeof window === "undefined") return "focus";
    return localStorage.getItem("pomodoroMode") === "break" ? "break" : "focus";
  });

  const [timerStatus, setTimerStatus] = useState<"idle" | "running" | "paused">(
    () => {
      if (typeof window === "undefined") return "idle";
      const status = localStorage.getItem("pomodoroStatus");
      return status === "running" || status === "paused"
        ? (status as "running" | "paused")
        : "idle";
    },
  );

  const [pausedTime, setPausedTime] = useState<number | null>(
    () => getStorageValue("pomodoroPausedTime", 0) || null,
  );

  const [endTimestamp, setEndTimestamp] = useState<number | null>(
    () => getStorageValue("pomodoroEndTimestamp", 0) || null,
  );

  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window === "undefined") return 25 * 60;
    const savedStatus = localStorage.getItem("pomodoroStatus");
    const savedPausedTime = localStorage.getItem("pomodoroPausedTime");

    if (savedStatus === "paused" && savedPausedTime) {
      return Number(savedPausedTime);
    }

    const ts = localStorage.getItem("pomodoroEndTimestamp");
    if (ts) {
      return Math.max(0, Math.floor((Number(ts) - Date.now()) / 1000));
    }
    return 25 * 60;
  });

  const intervalRef = useRef<number | null>(null);
  const [popUp, setPopup] = useState<
    "sessionTime" | "confirm" | "ended" | null
  >(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /**
   * Show a local browser notification using Service Worker
   * This is called when Pomodoro session completes
   */
  const showPomodoroNotification = async (isBreakEnd: boolean) => {
    try {
      // Check if user has pomodoro notifications enabled
      const prefs = await notificationPreferencesService.getPreferences();

      if (!prefs.is_enabled_pomodoro) {
        console.log("Pomodoro notifications are disabled");
        return;
      }

      // Request permission if not already granted
      if (Notification.permission === "denied") {
        console.log("Notification permission denied");
        return;
      }

      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      // Get Service Worker registration
      if (!("serviceWorker" in navigator)) {
        console.log("Service Worker not supported");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const title = isBreakEnd ? "Break Complete!" : "Focus Session Complete!";
      const message = isBreakEnd
        ? "Time to get back to work! Ready for another focus session?"
        : "Great work! Time for a well-deserved break.";

      // Show notification via Service Worker
      await registration.showNotification(title, {
        body: message,
        icon: "/icon.png",
        badge: "/badge.png",
        tag: "pomodoro-notification",
        requireInteraction: false,
      });
    } catch (error) {
      console.error("Failed to show Pomodoro notification:", error);
    }
  };

  const completePomodoroSession = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        console.warn("No access token found, skipping XP award");
        return;
      }

      const response = await apiClient.post<{
        success: boolean;
        xp_earned: number;
        level_info: {
          current_level: number;
          current_exp: number;
          exp_to_next_level: number;
          total_exp: number;
          leveled_up: boolean;
        };
        new_badges?: Array<{
          key: string;
          title: string;
          icon: string;
          rarity: string;
        }>;
      }>("/api/auth/pomodoro/complete/", {}, token);

      console.log("Pomodoro XP awarded:", response);

      // Show XP toast
      if (response.xp_earned > 0) {
        showXpToast(response.xp_earned, "Pomodoro Complete!");
      }

      // Show badge toasts
      if (response.new_badges && response.new_badges.length > 0) {
        response.new_badges.forEach((badge, index) => {
          setTimeout(
            () => {
              showBadgeToast({
                icon: badge.icon,
                title: badge.title,
                rarity: badge.rarity,
              });
            },
            (index + 1) * 600,
          );
        });
      }

      // Refresh user stats to show updated XP/level
      await refreshStats();
    } catch (error) {
      console.error("Error completing pomodoro session:", error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pomodoroFocusTime", String(focusTime));
    localStorage.setItem("pomodoroBreakTime", String(breakTime));

    if (endTimestamp !== null) {
      localStorage.setItem("pomodoroEndTimestamp", String(endTimestamp));
    } else {
      localStorage.removeItem("pomodoroEndTimestamp");
    }

    if (pausedTime !== null) {
      localStorage.setItem("pomodoroPausedTime", String(pausedTime));
    } else {
      localStorage.removeItem("pomodoroPausedTime");
    }

    localStorage.setItem("pomodoroMode", mode);
    localStorage.setItem("pomodoroStatus", timerStatus);
  }, [focusTime, breakTime, endTimestamp, mode, timerStatus, pausedTime]);

  useEffect(() => {
    const clear = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    if (timerStatus !== "running") {
      clear();
      return;
    }

    const tick = () => {
      if (!endTimestamp) return;
      const diff = Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000);

    return () => {
      clear();
    };
  }, [timerStatus, endTimestamp]);

  useEffect(() => {
    if (timerStatus !== "running" || timeLeft !== 0) return;

    if (pathname !== "/pomodoro") {
      console.log("Pomodoro timer finished!");
    }

    if (mode === "focus") {
      // Focus session ended, show notification
      showPomodoroNotification(false);
      setMode("break");
      setEndTimestamp(Date.now() + breakTime * 1000);
      setTimeLeft(breakTime);
    } else {
      // Break session ended, show notification
      showPomodoroNotification(true);
      // Call API to award XP for completed focus session
      completePomodoroSession();
      setTimerStatus("idle");
      setPopup("ended");
      setMode("focus");
      setEndTimestamp(null);
      setTimeLeft(focusTime);
    }
  }, [timeLeft, pathname, breakTime, focusTime, mode, timerStatus]);

  useEffect(() => {
    if (timerStatus === "running" || timerStatus === "paused") return;

    setTimeLeft(mode === "focus" ? focusTime : breakTime);
    setEndTimestamp(null);
  }, [focusTime, breakTime, mode, timerStatus]);

  const getStatusMessage = () => {
    if (timerStatus === "idle") return `Break: ${formatTime(breakTime)}`;
    if (timerStatus === "paused") return "Paused";
    if (timerStatus === "running" && mode === "focus") return "Focus Mode";
    return "Break Mode";
  };

  // for changing themes
  const getTimerTheme = () => {
    if (timerStatus === "idle") {
      return {
        border: "border-gray-800 dark:border-[var(--color-border)]",
        bg: "bg-gray-100 dark:bg-[var(--color-primary)] ",
        text: "text-[#677381] dark:text-[var(--color-secondary)] ",
        opacity: "opacity-100",
      };
    }

    const isPaused = timerStatus === "paused";
    const opacity = isPaused ? "opacity-50" : "opacity-100";

    if (mode === "focus") {
      return {
        border: "border-[#821e3f] dark:border-[#4a0f25]",
        bg: "bg-red-50 dark:bg-red-900",
        shadow: "shadow-2xl shadow-[#ffccdc] dark:shadow-none",
        text: "text-[#c94d74] dark:text-red-300",
        opacity,
      };
    } else {
      return {
        border: "border-[#003303] dark:border-[#0b2a17]",
        bg: "bg-green-50 dark:bg-green-900",
        shadow: "shadow-2xl shadow-[#d9faed] dark:shadow-none",
        text: "text-[#0f7049] dark:text-green-300",
        opacity,
      };
    }
  };

  const theme = getTimerTheme();

  const onStart = () => {
    if (timerStatus === "paused" && pausedTime !== null) {
      setTimerStatus("running" as "running");
      setEndTimestamp(Date.now() + pausedTime * 1000);
      setPausedTime(null);
    } else {
      setTimerStatus("running" as "running");
      setEndTimestamp(
        Date.now() + (mode === "focus" ? focusTime : breakTime) * 1000,
      );
    }
  };

  const onStop = () => {
    setTimerStatus("paused" as "paused");
    setPausedTime(timeLeft);
    setEndTimestamp(null);
  };

  const onReset = () => {
    if (timerStatus === "running" || timerStatus === "paused") {
      setPopup("confirm");
    } else {
      setTimerStatus("idle" as "idle");
      setMode("focus");
      setFocusTime(focusTime);
      setBreakTime(breakTime);
      setTimeLeft(focusTime);
      setEndTimestamp(null);
      setPausedTime(null);
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="flex flex-col items-center justify-center space-y-4 w-full">
        <h1 className="text-4xl font-bold mb-[2vh] text-center">
          Pomodoro <br /> Timer
        </h1>

        <p
          className={`text-center mt-[3vh] text-base font-semibold tracking-wider opacity-70 text-shadow-lg ${theme.text} text-xl`}
        >
          {getStatusMessage()}
        </p>

        <div className="w-65 h-65 mt-[2vh] relative flex flex-col items-center justify-center">
          <div
            className={`w-full h-full flex flex-col items-center justify-center rounded-full border-5 transition-all duration-300 ${theme.bg} ${theme.shadow} ${theme.opacity} ${theme.border}`}
          >
            <div
              className="flex justify-center items-center w-full"
              style={{ minHeight: "80px" }}
            >
              <span
                className={`text-6xl font-semibold tracking-[0.1em] ${theme.text}`}
                style={{
                  fontFamily: "geologica",
                  width: "8ch",
                  display: "inline-block",
                  textAlign: "center",
                  letterSpacing: "0.1em",
                  lineHeight: 1.1,
                  userSelect: "none",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          {timerStatus === "paused" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-24 h-24 ${theme.text}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="h-[35%] pb-8 flex flex-col items-center justify-end space-y-4 w-full">
        {timerStatus === "idle" && (
          <button
            className="px-6 py-2 text-base font-semibold text-[#677381] hover:text-black dark:text-[var(--color-secondary)] dark:hover:text-[var(--color-foreground)]"
            onClick={() => setPopup("sessionTime")}
          >
            Set Session Time
          </button>
        )}

        {popUp === "confirm" && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/40 h-[100vh]">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center dark:bg-[var(--color-primary)] dark:text-[var(--color-foreground)] dark:border dark:border-[var(--color-border)]">
              <h2 className="font-semibold mb-4 text-center">
                Do you want to reset the current session?
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setTimerStatus("idle" as "idle");
                    setMode("focus");
                    setFocusTime(focusTime);
                    setBreakTime(breakTime);
                    setTimeLeft(focusTime);
                    setEndTimestamp(null);
                    setPausedTime(null);
                    setPopup(null);
                  }}
                  className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setPopup(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors dark:bg-[var(--color-button-bg)] dark:text-[var(--color-button-text)] dark:hover:bg-[var(--color-button-bg-hover)]"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        <StartStopButton
          timerStatus={timerStatus as "running" | "paused" | "idle"}
          onStart={() => {
            onStart();
          }}
          onStop={() => {
            onStop();
          }}
          onReset={() => {
            onReset();
          }}
        />
      </div>

      {popUp === "sessionTime" && (
        <SessionTimePopup
          onClose={() => setPopup(null)}
          onSetTimes={(newFocus, newBreak) => {
            setFocusTime(Math.round(newFocus * 60));
            setBreakTime(Math.round(newBreak * 60));
            if (timerStatus === "idle") {
              setTimeLeft(
                mode === "focus"
                  ? Math.round(newFocus * 60)
                  : Math.round(newBreak * 60),
              );
            }
          }}
          currentFocus={Math.floor(focusTime / 60)}
          currentBreak={Math.floor(breakTime / 60)}
        />
      )}

      {popUp === "ended" && (
        <EndSessionPopup
          onContinue={() => {
            setPopup(null);
            setMode("focus");
            setTimerStatus("running");
            setEndTimestamp(Date.now() + focusTime * 1000);
            setTimeLeft(focusTime);
            setPausedTime(null);
          }}
          onClose={() => {
            setPopup(null);
            setMode("focus");
            setTimerStatus("idle");
            setTimeLeft(focusTime);
            setEndTimestamp(null);
            setPausedTime(null);
          }}
        />
      )}
    </div>
  );
}
