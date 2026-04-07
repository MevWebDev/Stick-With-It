"use client";
import React from "react";
import { TODO_TYPE, todoService } from "./ToDoService";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { setHours, setMinutes } from "date-fns";

export default function ToDoList() {
  const [todos, setTodos] = useState<TODO_TYPE[]>([]);
  const [popUp, setPopUp] = useState<"addNew" | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<"title" | "created" | "deadline">(
    "created",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 4; // Adjusted to show a new page after more than 4 tasks

  useEffect(() => {
    todoService.getTodos().then(setTodos);
  }, []);

  useEffect(() => {
    if (popUp === "addNew") {
      setIsSheetOpen(true);
    }
  }, [popUp]);

  const buildDeadline = (
    dateValue: Date | null,
    hourValue: string,
    minuteValue: string,
  ) => {
    const hasHour = hourValue.trim() !== "";
    const hasMinute = minuteValue.trim() !== "";
    const hasTime = hasHour || hasMinute;
    const parsedHour =
      hourValue.trim() !== "" ? Number.parseInt(hourValue, 10) : 0;
    const parsedMinute =
      minuteValue.trim() !== "" ? Number.parseInt(minuteValue, 10) : 0;

    const dateFromPicker = dateValue ? new Date(dateValue) : null;

    if (!hasTime && !dateFromPicker) {
      return null;
    }

    if (!dateFromPicker && hasHour && !Number.isNaN(parsedHour)) {
      const now = new Date();
      const timeAdjusted = setMinutes(
        setHours(now, parsedHour),
        Number.isNaN(parsedMinute) ? 0 : parsedMinute,
      );
      return timeAdjusted.toISOString();
    }

    if (dateFromPicker) {
      const deadline = new Date(dateFromPicker);
      if (Number.isNaN(deadline.getTime())) {
        return null;
      }
      const adjusted = setMinutes(
        setHours(
          deadline,
          hasHour && !Number.isNaN(parsedHour) ? parsedHour : 0,
        ),
        hasMinute && !Number.isNaN(parsedMinute) ? parsedMinute : 0,
      );
      return adjusted.toISOString();
    }

    return null;
  };

  const resetForm = () => {
    setNewTaskName("");
    setSelectedDate(null);
    setShowCalendar(false);
    setHour("");
    setMinute("");
    setEditingId(null);
  };

  const closePopup = () => {
    setIsSheetOpen(false);
    window.setTimeout(() => {
      setPopUp(null);
      resetForm();
    }, 300);
  };

  const addTodo = async () => {
    const trimmedName = newTaskName.trim();
    if (!trimmedName) {
      closePopup();
      return;
    }

    if (editingId !== null) {
      const existing = todos.find((todo) => todo.id === editingId);
      if (existing) {
        const updatedTodo: TODO_TYPE = {
          ...existing,
          name: trimmedName,
          deadline: buildDeadline(selectedDate, hour, minute),
        };
        const updated = await todoService.updateTodo(updatedTodo);
        setTodos(updated);
      }
    } else {
      const todo: TODO_TYPE = {
        id: Date.now(),
        name: trimmedName,
        completed: false,
        deadline: buildDeadline(selectedDate, hour, minute),
      };

      const added = await todoService.addTodo(todo);
      setTodos((prev) => [...prev, added]);
    }
    closePopup();
  };

  const toggleTodo = async (id: number) => {
    const updated = await todoService.toggleTodo(id);
    setTodos(updated);
  };

  const deleteTodo = async (id: number) => {
    const updated = await todoService.deleteTodo(id);
    setTodos(updated);
  };

  const startEdit = (todo: TODO_TYPE) => {
    setEditingId(todo.id);
    setNewTaskName(todo.name);
    setSelectedDate(todo.deadline ? new Date(todo.deadline) : null);
    if (todo.deadline) {
      const dateValue = new Date(todo.deadline);
      setHour(dateValue.getHours().toString().padStart(2, "0"));
      setMinute(dateValue.getMinutes().toString().padStart(2, "0"));
    } else {
      setHour("");
      setMinute("");
    }
    setShowCalendar(false);
    setPopUp("addNew");
  };

  const sortedTodos = [...todos].sort((left, right) => {
    if (sortKey === "title") {
      const comparison = left.name.localeCompare(right.name);
      return sortDirection === "asc" ? comparison : -comparison;
    }
    if (sortKey === "deadline") {
      const leftHasDeadline = Boolean(left.deadline);
      const rightHasDeadline = Boolean(right.deadline);
      if (!leftHasDeadline && !rightHasDeadline) {
        return 0;
      }
      if (!leftHasDeadline) {
        return 1;
      }
      if (!rightHasDeadline) {
        return -1;
      }
      const leftTime = new Date(left.deadline as string).getTime();
      const rightTime = new Date(right.deadline as string).getTime();
      const comparison = leftTime - rightTime;
      return sortDirection === "asc" ? comparison : -comparison;
    }
    const comparison = left.id - right.id;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedTodos.length / pageSize);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedTodos = sortedTodos.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) {
      return "No deadline";
    }
    const dateValue = new Date(deadline);
    if (Number.isNaN(dateValue.getTime())) {
      return "No deadline";
    }
    return dateValue.toLocaleString();
  };

  return (
    <div className="space-y-4 pb-24">
      <button
        onClick={() => {
          setPopUp("addNew");
        }}
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-2xl text-white shadow-lg"
        aria-label="Add todo"
      >
        +
      </button>

      <div className="mx-auto w-[90%] max-w-3xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by</span>
            <select
              value={sortKey}
              onChange={(event) => {
                setSortKey(
                  event.target.value as "title" | "created" | "deadline",
                );
                setCurrentPage(1);
              }}
              className="rounded border border-gray-200 px-2 py-1 text-sm"
            >
              <option value="title">Title</option>
              <option value="created">Created</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Order</span>
            <select
              value={sortDirection}
              onChange={(event) => {
                setSortDirection(event.target.value as "asc" | "desc");
                setCurrentPage(1);
              }}
              className="rounded border border-gray-200 px-2 py-1 text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <div
          className={
            paginatedTodos.length > 3
              ? "space-y-2 max-h-[60vh] overflow-y-auto"
              : "space-y-2"
          }
        >
          {paginatedTodos.map((todo) => (
            <div
              key={todo.id}
              className="rounded border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-4 w-4 accent-blue-500"
                  />
                  <span
                    className={
                      todo.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-800"
                    }
                  >
                    {todo.name}
                  </span>
                </label>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span className="text-gray-500">
                  {formatDeadline(todo.deadline)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(todo)}
                    className="text-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-2 text-sm text-gray-500">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="rounded border border-gray-200 px-2 py-1"
              disabled={safePage === 1}
            >
              &lt;
            </button>
            <span>
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="rounded border border-gray-200 px-2 py-1"
              disabled={safePage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {popUp === "addNew" && (
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
                <button onClick={closePopup} className="text-gray-500">
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
                    onChange={(event) => setNewTaskName(event.target.value)}
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
                      onClick={() => setShowCalendar((prev) => !prev)}
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
                          onChange={(date: Date | null) => {
                            setSelectedDate(date);
                            if (date) {
                              setShowCalendar(false);
                            }
                          }}
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
                        onChange={(event) => setHour(event.target.value)}
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
                        onChange={(event) => setMinute(event.target.value)}
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
                <button
                  onClick={closePopup}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button onClick={addTodo} className="px-4 py-2 text-blue-600">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
