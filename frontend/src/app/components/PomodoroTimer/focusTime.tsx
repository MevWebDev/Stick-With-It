"use client";
import { useState } from "react";

export default function FocusTime({
  onClose,
  onSetTime,
  currentTime,
}: {
  onClose: () => void;
  onSetTime: (time: number) => void;
  currentTime: number;
}) {
  const [input, setInput] = useState(currentTime);

  const handleSubmit = () => {
    onSetTime(input);
    onClose();
  };

  return (
    <div className="bg-black/40 fixed inset-0 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">Set Focus Time</h2>
        <div className="h-max flex gap-3 items-end">
          <input
            type="number"
            min={1}
            max={60}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val < 1) val = 1;
              if (val > 60) val = 60;
              setInput(val);
            }}
            className="border px-3 py-1 rounded w-[60%]"
          />
          <p className="leading-none">mins</p>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-blue-600">
            Set
          </button>
        </div>
      </div>
    </div>
  );
}
