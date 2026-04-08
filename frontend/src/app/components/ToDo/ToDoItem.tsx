import React from "react";
import { TODO_TYPE } from "./ToDoService";

type Props = {
  todo: TODO_TYPE;
  onToggle: (id: number) => void;
  onEdit: (todo: TODO_TYPE) => void;
  onRemove: (id: number) => void;
  formatDeadline: (deadline: string | null) => string;
};

export default function ToDoItem({
  todo,
  onToggle,
  onEdit,
  onRemove,
  formatDeadline,
}: Props) {
  return (
    <div className="rounded border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="h-4 w-4 accent-blue-500"
          />
          <span
            className={
              todo.completed ? "text-gray-400 line-through" : "text-gray-800"
            }
          >
            {todo.name}
          </span>
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span className="text-gray-500">{formatDeadline(todo.deadline)}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(todo)} className="text-gray-600">
            Edit
          </button>
          <button onClick={() => onRemove(todo.id)} className="text-gray-600">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
