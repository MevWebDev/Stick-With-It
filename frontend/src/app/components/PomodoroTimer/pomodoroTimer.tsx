"use client";
import { useState, useEffect } from "react";
import SessionTime from "./sessionTime";
import BreakTime from "./breakTime";
import StartStopButton from "./startStopButton";
import EndSessionPopup from "./endSessionPopup";

export default function PomodoroTimer() {
  const [sessionTime, setSessionTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);

  const [sessionTimePopup, setSessionTimePopup] = useState(false);
  const [breakTimePopup, setBreakTimePopup] = useState(false);

  const [timeLeft, setTimeLeft] = useState(sessionTime);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"session" | "break">("session");

  const [endSession, setEndSession] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft > 0) return;

    if (mode === "session") {
      setMode("break");
      setTimeLeft(breakTime);
    } else {
      setTimeLeft(sessionTime);
      setIsRunning(false);
      setEndSession(true);
      setMode("session");
    }
  }, [timeLeft, mode, isRunning, breakTime]);

  useEffect(() => {
    if (!isRunning && mode === "session") {
      setTimeLeft(sessionTime);
    }
  }, [sessionTime, isRunning, mode]);

  useEffect(() => {
    if (!isRunning && mode === "break") {
      setTimeLeft(breakTime);
    }
  }, [breakTime, isRunning, mode]);

  return (
    <div className="space-y-3 mt-[5vh] flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-center">
        Pomodoro <br /> Timer
      </h1>

      <div className="w-55 h-55 mt-[10vh] flex flex-col items-center justify-center rounded-full bg-[#EBEDEF] border-5 border-[#5E5E5E]">
        <h3 className="text-5xl font-semibold tracking-[0.1em] text-[#677381]">
          {formatTime(timeLeft)}
        </h3>
      </div>

      <p className="text-lg text-[#677381] m-0">
        Break Time: {Math.floor(breakTime / 60)}:00
      </p>

      {!isRunning && (
        <div className="flex flex-col">
          <button
            className="py-2 font-medium text-[#677381]"
            onClick={() => setBreakTimePopup(true)}
          >
            Break Time
          </button>

          <button
            className="font-medium text-[#677381]"
            onClick={() => setSessionTimePopup(true)}
          >
            Session Time
          </button>
        </div>
      )}

      <StartStopButton
        isRunning={isRunning}
        onStart={() => {
          setMode("session");
          setTimeLeft(sessionTime);
          setIsRunning(true);
        }}
        onStop={() => {
          setMode("session");
          setTimeLeft(sessionTime);
          setIsRunning(false);
        }}
      />

      {sessionTimePopup && (
        <SessionTime
          onClose={() => setSessionTimePopup(false)}
          onSetTime={(newTime) => setSessionTime(newTime * 60)}
          currentTime={Math.floor(sessionTime / 60)}
        />
      )}

      {breakTimePopup && (
        <BreakTime
          onClose={() => setBreakTimePopup(false)}
          onSetTime={(newTime) => setBreakTime(newTime * 60)}
          currentTime={Math.floor(breakTime / 60)}
        />
      )}

      {endSession && (
        <EndSessionPopup
          onClose={() => {
            setEndSession(false);
            setIsRunning(false);
            setMode("session");
          }}
        />
      )}
    </div>
  );
}
