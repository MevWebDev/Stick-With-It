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
    <div className="rounded border border-gray-500 px-4 py-3 shadow-sm dark:border-gray-400">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="h-4 w-4"
          />
          <span className={todo.completed ? "line-through" : ""}>
            {todo.name}
          </span>
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>{formatDeadline(todo.deadline)}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(todo)}>Edit</button>
          <button onClick={() => onRemove(todo.id)}>Remove</button>
        </div>
      </div>
    </div>
  );
}
