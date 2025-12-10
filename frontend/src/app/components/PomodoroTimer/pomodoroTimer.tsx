"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import SessionTimePopup from "./sessionTimePopup";
import StartStopButton from "./startStopButton";
import EndSessionPopup from "./endSessionPopup";
import { apiClient } from "@/app/lib/api/client";
import { useUserStats } from "@/app/lib/userStats/UserStatsContext";

const getStorageValue = (key: string, defaultValue: number): number => {
  if (typeof window === "undefined") return defaultValue;
  const val = localStorage.getItem(key);
  return val ? Number(val) : defaultValue;
};

export default function PomodoroTimer() {
  const pathname = usePathname();
  const { refreshStats } = useUserStats();

  const [focusTime, setFocusTime] = useState(() =>
    getStorageValue("pomodoroFocusTime", 25 * 60)
  );

  const [breakTime, setBreakTime] = useState(() =>
    getStorageValue("pomodoroBreakTime", 5 * 60)
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
    }
  );

  const [pausedTime, setPausedTime] = useState<number | null>(
    () => getStorageValue("pomodoroPausedTime", 0) || null
  );

  const [endTimestamp, setEndTimestamp] = useState<number | null>(
    () => getStorageValue("pomodoroEndTimestamp", 0) || null
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
  const [popUp, setPopup] = useState<"sessionTime" | "ended" | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const completePomodoroSession = async () => {
    try {
      const token = localStorage.getItem("access_token");
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
      }>("/api/auth/pomodoro/complete/", {}, token);

      console.log("Pomodoro XP awarded:", response);

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
      setMode("break");
      setEndTimestamp(Date.now() + breakTime * 1000);
      setTimeLeft(breakTime);
    } else {
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

  return (
    <div className="space-y-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Pomodoro <br /> Timer
      </h1>

      <p className="text-center text-base font-semibold tracking-wider opacity-70 text-shadow-lg">
        {getStatusMessage()}
      </p>

      <div className="w-60 h-60 flex flex-col items-center justify-center rounded-full border-5 border-gray-800 bg-gray-100">
        <h3 className="text-6xl font-semibold tracking-[0.1em] text-[#677381]">
          {formatTime(timeLeft)}
        </h3>
      </div>

      {timerStatus === "idle" && (
        <button
          className="mt-2 px-6 py-2 text-base font-semibold text-[#677381] hover:text-black"
          onClick={() => setPopup("sessionTime")}
        >
          Set Session Time
        </button>
      )}

      <StartStopButton
        timerStatus={timerStatus as "running" | "paused" | "idle"}
        onStart={() => {
          if (timerStatus === "paused" && pausedTime !== null) {
            setTimerStatus("running" as "running");
            setEndTimestamp(Date.now() + pausedTime * 1000);
            setPausedTime(null);
          } else {
            setTimerStatus("running" as "running");
            setEndTimestamp(
              Date.now() + (mode === "focus" ? focusTime : breakTime) * 1000
            );
          }
        }}
        onStop={() => {
          setTimerStatus("paused" as "paused");
          setPausedTime(timeLeft);
          setEndTimestamp(null);
        }}
        onReset={() => {
          setTimerStatus("idle" as "idle");
          setMode("focus");
          setFocusTime(focusTime);
          setBreakTime(breakTime);
          setTimeLeft(focusTime);
          setEndTimestamp(null);
          setPausedTime(null);
        }}
      />

      {popUp === "sessionTime" && (
        <SessionTimePopup
          onClose={() => setPopup(null)}
          onSetTimes={(newFocus, newBreak) => {
            setFocusTime(newFocus * 60);
            setBreakTime(newBreak * 60);
            if (timerStatus === "idle") {
              setTimeLeft(mode === "focus" ? newFocus * 60 : newBreak * 60);
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
