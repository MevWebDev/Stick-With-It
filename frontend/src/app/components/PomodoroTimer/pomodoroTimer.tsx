"use client";
import { useState, useEffect, useRef } from "react";
import FocusTime from "./focusTime";
import BreakTime from "./breakTime";
import StartStopButton from "./startStopButton";
import EndSessionPopup from "./endSessionPopup";

export default function PomodoroTimer() {
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(focusTime);
  const intervalRef = useRef<number | null>(null);

  const [popUp, setPopup] = useState<
    "focusTime" | "breakTime" | "ended" | null
  >(null);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timerStatus, setTimerStatus] = useState<"idle" | "running" | "paused">(
    "idle"
  );

  //function to format running time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (timerStatus !== "running") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStatus]);

  useEffect(() => {
    if (timerStatus !== "running" || timeLeft !== 0) return;

    if (mode === "focus") {
      setMode("break");
      setTimeLeft(breakTime);
    } else {
      setTimerStatus("idle");
      setPopup("ended");
      setMode("focus");
      setTimeLeft(focusTime);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timerStatus === "running") return;

    setTimeLeft(mode === "focus" ? focusTime : breakTime);
  }, [focusTime, breakTime, mode]);

  // function to display current mode
  const getStatusMessage = () => {
    if (timerStatus === "idle") return "‎"; //empty sign
    if (timerStatus === "paused") return "Paused";

    if (timerStatus === "running" && mode === "focus") return "Focus Mode";

    if (timerStatus === "running" && mode === "break") return "Break Mode";

    return "";
  };

  return (
    <div className="space-y-3 flex flex-col items-center">
      <h1 className="text-4xl font-bold rounded-md mb-10 text-center">
        Pomodoro <br /> Timer
      </h1>

      <p className="text-center text-xl">{getStatusMessage()}</p>

      <div className="w-55 h-55 mt-[2vh] flex flex-col items-center justify-center rounded-full bg-[#EBEDEF] border-5 border-[#5E5E5E]">
        <h3 className="text-5xl font-semibold tracking-[0.1em] text-[#677381]">
          {formatTime(timeLeft)}
        </h3>
      </div>

      {timerStatus === "idle" && (
        <div className="flex flex-col mt-[2vh]">
          <p className="text-lg text-[#5E5E5E] m-0">
            Break Time: {Math.floor(breakTime / 60)}:00
          </p>
          <button
            className="text-xl py-2 font-medium text-[#677381] hover:text-black"
            onClick={() => setPopup("breakTime")}
          >
            Break Time
          </button>

          <button
            className="text-xl font-medium text-[#677381] hover:text-black"
            onClick={() => setPopup("focusTime")}
          >
            Focus Time
          </button>
        </div>
      )}

      <StartStopButton
        timerStatus={timerStatus}
        onStart={() => setTimerStatus("running")}
        onStop={() => setTimerStatus("paused")}
        onReset={() => {
          setTimerStatus("idle");
          setMode("focus");
          setFocusTime(focusTime);
          setBreakTime(breakTime);
          setTimeLeft(focusTime);
        }}
      />

      {popUp === "focusTime" && (
        <FocusTime
          onClose={() => setPopup(null)}
          onSetTime={(newTime) => setFocusTime(newTime * 60)}
          currentTime={Math.floor(focusTime / 60)}
        />
      )}

      {popUp === "breakTime" && (
        <BreakTime
          onClose={() => setPopup(null)}
          onSetTime={(newTime) => setBreakTime(newTime * 60)}
          currentTime={Math.floor(breakTime / 60)}
        />
      )}

      {popUp === "ended" && (
        <EndSessionPopup
          onContinue={() => {
            setPopup(null);
            setTimerStatus("running");
            setMode("focus");
          }}
          onClose={() => {
            setPopup(null);
            setTimerStatus("idle");
            setMode("focus");
          }}
        />
      )}
    </div>
  );
}
