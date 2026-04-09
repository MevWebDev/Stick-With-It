"use client";
import React, { useEffect, useState } from "react";
import { TODO_TYPE, todoService } from "./ToDoService";
import ToDoItem from "./ToDoItem";
import ToDoPagination from "./ToDoPagination";
import ToDoSheet from "./ToDoSheet";
import ToDoSortControls from "./ToDoSortControls";
import { useAuth } from "../../lib/auth/authContext";
import {
  PAGE_SIZE,
  SortDirection,
  SortKey,
  buildDeadline,
  formatDeadline,
  paginateTodos,
  sortTodos,
} from "./ToDoUtils";

export default function ToDoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TODO_TYPE[]>([]);
  const [popUp, setPopUp] = useState<"addNew" | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }
    todoService.getTodos(user.id).then(setTodos);
  }, [user]);

  useEffect(() => {
    if (popUp === "addNew") {
      setIsSheetOpen(true);
    }
  }, [popUp]);

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
        const updated = await todoService.updateTodo(updatedTodo, user?.id);
        setTodos(updated);
      }
    } else {
      if (!user) {
        closePopup();
        return;
      }
      const todo: TODO_TYPE = {
        id: Date.now(),
        name: trimmedName,
        completed: false,
        deadline: buildDeadline(selectedDate, hour, minute),
        createdById: user.id,
        createdByUsername: user.username,
      };

      const added = await todoService.addTodo(todo, user.id);
      setTodos((prev) => [...prev, added]);
    }
    closePopup();
  };

  const toggleTodo = async (id: number) => {
    const updated = await todoService.toggleTodo(id, user?.id);
    setTodos(updated);
  };

  const deleteTodo = async (id: number) => {
    const updated = await todoService.deleteTodo(id, user?.id);
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

  const sortedTodos = sortTodos(todos, sortKey, sortDirection);
  const { totalPages, safePage, paginated } = paginateTodos(
    sortedTodos,
    currentPage,
    PAGE_SIZE,
  );

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setShowCalendar(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <button
        onClick={() => {
          setPopUp("addNew");
        }}
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white shadow-lg dark:!bg-gray-800"
        aria-label="Add todo"
      >
        +
      </button>

      <div className="mx-auto w-[90%] max-w-3xl space-y-3">
        <ToDoSortControls
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortKeyChange={(value) => {
            setSortKey(value);
            setCurrentPage(1);
          }}
          onSortDirectionChange={(value) => {
            setSortDirection(value);
            setCurrentPage(1);
          }}
        />

        <div
          className={
            paginated.length > 3
              ? "space-y-2 max-h-[60vh] overflow-y-auto"
              : "space-y-2"
          }
        >
          {paginated.map((todo) => (
            <ToDoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onEdit={startEdit}
              onRemove={deleteTodo}
              formatDeadline={formatDeadline}
            />
          ))}
        </div>

        <ToDoPagination
          safePage={safePage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      </div>

      <ToDoSheet
        isOpen={popUp === "addNew"}
        isSheetOpen={isSheetOpen}
        editingId={editingId}
        newTaskName={newTaskName}
        selectedDate={selectedDate}
        showCalendar={showCalendar}
        hour={hour}
        minute={minute}
        onClose={closePopup}
        onAdd={addTodo}
        onNameChange={setNewTaskName}
        onToggleCalendar={() => setShowCalendar((prev) => !prev)}
        onDateSelect={handleDateSelect}
        onHourChange={setHour}
        onMinuteChange={setMinute}
      />
    </div>
  );
}
