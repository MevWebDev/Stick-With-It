import React from "react";
import DatePicker from "react-datepicker";

type Props = {
  isOpen: boolean;
  isSheetOpen: boolean;
  editingId: number | null;
  newTaskName: string;
  selectedDate: Date | null;
  showCalendar: boolean;
  hour: string;
  minute: string;
  onClose: () => void;
  onAdd: () => void;
  onNameChange: (value: string) => void;
  onToggleCalendar: () => void;
  onDateSelect: (date: Date | null) => void;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
};

export default function ToDoSheet({
  isOpen,
  isSheetOpen,
  editingId,
  newTaskName,
  selectedDate,
  showCalendar,
  hour,
  minute,
  onClose,
  onAdd,
  onNameChange,
  onToggleCalendar,
  onDateSelect,
  onHourChange,
  onMinuteChange,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className={`w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 text-gray-900 shadow-xl transition-transform duration-300 ease-out dark:bg-gray-900 dark:text-gray-100 sm:mx-auto sm:max-w-2xl ${
          isSheetOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editingId !== null ? "Edit task" : "Add a new task"}
            </h2>
            <button onClick={onClose}>Close</button>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Task</label>
              <input
                type="text"
                placeholder="ex. Laundry"
                value={newTaskName}
                onChange={(event) => onNameChange(event.target.value)}
                className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Date</label>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onToggleCalendar}
                  className="w-full rounded border px-3 py-2 text-left text-sm dark:bg-gray-800 dark:text-white"
                >
                  {selectedDate
                    ? selectedDate.toLocaleDateString()
                    : "Choose a date"}
                </button>
                {showCalendar && (
                  <div className="rounded border p-2 dark:bg-gray-800 dark:text-white">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => onDateSelect(date)}
                      calendarClassName="dark:bg-gray-800 dark:text-white"
                      inline
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Time</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs">Hour</label>
                  <select
                    value={hour}
                    onChange={(event) => onHourChange(event.target.value)}
                    className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 24 }, (_, index) => {
                      const value = index.toString().padStart(2, "0");
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs">Minute</label>
                  <select
                    value={minute}
                    onChange={(event) => onMinuteChange(event.target.value)}
                    className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 12 }, (_, index) => {
                      const value = (index * 5).toString().padStart(2, "0");
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-xs">
                Leave both empty for no deadline. Hour only = today at that
                hour.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <button onClick={onClose} className="px-4 py-2">
              Cancel
            </button>
            <button onClick={onAdd} className="px-4 py-2">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
