"use client";
import { useState } from "react";

export default function SessionTimePopup({
  onClose,
  onSetTimes,
  currentFocus,
  currentBreak,
}: {
  onClose: () => void;
  onSetTimes: (focus: number, breakTime: number) => void;
  currentFocus: number;
  currentBreak: number;
}) {
  const [focusInput, setFocusInput] = useState(currentFocus);
  const [breakInput, setBreakInput] = useState(currentBreak);

  const handleSubmit = () => {
    onSetTimes(focusInput, breakInput);
    onClose();
  };

  return (
    <div className="bg-black/40 fixed inset-0 flex items-center justify-center ">
      <div className="bg-white dark:bg-[var(--color-primary)] dark:text-[var(--color-foreground)] dark:border dark:border-[var(--color-border)] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold">Set Session Time</h2>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col items-start">
            <label className="mb-1 font-medium">Focus Time</label>
            <div className="flex gap-2 items-end">
              <input
                type="number"
                placeholder="ex.10"
                min={1}
                max={60}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 1) val = 0.2;
                  if (val > 60) val = 60;
                  setFocusInput(val);
                }}
                className="border px-3 py-1 rounded w-[90px] dark:bg-[var(--color-input-bg)] dark:text-[var(--color-foreground)] dark:border-[var(--color-input-border)]"
              />
              <span>mins</span>
            </div>
          </div>

          <div className="flex flex-col items-start">
            <label className="mb-1 font-medium">Break Time</label>
            <div className="flex gap-2 items-end">
              <input
                type="number"
                placeholder="ex.5"
                min={1}
                max={60}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 1) val = 0.2;
                  if (val > 60) val = 60;
                  setBreakInput(val);
                }}
                className="border px-3 py-1 rounded w-[90px] dark:bg-[var(--color-input-bg)] dark:text-[var(--color-foreground)] dark:border-[var(--color-input-border)]"
              />
              <span>mins</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-[var(--color-button-text)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-blue-600 dark:text-[var(--color-button-text)]"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}
