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
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div
        className={`w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl transition-transform duration-300 ease-out sm:mx-auto sm:max-w-2xl ${
          isSheetOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId !== null ? "Edit task" : "Add a new task"}
            </h2>
            <button onClick={onClose} className="text-gray-500">
              Close
            </button>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Task
              </label>
              <input
                type="text"
                placeholder="ex. Laundry"
                value={newTaskName}
                onChange={(event) => onNameChange(event.target.value)}
                className="w-full rounded border border-gray-200 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onToggleCalendar}
                  className="w-full rounded border border-gray-200 px-3 py-2 text-left text-sm text-gray-600"
                >
                  {selectedDate
                    ? selectedDate.toLocaleDateString()
                    : "Choose a date"}
                </button>
                {showCalendar && (
                  <div className="rounded border border-gray-200 p-2">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => onDateSelect(date)}
                      inline
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">Time</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Hour
                  </label>
                  <select
                    value={hour}
                    onChange={(event) => onHourChange(event.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2"
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
                  <label className="mb-1 block text-xs text-gray-500">
                    Minute
                  </label>
                  <select
                    value={minute}
                    onChange={(event) => onMinuteChange(event.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2"
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
              <p className="mt-2 text-xs text-gray-400">
                Leave both empty for no deadline. Hour only = today at that
                hour.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button onClick={onClose} className="px-4 py-2 text-gray-600">
              Cancel
            </button>
            <button onClick={onAdd} className="px-4 py-2 text-blue-600">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
